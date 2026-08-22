const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const tripRoutes = require('./tripRoutes');

const router = express.Router();

// Health Check Route -> /api/health
router.use('/health', healthRoutes);

// Auth Routes -> /api/auth
router.use('/auth', authRoutes);

// Trip Routes -> /api/trips
router.use('/trips', tripRoutes);

// Future API route mounts:
// router.use('/destinations', destinationRoutes);
// router.use('/itineraries', itineraryRoutes);
// router.use('/activities', activityRoutes);
// router.use('/expenses', expenseRoutes);

module.exports = router;
