const geminiService = require('../services/ai/geminiService');

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

module.exports = {
  testGemini
};
