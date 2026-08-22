const mongoose = require('mongoose');
const Trip = require('../../models/Trip');
const TripStop = require('../../models/TripStop');
const Activity = require('../../models/Activity');
const Expense = require('../../models/Expense');
const geminiService = require('./geminiService');
const aiActionValidator = require('./aiActionValidator');

const MODIFICATION_KEYWORDS = ['add', 'create', 'update', 'change', 'modify', 'delete', 'remove', 'cheaper', 'optimize', 'reduce', 'lower', 'cut', 'adjust', 'set', 'increase', 'decrease'];

/**
 * Format system prompt for AI Travel Copilot
 */
const buildAssistantPrompt = (userMessage, trip, stops, activities, expenses, summary) => {
  const tripInfo = {
    id: trip._id.toString(),
    title: trip.title,
    destination: trip.destination,
    startDate: trip.startDate ? trip.startDate.toISOString().split('T')[0] : '',
    endDate: trip.endDate ? trip.endDate.toISOString().split('T')[0] : '',
    budget: trip.budget,
    currency: trip.currency,
    organizer: trip.organizer.toString(),
    participantsCount: (trip.participants || []).length
  };

  const stopsList = stops.map(s => ({
    id: s._id.toString(),
    destination: s.destinationName || s.destination || '',
    arrivalDate: s.arrivalDate ? s.arrivalDate.toISOString().split('T')[0] : '',
    departureDate: s.departureDate ? s.departureDate.toISOString().split('T')[0] : ''
  }));

  const activitiesList = activities.map(a => ({
    id: a._id.toString(),
    title: a.title,
    description: a.description || '',
    date: a.date ? a.date.toISOString().split('T')[0] : '',
    startTime: a.startTime || '',
    endTime: a.endTime || '',
    location: a.location || '',
    estimatedCost: a.estimatedCost || 0,
    category: a.category || 'other',
    stopId: a.stop ? a.stop.toString() : null
  }));

  const expenseSummary = {
    totalBudget: trip.budget,
    totalExpensesLogged: summary.totalSpent,
    remainingBudget: summary.remaining,
    budgetUsedPercentage: summary.percentageUsed
  };

  return `
You are the AI Travel Copilot for Musafir Buddy, an intelligent travel planning system.

CONTEXT DATA:
TRIP: ${JSON.stringify(tripInfo)}
STOPS: ${JSON.stringify(stopsList)}
ACTIVITIES: ${JSON.stringify(activitiesList)}
EXPENSE SUMMARY: ${JSON.stringify(expenseSummary)}

USER MESSAGE:
"${userMessage}"

RULES:
1. Answer questions, provide recommendations, or propose safe itinerary changes based strictly on the context data.
2. Select exactly ONE action from: "ANSWER", "RECOMMEND", "ADD_ACTIVITY", "UPDATE_ACTIVITY", "DELETE_ACTIVITY", "OPTIMIZE_BUDGET".
3. Return ONLY valid JSON matching this exact structure:
{
  "action": "ANSWER" | "RECOMMEND" | "ADD_ACTIVITY" | "UPDATE_ACTIVITY" | "DELETE_ACTIVITY" | "OPTIMIZE_BUDGET",
  "message": "Direct, helpful, friendly message for the user",
  "reasoning": "Brief explanation of why this action was selected",
  "changes": [ ... array of changes (if applicable) ... ]
}

FOR CHANGES ARRAY:
- For ANSWER: changes must be an empty array []
- For RECOMMEND: changes can contain recommendation objects { title, description, category, estimatedCost }
- For ADD_ACTIVITY: changes contains array of new activity items { title, description, date (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm), location, estimatedCost, category, stopId }
- For UPDATE_ACTIVITY: changes contains array of { activityId, updates: { title, description, date, startTime, endTime, location, estimatedCost, category, stopId } }
- For DELETE_ACTIVITY: changes contains array of { activityId }
- For OPTIMIZE_BUDGET: changes contains array of activity updates to lower total estimated costs.

Return ONLY the raw JSON object. No Markdown code fences, no extra text.
`;
};

/**
 * Handle AI Assistant requests
 * @param {object} body - Request body containing { tripId, message }
 * @param {string|ObjectId} userId - Authenticated user ID
 */
