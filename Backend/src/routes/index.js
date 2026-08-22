const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const tripRoutes = require('./tripRoutes');
const activityRoutes = require('./activityRoutes');
const expenseRoutes = require('./expenseRoutes');
const destinationRoutes = require('./destinationRoutes');
const tripStopRoutes = require('./tripStopRoutes');
const aiRoutes = require('./aiRoutes');

const router = express.Router();

// Health Check Route -> /api/health
router.use('/health', healthRoutes);

// Auth Routes -> /api/auth
router.use('/auth', authRoutes);

// Destination Routes -> /api/destinations
router.use('/destinations', destinationRoutes);

// AI Routes -> /api/ai
router.use('/ai', aiRoutes);

// Trip Routes -> /api/trips
router.use('/trips', tripRoutes);

// Trip Stop Routes -> /api/trips/:tripId/stops & /api/stops/:id
router.use('/', tripStopRoutes);

// Activity Routes -> /api/trips/:tripId/activities & /api/activities/:id
router.use('/', activityRoutes);

// Expense Routes -> /api/trips/:tripId/expenses, /api/trips/:tripId/expenses/summary, & /api/expenses/:id
router.use('/', expenseRoutes);

module.exports = router;


