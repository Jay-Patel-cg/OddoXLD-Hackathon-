const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Validates JWT authorization header (Bearer <token>) and populates req.user.
 */
const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.trim().split(/\s+/);
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1].trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[AuthMiddleware Error] JWT_SECRET environment variable is missing.');
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authentication'
      });
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user no longer exists'
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error(`[AuthMiddleware Error] ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token validation failed'
    });
  }
};

module.exports = {
  protect
};
