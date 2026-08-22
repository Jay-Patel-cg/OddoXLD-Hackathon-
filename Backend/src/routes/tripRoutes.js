const express = require('express');
const {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripOverview
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply JWT protection middleware to all trip routes
router.use(protect);

router.post('/', createTrip);
router.get('/', getMyTrips);
router.get('/:tripId/overview', getTripOverview);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;

