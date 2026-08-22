const express = require('express');
const {
  createTripStop,
  getTripStops,
  getTripStopById,
  updateTripStop,
  deleteTripStop,
  reorderTripStops
} = require('../controllers/tripStopController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Protect all trip stop routes with JWT middleware
router.use(protect);

/**
 * Trip-nested stop routes:
 * PUT  /api/trips/:tripId/stops/reorder  (Must be declared BEFORE wildcard :id routes)
 * POST /api/trips/:tripId/stops
 * GET  /api/trips/:tripId/stops
 */
router.put('/trips/:tripId/stops/reorder', reorderTripStops);
router.post('/trips/:tripId/stops', createTripStop);
router.get('/trips/:tripId/stops', getTripStops);

/**
 * Direct stop routes:
 * GET    /api/stops/:id
 * PUT    /api/stops/:id
 * DELETE /api/stops/:id
 */
router.get('/stops/:id', getTripStopById);
router.put('/stops/:id', updateTripStop);
router.delete('/stops/:id', deleteTripStop);

module.exports = router;
