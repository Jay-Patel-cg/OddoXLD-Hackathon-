const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

// Health Check Route -> /api/health
router.use('/health', healthRoutes);

// Auth Routes -> /api/auth
router.use('/auth', authRoutes);

// Future API route mounts:
// router.use('/users', userRoutes);
// router.use('/trips', tripRoutes);
// router.use('/destinations', destinationRoutes);
// router.use('/itineraries', itineraryRoutes);
// router.use('/activities', activityRoutes);
// router.use('/expenses', expenseRoutes);

module.exports = router;
