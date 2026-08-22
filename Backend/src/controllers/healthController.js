/**
 * @desc    Get API health status
 * @route   GET /api/health
 * @access  Public
 */
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Musafir Buddy API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealth
};
