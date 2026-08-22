const express = require('express');
const { testGemini } = require('../controllers/aiController');
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

module.exports = router;
