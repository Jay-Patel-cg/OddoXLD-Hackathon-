const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const tripRoutes = require('./tripRoutes');
const activityRoutes = require('./activityRoutes');

const router = express.Router();

// Health Check Route -> /api/health
router.use('/health', healthRoutes);

// Auth Routes -> /api/auth
router.use('/auth', authRoutes);

// Trip Routes -> /api/trips
router.use('/trips', tripRoutes);

// Activity Routes -> /api/trips/:tripId/activities & /api/activities/:id
router.use('/', activityRoutes);

// Future API route mounts:
// router.use('/destinations', destinationRoutes);
// router.use('/expenses', expenseRoutes);

module.exports = router;
