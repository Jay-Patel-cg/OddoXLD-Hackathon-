const Destination = require('../../models/Destination');
const Trip = require('../../models/Trip');
const TripStop = require('../../models/TripStop');
const Activity = require('../../models/Activity');
const User = require('../../models/User');
const geminiService = require('./geminiService');
const tripPlanValidator = require('./tripPlanValidator');

const ALLOWED_ACTIVITY_CATEGORIES = tripPlanValidator.ALLOWED_ACTIVITY_CATEGORIES;

/**
 * Build structured prompt for Gemini AI Travel Planner
 */
const buildPrompt = (context, destRecord) => {
  let destContextText = '';
  if (destRecord) {
    destContextText = `
TRUSTED DESTINATION DATA FROM DATABASE:
- Name: ${destRecord.name}
- Country: ${destRecord.country}
- Region: ${destRecord.region || 'N/A'}
- Cost Rating: ${destRecord.costIndex} / 5
- Popular Categories: ${(destRecord.popularCategories || []).join(', ')}
- Best Time to Visit: ${destRecord.bestTimeToVisit || 'N/A'}
- Description: ${destRecord.description || ''}
`;
  }

  return `
You are the Musafir Buddy AI Travel Planner.
Your task is to generate a realistic, structured, day-by-day travel itinerary for a trip.

TRIP REQUIREMENTS:
- Destination: ${context.destination}
- Start Date: ${context.startDate}
- End Date: ${context.endDate}
- Total Budget: ${context.budget} ${context.currency}
- Number of Travelers: ${context.travelers}
- Travel Style: ${context.travelStyle}
- Traveler Interests: ${context.interests.length > 0 ? context.interests.join(', ') : 'general sightseeing'}
${context.additionalNotes ? `- Special Instructions: ${context.additionalNotes}` : ''}
${destContextText}

CRITICAL RULES:
1. Do NOT invent database IDs, MongoDB ObjectIds, or user references anywhere in the JSON output.
2. Return ONLY a JSON object with the exact structure below.
3. Every activity cost must be realistic and non-negative.
4. Total estimated activity cost across all activities should aim to fit within the budget of ${context.budget} ${context.currency}.
5. Activities must fall strictly between ${context.startDate} and ${context.endDate}.
6. Activity categories must be one of: food, sightseeing, transport, hotel, shopping, entertainment, adventure, relaxation, other.
7. Provide logical start and end times in HH:MM format (e.g. "09:00", "11:30").

REQUIRED JSON STRUCTURE:
{
  "trip": {
    "title": "Short Catchy Trip Title",
    "destination": "${context.destination}",
    "description": "2-3 sentence overview of the trip"
  },
  "summary": {
    "reasoning": "Explanation of itinerary design and budget strategy"
  },
  "stops": [
    {
      "cityName": "${context.destination}",
      "country": "${destRecord ? destRecord.country : ''}",
      "arrivalDate": "${context.startDate}",
      "departureDate": "${context.endDate}",
      "notes": "Overview for this city stop",
      "order": 0,
      "activities": [
        {
          "title": "Activity Name",
          "description": "Brief activity description",
          "location": "Location or spot name",
          "date": "${context.startDate}",
          "startTime": "09:30",
          "endTime": "11:30",
          "estimatedCost": 500,
          "category": "sightseeing",
          "notes": "Tips or notes",
          "order": 0
        }
      ]
    }
  ]
}
`.trim();
};

/**
 * Generate AI Trip Plan (Stage 1)
 */
const generatePlan = async (inputBody, userId) => {
  // Step 1: Validate input
  const context = tripPlanValidator.validateGenerateInput(inputBody);

  // Step 2: Query Destination model for trusted context
  let destRecord = null;
  try {
    destRecord = await Destination.findOne({
      name: new RegExp(`^${context.destination}$`, 'i'),
      isActive: true
    });
    if (!destRecord) {
      destRecord = await Destination.findOne({
        $text: { $search: context.destination },
        isActive: true
      });
    }
  } catch (e) { }

  // Step 3: Build prompt and call Gemini AI
  const prompt = buildPrompt(context, destRecord);
  const aiResult = await geminiService.generateJSON(prompt);

  // Step 4: Validate AI output and calculate budget metrics authoritatively
  const validatedResult = tripPlanValidator.validateAIResponse(aiResult.data, context);
  validatedResult.metadata.model = aiResult.model;

  return validatedResult;
};

