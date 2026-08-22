const express = require('express');
const { register, login, getMe, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

// Protected auth route
router.get('/me', protect, getMe);

module.exports = router;

