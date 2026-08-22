const mongoose = require('mongoose');

const ALLOWED_ACTIONS = [
  'ANSWER',
  'RECOMMEND',
  'ADD_ACTIVITY',
  'UPDATE_ACTIVITY',
  'DELETE_ACTIVITY',
  'OPTIMIZE_BUDGET'
];

const ALLOWED_CATEGORIES = [
  'food',
  'sightseeing',
  'transport',
  'hotel',
  'shopping',
  'entertainment',
  'adventure',
  'relaxation',
  'other'
];

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Validate action response from Gemini against trip context and permissions
 */
const validateAIAction = (aiResponse, trip, stops, activities, isOrganizer) => {
  if (!aiResponse || typeof aiResponse !== 'object') {
    const err = new Error('AI returned an invalid non-object response');
    err.status = 502;
    throw err;
  }

  const action = String(aiResponse.action || 'ANSWER').toUpperCase().trim();
  if (!ALLOWED_ACTIONS.includes(action)) {
    const err = new Error(`Invalid AI action type: ${aiResponse.action}`);
    err.status = 400;
    throw err;
  }

  const message = (aiResponse.message || aiResponse.response || '').trim();
  const reasoning = (aiResponse.reasoning || '').trim();
  const changes = Array.isArray(aiResponse.changes) ? aiResponse.changes : [];

  // Authorization check for modifications
  const isModificationAction = ['ADD_ACTIVITY', 'UPDATE_ACTIVITY', 'DELETE_ACTIVITY', 'OPTIMIZE_BUDGET'].includes(action);
  if (isModificationAction && !isOrganizer) {
    const err = new Error('Access denied: Only the trip organizer can modify activities via AI Assistant');
    err.status = 403;
    throw err;
  }

  const validatedChanges = [];

  if (action === 'ANSWER') {
    return { action, message, reasoning, changes: [], executed: false };
  }

  if (action === 'RECOMMEND') {
    changes.forEach(rec => {
      if (rec && typeof rec === 'object') {
        validatedChanges.push({
          type: 'recommendation',
          title: rec.title ? String(rec.title).trim() : 'Recommendation',
          description: rec.description ? String(rec.description).trim() : '',
          estimatedCost: Math.max(0, Number(rec.estimatedCost || 0)),
          category: ALLOWED_CATEGORIES.includes(String(rec.category).toLowerCase().trim()) ? String(rec.category).toLowerCase().trim() : 'sightseeing'
        });
      }
    });
    return { action, message, reasoning, changes: validatedChanges, executed: false };
  }

  const tripStart = new Date(trip.startDate);
  const tripEnd = new Date(trip.endDate);
  tripStart.setHours(0, 0, 0, 0);
  tripEnd.setHours(23, 59, 59, 999);

  const existingStopIds = stops.map(s => s._id.toString());
  const existingActMap = new Map(activities.map(a => [a._id.toString(), a]));

  if (action === 'ADD_ACTIVITY') {
    for (const change of changes) {
      if (!change || typeof change !== 'object') continue;

      if (!change.title || typeof change.title !== 'string' || !change.title.trim()) {
        const err = new Error('Added activity requires a title');
        err.status = 400;
        throw err;
      }

      let actDate = change.date ? new Date(change.date) : new Date(trip.startDate);
      if (isNaN(actDate.getTime())) {
        const err = new Error(`Invalid activity date: ${change.date}`);
        err.status = 400;
        throw err;
      }

      if (actDate < tripStart || actDate > tripEnd) {
        const err = new Error(`Activity date (${change.date}) falls outside trip date range`);
        err.status = 400;
        throw err;
      }

      let stopId = change.stopId || null;
      if (stopId && String(stopId).trim() !== '' && String(stopId).trim() !== 'null') {
        const stopIdStr = String(stopId).trim();
        if (!mongoose.Types.ObjectId.isValid(stopIdStr)) {
          const err = new Error(`Invalid stop ID format: ${stopId}`);
          err.status = 400;
          throw err;
        }
        if (!existingStopIds.includes(stopIdStr)) {
          const err = new Error(`Stop ID ${stopId} does not belong to this trip`);
          err.status = 400;
          throw err;
        }

        const linkedStop = stops.find(s => s._id.toString() === stopIdStr);
        if (linkedStop) {
          const stopArr = new Date(linkedStop.arrivalDate);
          const stopDep = new Date(linkedStop.departureDate);
          stopArr.setHours(0, 0, 0, 0);
          stopDep.setHours(23, 59, 59, 999);
          if (actDate < stopArr || actDate > stopDep) {
            const err = new Error(`Activity date (${change.date}) falls outside linked stop date range`);
            err.status = 400;
            throw err;
          }
        }
      } else {
        stopId = null;
      }

      let cost = change.estimatedCost !== undefined ? Number(change.estimatedCost) : 0;
      if (isNaN(cost) || cost < 0) {
        const err = new Error(`Activity estimatedCost cannot be negative: ${change.estimatedCost}`);
        err.status = 400;
        throw err;
      }

      let category = change.category ? String(change.category).toLowerCase().trim() : 'other';
      if (!ALLOWED_CATEGORIES.includes(category)) {
        const err = new Error(`Invalid activity category: ${change.category}`);
        err.status = 400;
        throw err;
      }

      let startTime = change.startTime ? String(change.startTime).trim() : '09:00';
      let endTime = change.endTime ? String(change.endTime).trim() : '11:00';

      if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
        const err = new Error('Activity times must be in HH:mm 24-hour format');
        err.status = 400;
        throw err;
      }

      if (startTime >= endTime) {
        const err = new Error(`Activity endTime (${endTime}) must be after startTime (${startTime})`);
        err.status = 400;
        throw err;
      }

      validatedChanges.push({
        title: change.title.trim(),
        description: change.description ? String(change.description).trim() : '',
        date: actDate.toISOString().split('T')[0],
        startTime,
        endTime,
        location: change.location ? String(change.location).trim() : trip.destination,
        estimatedCost: cost,
        currency: change.currency ? String(change.currency).toUpperCase().trim() : (trip.currency || 'INR'),
        category,
        stopId
      });
    }
    return { action, message, reasoning, changes: validatedChanges, executed: true };
  }

  if (action === 'UPDATE_ACTIVITY') {
    for (const change of changes) {
      if (!change || typeof change !== 'object' || !change.activityId) {
        const err = new Error('UPDATE_ACTIVITY requires an activityId');
        err.status = 400;
        throw err;
      }

      const actIdStr = String(change.activityId).trim();
      if (!mongoose.Types.ObjectId.isValid(actIdStr) || !existingActMap.has(actIdStr)) {
        const err = new Error(`Activity ID ${change.activityId} does not belong to this trip`);
        err.status = 400;
        throw err;
      }

      const updates = change.updates || {};

      if (updates.date) {
        const actDate = new Date(updates.date);
        if (isNaN(actDate.getTime()) || actDate < tripStart || actDate > tripEnd) {
          const err = new Error(`Updated activity date (${updates.date}) falls outside trip date range`);
          err.status = 400;
          throw err;
        }
      }

      if (updates.estimatedCost !== undefined) {
        const cost = Number(updates.estimatedCost);
        if (isNaN(cost) || cost < 0) {
          const err = new Error(`Updated estimatedCost cannot be negative: ${updates.estimatedCost}`);
          err.status = 400;
          throw err;
        }
      }

      if (updates.category) {
        const cat = String(updates.category).toLowerCase().trim();
        if (!ALLOWED_CATEGORIES.includes(cat)) {
          const err = new Error(`Invalid updated activity category: ${updates.category}`);
          err.status = 400;
          throw err;
        }
      }

      if (updates.startTime && !TIME_REGEX.test(String(updates.startTime).trim())) {
        const err = new Error('Updated startTime must be in HH:mm 24-hour format');
        err.status = 400;
        throw err;
      }

      if (updates.endTime && !TIME_REGEX.test(String(updates.endTime).trim())) {
        const err = new Error('Updated endTime must be in HH:mm 24-hour format');
        err.status = 400;
        throw err;
      }

      validatedChanges.push({
        activityId: actIdStr,
        updates
      });
    }
    return { action, message, reasoning, changes: validatedChanges, executed: true };
  }

  if (action === 'DELETE_ACTIVITY') {
    for (const change of changes) {
      if (!change || typeof change !== 'object' || !change.activityId) {
        const err = new Error('DELETE_ACTIVITY requires an activityId');
        err.status = 400;
        throw err;
      }

      const actIdStr = String(change.activityId).trim();
      if (!mongoose.Types.ObjectId.isValid(actIdStr) || !existingActMap.has(actIdStr)) {
        const err = new Error(`Activity ID ${change.activityId} does not belong to this trip`);
        err.status = 400;
        throw err;
      }

      validatedChanges.push({ activityId: actIdStr });
    }
    return { action, message, reasoning, changes: validatedChanges, executed: true };
  }

  if (action === 'OPTIMIZE_BUDGET') {
    for (const change of changes) {
      if (!change || typeof change !== 'object') continue;

      const actIdStr = String(change.activityId || (change.updates && change.updates.activityId) || '').trim();
      if (!mongoose.Types.ObjectId.isValid(actIdStr) || !existingActMap.has(actIdStr)) {
        const err = new Error(`Activity ID ${actIdStr} does not belong to this trip`);
        err.status = 400;
        throw err;
      }

      const updates = change.updates || {};
      const newCost = updates.estimatedCost !== undefined ? Number(updates.estimatedCost) : Number(change.estimatedCost);

      if (isNaN(newCost) || newCost < 0) {
        const err = new Error('Optimized estimatedCost cannot be negative');
        err.status = 400;
        throw err;
      }

      validatedChanges.push({
        type: 'update_activity',
        activityId: actIdStr,
        updates: { estimatedCost: newCost }
      });
    }
    return { action, message, reasoning, changes: validatedChanges, executed: true };
  }

  return { action, message, reasoning, changes: [], executed: false };
};

module.exports = {
  ALLOWED_ACTIONS,
  ALLOWED_CATEGORIES,
  validateAIAction
};