/**
 * Save AI Trip Plan to MongoDB (Stage 2)
 * Note: Compensating rollback strategy is used because MongoDB transactions are unavailable in standalone server environment.
 */
const savePlan = async (savePayload, userId) => {
  // Step 1: Validate save payload strictly (throws 400 Bad Request if invalid)
  const planData = tripPlanValidator.validateSavePayload(savePayload);
  const tripInfo = planData.trip;
  const stopsInfo = planData.stops;

  // Step 2: Verify authenticated user exists
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  // Step 3: Perform creation with compensating rollback strategy
  let createdTrip = null;
  const createdStops = [];
  const createdActivities = [];

  try {
    // 3a. Create Trip document — Always set organizer to authenticated userId (ignore spoofed organizer!)
    createdTrip = await Trip.create({
      title: tripInfo.title ? tripInfo.title.trim() : `${tripInfo.destination} Trip`,
      destination: tripInfo.destination.trim(),
      description: tripInfo.description ? tripInfo.description.trim() : '',
      startDate: new Date(tripInfo.startDate),
      endDate: new Date(tripInfo.endDate),
      budget: Number(tripInfo.budget),
      currency: tripInfo.currency ? tripInfo.currency.toUpperCase().trim() : 'INR',
      organizer: userId,
      participants: [userId]
    });

    // 3b. Create Stops and Activities
    for (let i = 0; i < stopsInfo.length; i++) {
      const s = stopsInfo[i];

      let destRecord = await Destination.findOne({ name: new RegExp(`^${s.cityName}$`, 'i'), isActive: true });
      if (!destRecord) {
        destRecord = await Destination.findOne({ name: new RegExp(`^${tripInfo.destination}$`, 'i'), isActive: true });
      }
      if (!destRecord) {
        destRecord = await Destination.findOne({ isActive: true });
      }

      if (!destRecord) {
        const err = new Error(`No destination found in system to match stop ${s.cityName}`);
        err.status = 400;
        throw err;
      }

      const createdStop = await TripStop.create({
        trip: createdTrip._id,
        destination: destRecord._id,
        cityName: s.cityName || destRecord.name,
        country: s.country || destRecord.country,
        arrivalDate: new Date(s.arrivalDate),
        departureDate: new Date(s.departureDate),
        notes: s.notes || '',
        order: s.order !== undefined ? s.order : i
      });
      createdStops.push(createdStop);

      const activitiesArr = Array.isArray(s.activities) ? s.activities : [];
      for (let j = 0; j < activitiesArr.length; j++) {
        const act = activitiesArr[j];
        const costVal = (act.estimatedCost !== undefined) ? Number(act.estimatedCost) : (act.cost !== undefined ? Number(act.cost) : 0);

        const createdAct = await Activity.create({
          trip: createdTrip._id,
          stop: createdStop._id,
          title: act.title ? act.title.trim() : `Activity ${j + 1}`,
          description: act.description ? act.description.trim() : '',
          location: act.location ? act.location.trim() : s.cityName,
          date: new Date(act.date),
          startTime: act.startTime || '09:00',
          endTime: act.endTime || '11:00',
          estimatedCost: costVal,
          category: act.category ? String(act.category).toLowerCase().trim() : 'other',
          notes: act.notes || '',
          order: act.order !== undefined ? act.order : j
        });
        createdActivities.push(createdAct);
      }
    }

    return {
      trip: createdTrip,
      stops: createdStops,
      activities: createdActivities
    };
  } catch (saveError) {
    // Compensating rollback cleanup on error
    if (createdTrip) {
      try {
        await Activity.deleteMany({ trip: createdTrip._id });
        await TripStop.deleteMany({ trip: createdTrip._id });
        await Trip.findByIdAndDelete(createdTrip._id);
      } catch (cleanupErr) { }
    }
    throw saveError;
  }
};

module.exports = {
  buildPrompt,
  generatePlan,
  savePlan
};
