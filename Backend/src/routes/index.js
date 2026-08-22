const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const tripRoutes = require('./tripRoutes');
const activityRoutes = require('./activityRoutes');
const expenseRoutes = require('./expenseRoutes');

const router = express.Router();

// Health Check Route -> /api/health
router.use('/health', healthRoutes);

// Auth Routes -> /api/auth
router.use('/auth', authRoutes);

// Trip Routes -> /api/trips
router.use('/trips', tripRoutes);

// Activity Routes -> /api/trips/:tripId/activities & /api/activities/:id
router.use('/', activityRoutes);

// Expense Routes -> /api/trips/:tripId/expenses, /api/trips/:tripId/expenses/summary, & /api/expenses/:id
router.use('/', expenseRoutes);

module.exports = router;