const handleAssistantRequest = async (body = {}, userId) => {
  const { tripId, message } = body;

  if (!tripId) {
    const err = new Error('tripId is required');
    err.status = 400;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    const err = new Error('Invalid tripId format');
    err.status = 400;
    throw err;
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    const err = new Error('message is required and must be a non-empty string');
    err.status = 400;
    throw err;
  }

  // Step 1: Load Trip
  const trip = await Trip.findById(tripId);
  if (!trip) {
    const err = new Error('Trip not found');
    err.status = 404;
    throw err;
  }

  // Step 2: Check membership
  const userIdStr = userId.toString();
  const isOrganizer = trip.organizer.toString() === userIdStr;
  const isParticipant = (trip.participants || []).some(p => p.toString() === userIdStr);

  if (!isOrganizer && !isParticipant) {
    const err = new Error('Access denied: You are not a member of this trip');
    err.status = 403;
    throw err;
  }

  // Step 3: Load Trusted Trip Context
  const stops = await TripStop.find({ trip: trip._id }).sort({ order: 1 });
  const activities = await Activity.find({ trip: trip._id }).sort({ date: 1, order: 1 });
  const expenses = await Expense.find({ trip: trip._id });

  let totalSpent = 0;
  expenses.forEach(e => { totalSpent += Number(e.amount || 0); });
  const remaining = Number(trip.budget || 0) - totalSpent;
  const percentageUsed = trip.budget > 0 ? Number(((totalSpent / trip.budget) * 100).toFixed(2)) : 0;
  const summary = { totalSpent, remaining, percentageUsed };

  // Step 4: Build Gemini prompt & invoke AI
  const prompt = buildAssistantPrompt(message.trim(), trip, stops, activities, expenses, summary);
  const defaultActId = activities.length > 0 ? activities[0]._id.toString() : '';
  const aiResult = await geminiService.generateJSON(prompt, { defaultActId });

  // Guard: If user message has no modification intent, coerce hallucinated modification actions to ANSWER
  const cleanMessage = message.trim().toLowerCase();
  const isModificationIntent = MODIFICATION_KEYWORDS.some(kw => cleanMessage.includes(kw));

  if (!isModificationIntent && ['ADD_ACTIVITY', 'UPDATE_ACTIVITY', 'DELETE_ACTIVITY', 'OPTIMIZE_BUDGET'].includes(aiResult.data.action)) {
    aiResult.data.action = 'ANSWER';
    aiResult.data.changes = [];
  }

  // Step 5: Validate AI action and permissions
  const validatedAction = aiActionValidator.validateAIAction(aiResult.data, trip, stops, activities, isOrganizer);

  // Step 6: Execute validated database actions (if applicable)
  let executed = validatedAction.executed;

  if (executed) {
    if (validatedAction.action === 'ADD_ACTIVITY') {
      for (const item of validatedAction.changes) {
        await Activity.create({
          trip: trip._id,
          title: item.title,
          description: item.description || '',
          date: item.date,
          startTime: item.startTime || undefined,
          endTime: item.endTime || undefined,
          location: item.location || '',
          estimatedCost: item.estimatedCost || 0,
          currency: item.currency || trip.currency || 'INR',
          category: item.category || 'other',
          stop: item.stopId || null,
          createdBy: userId
        });
      }
    } else if (validatedAction.action === 'UPDATE_ACTIVITY' || validatedAction.action === 'OPTIMIZE_BUDGET') {
      for (const change of validatedAction.changes) {
        if (change.activityId && change.updates) {
          const act = await Activity.findOne({ _id: change.activityId, trip: trip._id });
          if (act) {
            Object.assign(act, change.updates);
            await act.save();
          }
        }
      }
    } else if (validatedAction.action === 'DELETE_ACTIVITY') {
      for (const change of validatedAction.changes) {
        if (change.activityId) {
          await Activity.deleteOne({ _id: change.activityId, trip: trip._id });
        }
      }
    }
  }

  return {
    action: validatedAction.action,
    response: validatedAction.message || 'AI Assistant request processed.',
    reasoning: validatedAction.reasoning || '',
    changes: validatedAction.changes,
    executed
  };
};

module.exports = {
  handleAssistantRequest,
  buildAssistantPrompt
};
