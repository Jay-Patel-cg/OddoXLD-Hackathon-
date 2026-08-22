const express = require('express');
const { testGemini, generateTripPlan, saveTripPlan } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply JWT protection middleware to all AI routes
router.use(protect);

/**
 * @route   GET /api/ai/test
 * @desc    Test endpoint for Gemini AI connection
 * @access  Private (JWT Protected)
 */
router.get('/test', testGemini);

/**
 * @route   POST /api/ai/trip-plan/generate
 * @desc    Generate structured AI Trip Plan (Stage 1)
 * @access  Private (JWT Protected)
 */
router.post('/trip-plan/generate', generateTripPlan);

/**
 * @route   POST /api/ai/trip-plan/save
 * @desc    Save AI Trip Plan to database (Stage 2)
 * @access  Private (JWT Protected)
 */
router.post('/trip-plan/save', saveTripPlan);

module.exports = router;
