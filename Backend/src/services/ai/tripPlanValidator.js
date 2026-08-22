const ALLOWED_TRAVEL_STYLES = ['budget', 'balanced', 'comfort', 'luxury', 'adventure', 'relaxed'];
const ALLOWED_ACTIVITY_CATEGORIES = [
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
 * Validate incoming request body for POST /api/ai/trip-plan/generate
 */
const validateGenerateInput = (body) => {
  if (!body || typeof body !== 'object') {
    const err = new Error('Invalid request body');
    err.status = 400;
    throw err;
  }

  const { destination, startDate, endDate, budget, currency, travelers, interests, travelStyle, additionalNotes } = body;

  if (!destination || typeof destination !== 'string' || !destination.trim()) {
    const err = new Error('destination is required and must be a non-empty string');
    err.status = 400;
    throw err;
  }

  if (!startDate || isNaN(Date.parse(startDate))) {
    const err = new Error('startDate is required and must be a valid date string (YYYY-MM-DD)');
    err.status = 400;
    throw err;
  }

  if (!endDate || isNaN(Date.parse(endDate))) {
    const err = new Error('endDate is required and must be a valid date string (YYYY-MM-DD)');
    err.status = 400;
    throw err;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    const err = new Error('endDate must be greater than or equal to startDate');
    err.status = 400;
    throw err;
  }

  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (diffDays > 90) {
    const err = new Error('Trip duration cannot exceed 90 days');
    err.status = 400;
    throw err;
  }

  if (budget === undefined || budget === null || typeof budget !== 'number' || isNaN(budget) || budget < 0) {
    const err = new Error('budget is required and must be a non-negative number');
    err.status = 400;
    throw err;
  }

  const travelersNum = travelers !== undefined ? parseInt(travelers, 10) : 1;
  if (isNaN(travelersNum) || travelersNum < 1) {
    const err = new Error('travelers must be an integer greater than or equal to 1');
    err.status = 400;
    throw err;
  }

  const style = travelStyle ? String(travelStyle).toLowerCase().trim() : 'balanced';
  if (!ALLOWED_TRAVEL_STYLES.includes(style)) {
    const err = new Error(`travelStyle must be one of: ${ALLOWED_TRAVEL_STYLES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  let interestsArr = [];
  if (interests !== undefined) {
    if (!Array.isArray(interests)) {
      const err = new Error('interests must be an array of strings');
      err.status = 400;
      throw err;
    }
    interestsArr = interests.map(i => String(i).trim()).filter(Boolean);
  }

  return {
    destination: destination.trim(),
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    budget: Number(budget),
    currency: currency ? String(currency).toUpperCase().trim() : 'INR',
    travelers: travelersNum,
    interests: interestsArr,
    travelStyle: style,
    additionalNotes: additionalNotes ? String(additionalNotes).trim() : ''
  };
};

/**
 * Validate and sanitize AI-generated plan JSON response against backend requirements
 */
const validateAIResponse = (aiData, context) => {
  if (!aiData || typeof aiData !== 'object') {
    const err = new Error('AI generated invalid or non-object response');
    err.status = 502;
    throw err;
  }

  const tripTitle = (aiData.trip && aiData.trip.title) ? String(aiData.trip.title).trim() : `${context.destination} Trip`;
  const tripDesc = (aiData.trip && aiData.trip.description) ? String(aiData.trip.description).trim() : `AI-generated itinerary for ${context.destination}`;
  
  const tripStartDate = context.startDate;
  const tripEndDate = context.endDate;
  const requestedBudget = context.budget;
  const currency = context.currency;

  const rawStops = Array.isArray(aiData.stops) ? aiData.stops : [];
  if (rawStops.length === 0) {
    rawStops.push({
      cityName: context.destination,
      country: '',
      arrivalDate: tripStartDate,
      departureDate: tripEndDate,
      notes: `Main stop in ${context.destination}`,
      order: 0,
      activities: []
    });
  }

  let totalEstimatedActivityCost = 0;
  const validatedStops = [];

  rawStops.forEach((stop, stopIdx) => {
    const cityName = (stop.cityName && typeof stop.cityName === 'string') ? stop.cityName.trim() : context.destination;
    const countryName = (stop.country && typeof stop.country === 'string') ? stop.country.trim() : '';

    let arrDateStr = (stop.arrivalDate && !isNaN(Date.parse(stop.arrivalDate))) ? new Date(stop.arrivalDate).toISOString().split('T')[0] : tripStartDate;
    let depDateStr = (stop.departureDate && !isNaN(Date.parse(stop.departureDate))) ? new Date(stop.departureDate).toISOString().split('T')[0] : tripEndDate;

    if (new Date(arrDateStr) < new Date(tripStartDate)) arrDateStr = tripStartDate;
    if (new Date(depDateStr) > new Date(tripEndDate)) depDateStr = tripEndDate;
    if (new Date(depDateStr) < new Date(arrDateStr)) depDateStr = arrDateStr;

    const validatedActivities = [];
    const rawActs = Array.isArray(stop.activities) ? stop.activities : [];

    rawActs.forEach((act, actIdx) => {
      const actTitle = (act.title && typeof act.title === 'string') ? act.title.trim() : `Activity ${actIdx + 1}`;
      const actDesc = (act.description && typeof act.description === 'string') ? act.description.trim() : '';
      const actLoc = (act.location && typeof act.location === 'string') ? act.location.trim() : cityName;

      let actDateStr = (act.date && !isNaN(Date.parse(act.date))) ? new Date(act.date).toISOString().split('T')[0] : arrDateStr;
      if (new Date(actDateStr) < new Date(arrDateStr) || new Date(actDateStr) > new Date(depDateStr)) {
        actDateStr = arrDateStr;
      }

      let cost = (act.estimatedCost !== undefined && !isNaN(Number(act.estimatedCost))) ? Math.max(0, Number(act.estimatedCost)) : 0;
      totalEstimatedActivityCost += cost;

      let category = (act.category && typeof act.category === 'string') ? act.category.toLowerCase().trim() : 'sightseeing';
      if (category === 'cultural' || category === 'culture') {
        category = 'sightseeing';
      }
      if (!ALLOWED_ACTIVITY_CATEGORIES.includes(category)) {
        category = 'other';
      }

      let startTime = (act.startTime && typeof act.startTime === 'string' && TIME_REGEX.test(act.startTime.trim())) ? act.startTime.trim() : '09:00';
      let endTime = (act.endTime && typeof act.endTime === 'string' && TIME_REGEX.test(act.endTime.trim())) ? act.endTime.trim() : '11:00';

      if (startTime >= endTime) {
        endTime = '18:00';
      }

      validatedActivities.push({
        title: actTitle,
        description: actDesc,
        location: actLoc,
        date: actDateStr,
        startTime,
        endTime,
        estimatedCost: cost,
        currency,
        category,
        notes: act.notes ? String(act.notes).trim() : '',
        order: actIdx
      });
    });

    validatedStops.push({
      cityName,
      country: countryName,
      arrivalDate: arrDateStr,
      departureDate: depDateStr,
      notes: stop.notes ? String(stop.notes).trim() : '',
      order: stopIdx,
      activities: validatedActivities
    });
  });

  const remainingBudget = requestedBudget - totalEstimatedActivityCost;
  const isOverBudget = totalEstimatedActivityCost > requestedBudget;
  const percentageOfBudget = requestedBudget > 0 ? Number(((totalEstimatedActivityCost / requestedBudget) * 100).toFixed(2)) : 0;

  return {
    plan: {
      trip: {
        title: tripTitle,
        destination: context.destination,
        description: tripDesc,
        startDate: tripStartDate,
        endDate: tripEndDate,
        budget: requestedBudget,
        currency
      },
      summary: {
        estimatedTotalCost: totalEstimatedActivityCost,
        remainingBudget,
        percentageOfBudget,
        isOverBudget,
        reasoning: (aiData.summary && aiData.summary.reasoning) ? String(aiData.summary.reasoning).trim() : 'AI planned itinerary within requested parameters.'
      },
      stops: validatedStops
    },
    metadata: {
      estimatedActivityCost: totalEstimatedActivityCost,
      requestedBudget,
      remainingBudget,
      isOverBudget
    }
  };
};

/**
 * Strict validation for payload submitted to POST /api/ai/trip-plan/save
 * NO silent sanitization — malformed items throw 400 Bad Request error!
 */
const validateSavePayload = (body) => {
  if (!body || typeof body !== 'object') {
    const err = new Error('Save payload must be an object');
    err.status = 400;
    throw err;
  }

  const planObj = body.plan ? body.plan : body;

  if (!planObj.trip || typeof planObj.trip !== 'object') {
    const err = new Error('Invalid save payload: plan.trip object is required');
    err.status = 400;
    throw err;
  }

  if (!planObj.stops || !Array.isArray(planObj.stops) || planObj.stops.length === 0) {
    const err = new Error('Invalid save payload: plan.stops must be a non-empty array');
    err.status = 400;
    throw err;
  }

  const { title, destination, startDate, endDate, budget, currency, description } = planObj.trip;

  if (!destination || typeof destination !== 'string' || !destination.trim()) {
    const err = new Error('trip.destination is required and must be a non-empty string');
    err.status = 400;
    throw err;
  }

  if (!startDate || isNaN(Date.parse(startDate))) {
    const err = new Error('trip.startDate is required and must be a valid date');
    err.status = 400;
    throw err;
  }

  if (!endDate || isNaN(Date.parse(endDate))) {
    const err = new Error('trip.endDate is required and must be a valid date');
    err.status = 400;
    throw err;
  }

  const tripStart = new Date(startDate);
  const tripEnd = new Date(endDate);

  if (tripEnd < tripStart) {
    const err = new Error('trip.endDate cannot be before trip.startDate');
    err.status = 400;
    throw err;
  }

  if (budget === undefined || budget === null || typeof budget !== 'number' || isNaN(budget) || budget < 0) {
    const err = new Error('trip.budget must be a non-negative number');
    err.status = 400;
    throw err;
  }

  // Validate stops & activities strictly
  const stopSet = new Set();

  for (let i = 0; i < planObj.stops.length; i++) {
    const stop = planObj.stops[i];

    if (!stop || typeof stop !== 'object') {
      const err = new Error(`Stop at index ${i} is invalid`);
      err.status = 400;
      throw err;
    }

    if (!stop.cityName || typeof stop.cityName !== 'string' || !stop.cityName.trim()) {
      const err = new Error(`Stop at index ${i} requires a non-empty cityName`);
      err.status = 400;
      throw err;
    }

    if (!stop.arrivalDate || isNaN(Date.parse(stop.arrivalDate))) {
      const err = new Error(`Stop at index ${i} requires a valid arrivalDate`);
      err.status = 400;
      throw err;
    }

    if (!stop.departureDate || isNaN(Date.parse(stop.departureDate))) {
      const err = new Error(`Stop at index ${i} requires a valid departureDate`);
      err.status = 400;
      throw err;
    }

    const stopArr = new Date(stop.arrivalDate);
    const stopDep = new Date(stop.departureDate);

    if (stopDep < stopArr) {
      const err = new Error(`Stop "${stop.cityName}" departureDate cannot be before arrivalDate`);
      err.status = 400;
      throw err;
    }

    if (stopArr < tripStart) {
      const err = new Error(`Stop "${stop.cityName}" arrivalDate is outside Trip date range`);
      err.status = 400;
      throw err;
    }

    if (stopDep > tripEnd) {
      const err = new Error(`Stop "${stop.cityName}" departureDate is outside Trip date range`);
      err.status = 400;
      throw err;
    }

    // Check duplicate stop key
    const stopKey = `${stop.cityName.toLowerCase()}_${stopArr.toISOString()}_${stopDep.toISOString()}`;
    if (stopSet.has(stopKey)) {
      const err = new Error(`Duplicate stop definition found for ${stop.cityName}`);
      err.status = 400;
      throw err;
    }
    stopSet.add(stopKey);

    // Validate activities inside stop
    const activities = Array.isArray(stop.activities) ? stop.activities : [];
    const activitySet = new Set();

    for (let j = 0; j < activities.length; j++) {
      const act = activities[j];

      if (!act || typeof act !== 'object') {
        const err = new Error(`Activity at index ${j} in stop "${stop.cityName}" is invalid`);
        err.status = 400;
        throw err;
      }

      if (!act.title || typeof act.title !== 'string' || !act.title.trim()) {
        const err = new Error(`Activity at index ${j} in stop "${stop.cityName}" requires a non-empty title`);
        err.status = 400;
        throw err;
      }

      if (!act.date || isNaN(Date.parse(act.date))) {
        const err = new Error(`Activity "${act.title}" requires a valid date`);
        err.status = 400;
        throw err;
      }

      const actDate = new Date(act.date);
      if (actDate < stopArr || actDate > stopDep) {
        const err = new Error(`Activity "${act.title}" date (${act.date}) is outside Stop date range [${stop.arrivalDate}, ${stop.departureDate}]`);
        err.status = 400;
        throw err;
      }

      const costVal = act.estimatedCost !== undefined ? act.estimatedCost : act.cost;
      if (costVal === undefined || typeof costVal !== 'number' || isNaN(costVal) || costVal < 0) {
        const err = new Error(`Activity "${act.title}" estimatedCost cannot be negative or invalid`);
        err.status = 400;
        throw err;
      }

      const categoryStr = act.category ? String(act.category).toLowerCase().trim() : 'sightseeing';
      if (!ALLOWED_ACTIVITY_CATEGORIES.includes(categoryStr)) {
        const err = new Error(`Activity "${act.title}" category "${act.category}" is invalid. Must be one of: ${ALLOWED_ACTIVITY_CATEGORIES.join(', ')}`);
        err.status = 400;
        throw err;
      }

      if (act.startTime && !TIME_REGEX.test(String(act.startTime).trim())) {
        const err = new Error(`Activity "${act.title}" startTime must be in HH:mm 24-hour format`);
        err.status = 400;
        throw err;
      }

      if (act.endTime && !TIME_REGEX.test(String(act.endTime).trim())) {
        const err = new Error(`Activity "${act.title}" endTime must be in HH:mm 24-hour format`);
        err.status = 400;
        throw err;
      }

      if (act.startTime && act.endTime) {
        const sTime = String(act.startTime).trim();
        const eTime = String(act.endTime).trim();
        if (sTime >= eTime) {
          const err = new Error(`Activity "${act.title}" endTime (${eTime}) must be after startTime (${sTime})`);
          err.status = 400;
          throw err;
        }
      }

      // Check duplicate activity inside same stop
      const actKey = `${act.title.toLowerCase()}_${actDate.toISOString()}_${act.startTime || ''}`;
      if (activitySet.has(actKey)) {
        const err = new Error(`Duplicate activity "${act.title}" found in stop "${stop.cityName}"`);
        err.status = 400;
        throw err;
      }
      activitySet.add(actKey);
    }
  }

  // Authoritative budget calculation for plan summary
  let totalCost = 0;
  planObj.stops.forEach(s => {
    (s.activities || []).forEach(a => {
      totalCost += Number(a.estimatedCost !== undefined ? a.estimatedCost : (a.cost || 0));
    });
  });

  const remainingBudget = Number(budget) - totalCost;
  const isOverBudget = totalCost > Number(budget);
  const percentageOfBudget = Number(budget) > 0 ? Number(((totalCost / Number(budget)) * 100).toFixed(2)) : 0;

  // Overwrite client summary with backend authoritative calculation!
  planObj.summary = {
    estimatedTotalCost: totalCost,
    remainingBudget,
    percentageOfBudget,
    isOverBudget,
    reasoning: (planObj.summary && planObj.summary.reasoning) ? String(planObj.summary.reasoning).trim() : 'Authoritative backend budget calculation.'
  };

  return planObj;
};

module.exports = {
  ALLOWED_TRAVEL_STYLES,
  ALLOWED_ACTIVITY_CATEGORIES,
  validateGenerateInput,
  validateAIResponse,
  validateSavePayload
};
