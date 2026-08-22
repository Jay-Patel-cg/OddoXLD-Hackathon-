const express = require('express');
const {
  createActivity,
  getTripActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  reorderActivities
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Protect all activity routes
router.use(protect);

/**
 * Trip-nested routes:
 * POST /api/trips/:tripId/activities
 * GET /api/trips/:tripId/activities
 * PUT /api/trips/:tripId/activities/reorder
 */
router.put('/trips/:tripId/activities/reorder', reorderActivities);
router.post('/trips/:tripId/activities', createActivity);
router.get('/trips/:tripId/activities', getTripActivities);

/**
 * Direct activity routes:
 * GET /api/activities/:id
 * PUT /api/activities/:id
 * DELETE /api/activities/:id
 */
router.get('/activities/:id', getActivityById);
router.put('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);

module.exports = router;
