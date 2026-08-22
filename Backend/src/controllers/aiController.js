const geminiService = require('../services/ai/geminiService');
const tripPlannerService = require('../services/ai/tripPlannerService');

/**
 * @desc    Test Gemini AI connectivity
 * @route   GET /api/ai/test
 * @access  Private (JWT Protected)
 */
const testGemini = async (req, res, next) => {
  try {
    const testPrompt = 'Reply with exactly: Musafir Buddy Gemini connection successful';
    const result = await geminiService.generateText(testPrompt);

    return res.status(200).json({
      success: true,
      message: 'Gemini API connection successful',
      data: {
        response: result.text
      }
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * @desc    Generate AI Trip Plan (Stage 1)
 * @route   POST /api/ai/trip-plan/generate
 * @access  Private (JWT Protected)
 */
const generateTripPlan = async (req, res, next) => {
  try {
    const result = await tripPlannerService.generatePlan(req.body, req.user._id);

    return res.status(200).json({
      success: true,
      message: 'AI trip plan generated successfully',
      data: {
        plan: result.plan,
        metadata: result.metadata
      }
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * @desc    Save AI Trip Plan to database (Stage 2)
 * @route   POST /api/ai/trip-plan/save
 * @access  Private (JWT Protected)
 */
const saveTripPlan = async (req, res, next) => {
  try {
    const result = await tripPlannerService.savePlan(req.body, req.user._id);

    return res.status(201).json({
      success: true,
      message: 'AI trip plan saved successfully',
      data: {
        trip: result.trip,
        stops: result.stops,
        activities: result.activities
      }
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

module.exports = {
  testGemini,
  generateTripPlan,
  saveTripPlan
};
