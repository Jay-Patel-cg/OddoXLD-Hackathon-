const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const User = require('../models/User');

const SAFE_USER_FIELDS = 'name email profileImage';

/**
 * Helper function to validate and clean participant user IDs
 */
const processParticipants = async (participantIds, organizerId) => {
  if (!participantIds || !Array.isArray(participantIds)) {
    return [];
  }

  // 1. Remove duplicate entries and trim strings
  const uniqueIds = [...new Set(participantIds.map((id) => String(id).trim()))];

  // 2. Filter out organizer ID if included
  const filteredIds = uniqueIds.filter((id) => id !== organizerId.toString());

  if (filteredIds.length === 0) {
    return [];
  }

  // 3. Validate ObjectId format for each ID
  for (const id of filteredIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, message: `Invalid participant user ID format: ${id}` };
    }
  }

  // 4. Verify all participant users exist in database
  const existingUsers = await User.find({ _id: { $in: filteredIds } }).select('_id');
  if (existingUsers.length !== filteredIds.length) {
    throw { status: 400, message: 'One or more participant users do not exist' };
  }

  return filteredIds;
};

/**
 * @desc    Create a new trip
 * @route   POST /api/trips
 * @access  Private
 */
const createTrip = async (req, res, next) => {
  try {
    const {
      title,
      description,
      destination,
      startDate,
      endDate,
      budget,
      currency,
      participants,
      status
    } = req.body;

    // 1. Validate required fields
    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, destination, startDate, and endDate'
      });
    }

    // 2. Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid start and end dates'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date'
      });
    }

    // 3. Validate budget
    const numericBudget = budget !== undefined ? Number(budget) : 0;
    if (isNaN(numericBudget) || numericBudget < 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget cannot be negative'
      });
    }

    // 4. Process and validate participants
    let cleanParticipants = [];
    try {
      cleanParticipants = await processParticipants(participants, req.user._id);
    } catch (err) {
      return res.status(err.status || 400).json({
        success: false,
        message: err.message
      });
    }

    // 5. Create trip with authenticated user as organizer
    const trip = await Trip.create({
      title,
      description,
      destination,
      startDate: start,
      endDate: end,
      budget: numericBudget,
      currency: currency ? currency.toUpperCase() : 'INR',
      organizer: req.user._id,
      participants: cleanParticipants,
      status: status || 'planned'
    });

    // 6. Populate organizer & participants for response
    const populatedTrip = await Trip.findById(trip._id)
      .populate('organizer', SAFE_USER_FIELDS)
      .populate('participants', SAFE_USER_FIELDS);

    return res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: {
        trip: populatedTrip
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all trips where authenticated user is organizer or participant
 * @route   GET /api/trips
 * @access  Private
 */
const getMyTrips = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const trips = await Trip.find({
      $or: [{ organizer: userId }, { participants: userId }]
    })
      .populate('organizer', SAFE_USER_FIELDS)
      .populate('participants', SAFE_USER_FIELDS)
      .sort({ startDate: 1 });

    return res.status(200).json({
      success: true,
      count: trips.length,
      data: {
        trips
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single trip by ID
 * @route   GET /api/trips/:id
 * @access  Private
 */
const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format'
      });
    }

    const trip = await Trip.findById(id)
      .populate('organizer', SAFE_USER_FIELDS)
      .populate('participants', SAFE_USER_FIELDS);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Access control: User must be organizer OR participant
    const userIdStr = req.user._id.toString();
    const organizerIdStr = trip.organizer._id ? trip.organizer._id.toString() : trip.organizer.toString();
    const isParticipant = trip.participants.some(
      (p) => (p._id ? p._id.toString() : p.toString()) === userIdStr
    );

    if (organizerIdStr !== userIdStr && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a participant or organizer of this trip'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        trip
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing trip (Organizer only)
 * @route   PUT /api/trips/:id
 * @access  Private (Organizer only)
 */
const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format'
      });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Authorization: Only organizer can update trip
    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the trip organizer can update this trip'
      });
    }

    const {
      title,
      description,
      destination,
      startDate,
      endDate,
      budget,
      currency,
      status,
      participants
    } = req.body;

    // Validate updated dates if provided
    const newStart = startDate ? new Date(startDate) : trip.startDate;
    const newEnd = endDate ? new Date(endDate) : trip.endDate;

    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid start and end dates'
      });
    }

    if (newEnd < newStart) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date'
      });
    }

    // Validate updated budget if provided
    if (budget !== undefined) {
      const numericBudget = Number(budget);
      if (isNaN(numericBudget) || numericBudget < 0) {
        return res.status(400).json({
          success: false,
          message: 'Budget cannot be negative'
        });
      }
      trip.budget = numericBudget;
    }

    // Update basic fields
    if (title !== undefined) trip.title = title;
    if (description !== undefined) trip.description = description;
    if (destination !== undefined) trip.destination = destination;
    if (startDate !== undefined) trip.startDate = newStart;
    if (endDate !== undefined) trip.endDate = newEnd;
    if (currency !== undefined) trip.currency = currency.toUpperCase();
    if (status !== undefined) trip.status = status;

    // Process updated participants if provided
    if (participants !== undefined) {
      try {
        trip.participants = await processParticipants(participants, req.user._id);
      } catch (err) {
        return res.status(err.status || 400).json({
          success: false,
          message: err.message
        });
      }
    }

    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('organizer', SAFE_USER_FIELDS)
      .populate('participants', SAFE_USER_FIELDS);

    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: {
        trip: updatedTrip
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a trip (Organizer only)
 * @route   DELETE /api/trips/:id
 * @access  Private (Organizer only)
 */
const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format'
      });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Authorization: Only organizer can delete trip
    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the trip organizer can delete this trip'
      });
    }

    await trip.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trip overview including trip details, stops, activities count, and expenses summary
 * @route   GET /api/trips/:tripId/overview
 * @access  Private (Trip members only)
 */
const getTripOverview = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format'
      });
    }

    const trip = await Trip.findById(tripId)
      .populate('organizer', SAFE_USER_FIELDS)
      .populate('participants', SAFE_USER_FIELDS);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Access control: User must be organizer OR participant
    const userIdStr = req.user._id.toString();
    const organizerIdStr = trip.organizer._id ? trip.organizer._id.toString() : trip.organizer.toString();
    const isParticipant = trip.participants.some(
      (p) => (p._id ? p._id.toString() : p.toString()) === userIdStr
    );

    if (organizerIdStr !== userIdStr && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a participant or organizer of this trip'
      });
    }

    const TripStop = require('../models/TripStop');
    const stops = await TripStop.find({ trip: tripId })
      .populate('destination')
      .sort({ order: 1, arrivalDate: 1 });

    const Activity = require('../models/Activity');
    const activitiesCount = await Activity.countDocuments({ trip: tripId });

    const Expense = require('../models/Expense');
    const expenses = await Expense.find({ trip: tripId });
    const totalSpent = Math.round(expenses.reduce((sum, exp) => sum + exp.amount, 0) * 100) / 100;
    const remaining = Math.round(((trip.budget || 0) - totalSpent) * 100) / 100;

    return res.status(200).json({
      success: true,
      data: {
        trip,
        stops,
        activitiesCount,
        expensesSummary: {
          budget: trip.budget || 0,
          currency: trip.currency || 'INR',
          totalSpent,
          remaining
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripOverview
};
