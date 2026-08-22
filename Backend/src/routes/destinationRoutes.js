const express = require('express');
const {
  getDestinations,
  getPopularDestinations,
  getDestinationById
} = require('../controllers/destinationController');

const router = express.Router();

/**
 * Public Destination Discovery Routes
 * NOTE: GET /api/destinations/popular MUST be declared BEFORE /api/destinations/:id
 */
router.get('/popular', getPopularDestinations);
router.get('/', getDestinations);
router.get('/:id', getDestinationById);

module.exports = router;
