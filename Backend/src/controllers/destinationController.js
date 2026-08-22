const mongoose = require('mongoose');
const Destination = require('../models/Destination');

/**
 * @desc    Get all destinations with search, filter, sort, and pagination
 * @route   GET /api/destinations
 * @access  Public
 */
const getDestinations = async (req, res, next) => {
  try {
    const {
      search,
      country,
      state,
      region,
      minCost,
      maxCost,
      category,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const filter = { isActive: true };

    // Case-insensitive search on name, country, state, region, description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { country: searchRegex },
        { state: searchRegex },
        { region: searchRegex },
        { description: searchRegex }
      ];
    }

    if (country && country.trim()) {
      filter.country = new RegExp(`^${country.trim()}$`, 'i');
    }

    if (state && state.trim()) {
      filter.state = new RegExp(`^${state.trim()}$`, 'i');
    }

    if (region && region.trim()) {
      filter.region = new RegExp(`^${region.trim()}$`, 'i');
    }

    // Validation for costIndex range filtering
    if (minCost !== undefined || maxCost !== undefined) {
      const minVal = minCost !== undefined ? Number(minCost) : undefined;
      const maxVal = maxCost !== undefined ? Number(maxCost) : undefined;

      if (
        (minVal !== undefined && (isNaN(minVal) || minVal < 1 || minVal > 5)) ||
        (maxVal !== undefined && (isNaN(maxVal) || maxVal < 1 || maxVal > 5))
      ) {
        return res.status(400).json({
          success: false,
          message: 'costIndex filtering values must be numbers between 1 and 5'
        });
      }

      if (minVal !== undefined && maxVal !== undefined && minVal > maxVal) {
        return res.status(400).json({
          success: false,
          message: 'minCost cannot be greater than maxCost'
        });
      }

      filter.costIndex = {};
      if (minVal !== undefined) filter.costIndex.$gte = minVal;
      if (maxVal !== undefined) filter.costIndex.$lte = maxVal;
    }

    if (category && category.trim()) {
      filter.popularCategories = { $in: [new RegExp(category.trim(), 'i')] };
    }

    // Sort setup
    let sortOption = { popularity: -1 };
    if (sort) {
      if (sort === 'popularity') sortOption = { popularity: 1 };
      else if (sort === '-popularity') sortOption = { popularity: -1 };
      else if (sort === 'costIndex') sortOption = { costIndex: 1 };
      else if (sort === '-costIndex') sortOption = { costIndex: -1 };
      else if (sort === 'name') sortOption = { name: 1 };
      else if (sort === '-name') sortOption = { name: -1 };
    }

    // Pagination setup with strict validation
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'page parameter must be a positive integer greater than 0'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        message: 'limit parameter must be a positive integer between 1 and 50'
      });
    }

    const skip = (pageNum - 1) * limitNum;

    const total = await Destination.countDocuments(filter);
    const destinations = await Destination.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      count: destinations.length,
      total,
      page: pageNum,
      totalPages,
      data: {
        destinations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get popular destinations
 * @route   GET /api/destinations/popular
 * @access  Public
 */
const getPopularDestinations = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(20, Math.max(1, parseInt(limit, 10) || 10));

    const destinations = await Destination.find({ isActive: true })
      .sort({ popularity: -1 })
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: destinations.length,
      data: {
        destinations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single destination by ID
 * @route   GET /api/destinations/:id
 * @access  Public
 */
const getDestinationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID format'
      });
    }

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        destination
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDestinations,
  getPopularDestinations,
  getDestinationById
};
