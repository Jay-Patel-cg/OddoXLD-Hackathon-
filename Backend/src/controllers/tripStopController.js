const mongoose = require('mongoose');
const TripStop = require('../models/TripStop');
const Trip = require('../models/Trip');
const Destination = require('../models/Destination');
const Activity = require('../models/Activity');

/**
 * Helper to check if a user is a member of a trip
 */
const isTripMember = (trip, userId) => {
  if (!trip || !userId) return false;
  const uid = userId.toString();
  if (trip.organizer.toString() === uid) return true;
  return trip.participants.some((p) => p.toString() === uid);
};

/**
 * Helper to check if two date intervals overlap
 * Returns true if [arrA, depA] overlaps with [arrB, depB]
 */
const checkStopsOverlap = (arrA, depA, arrB, depB) => {
  const startA = new Date(arrA).getTime();
  const endA = new Date(depA).getTime();
  const startB = new Date(arrB).getTime();
  const endB = new Date(depB).getTime();

  return Math.max(startA, startB) < Math.min(endA, endB);
};

/**
 * @desc    Create a new travel stop for a trip
 * @route   POST /api/trips/:tripId/stops
 * @access  Private (Organizer only)
 */
const createTripStop = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format'
      });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Authorization: Organizer only
    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only trip organizers can create travel stops'
      });
    }

    const { destinationId, arrivalDate, departureDate, notes, order } = req.body;

    if (!destinationId || !arrivalDate || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide destinationId, arrivalDate, and departureDate'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID format'
      });
    }

    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    const arrDate = new Date(arrivalDate);
    const depDate = new Date(departureDate);

    if (isNaN(arrDate.getTime()) || isNaN(depDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid arrival and departure dates'
      });
    }

    if (depDate < arrDate) {
      return res.status(400).json({
        success: false,
        message: 'Departure date cannot be before arrival date'
      });
    }

    // Validate dates stay within Trip [startDate, endDate]
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    tripStart.setHours(0, 0, 0, 0);
    tripEnd.setHours(23, 59, 59, 999);

    if (arrDate < tripStart || depDate > tripEnd) {
      return res.status(400).json({
        success: false,
        message: 'Trip stop dates must fall within the trip start and end date range'
      });
    }

    // Prevent invalid stop overlap
    const existingStops = await TripStop.find({ trip: tripId });
    const hasOverlap = existingStops.some((s) =>
      checkStopsOverlap(arrDate, depDate, s.arrivalDate, s.departureDate)
    );

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'Trip stops cannot overlap'
      });
    }

    const nextOrder = order !== undefined ? Number(order) : existingStops.length;

    const stop = await TripStop.create({
      trip: tripId,
      destination: destinationId,
      cityName: destination.name,
      country: destination.country,
      arrivalDate: arrDate,
      departureDate: depDate,
      notes: notes || '',
      order: isNaN(nextOrder) || nextOrder < 0 ? 0 : nextOrder
    });

    const populatedStop = await TripStop.findById(stop._id).populate('destination');

    return res.status(201).json({
      success: true,
      message: 'Trip stop created successfully',
      data: {
        stop: populatedStop
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all stops for a trip
 * @route   GET /api/trips/:tripId/stops
 * @access  Private (Trip members only)
 */
const getTripStops = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format'
      });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    if (!isTripMember(trip, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this trip'
      });
    }

    const stops = await TripStop.find({ trip: tripId })
      .populate('destination')
      .sort({ order: 1, arrivalDate: 1 });

    return res.status(200).json({
      success: true,
      count: stops.length,
      data: {
        stops
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single trip stop by ID
 * @route   GET /api/stops/:id
 * @access  Private (Trip members only)
 */
const getTripStopById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stop ID format'
      });
    }

    const stop = await TripStop.findById(id).populate('destination');
    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Trip stop not found'
      });
    }

    const trip = await Trip.findById(stop.trip);
    if (!trip || !isTripMember(trip, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this trip'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        stop
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a trip stop
 * @route   PUT /api/stops/:id
 * @access  Private (Organizer only)
 */
const updateTripStop = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stop ID format'
      });
    }

    const stop = await TripStop.findById(id);
    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Trip stop not found'
      });
    }

    const trip = await Trip.findById(stop.trip);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Parent trip not found'
      });
    }

    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only trip organizers can update travel stops'
      });
    }

    const { destinationId, arrivalDate, departureDate, notes, order } = req.body;

    let destDoc = null;
    if (destinationId) {
      if (!mongoose.Types.ObjectId.isValid(destinationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid destination ID format'
        });
      }

      destDoc = await Destination.findById(destinationId);
      if (!destDoc) {
        return res.status(404).json({
          success: false,
          message: 'Destination not found'
        });
      }
    }

    const newArr = arrivalDate ? new Date(arrivalDate) : stop.arrivalDate;
    const newDep = departureDate ? new Date(departureDate) : stop.departureDate;

    if (isNaN(newArr.getTime()) || isNaN(newDep.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid arrival and departure dates'
      });
    }

    if (newDep < newArr) {
      return res.status(400).json({
        success: false,
        message: 'Departure date cannot be before arrival date'
      });
    }

    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    tripStart.setHours(0, 0, 0, 0);
    tripEnd.setHours(23, 59, 59, 999);

    if (newArr < tripStart || newDep > tripEnd) {
      return res.status(400).json({
        success: false,
        message: 'Trip stop dates must fall within the trip start and end date range'
      });
    }

    // Check overlap with other stops in trip
    const otherStops = await TripStop.find({
      trip: stop.trip,
      _id: { $ne: stop._id }
    });

    const hasOverlap = otherStops.some((s) =>
      checkStopsOverlap(newArr, newDep, s.arrivalDate, s.departureDate)
    );

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'Trip stops cannot overlap'
      });
    }

    if (destDoc) {
      stop.destination = destDoc._id;
      stop.cityName = destDoc.name;
      stop.country = destDoc.country;
    }
    stop.arrivalDate = newArr;
    stop.departureDate = newDep;
    if (notes !== undefined) stop.notes = notes;
    if (order !== undefined) stop.order = Number(order);

    await stop.save();

    const updatedStop = await TripStop.findById(stop._id).populate('destination');

    return res.status(200).json({
      success: true,
      message: 'Trip stop updated successfully',
      data: {
        stop: updatedStop
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a trip stop
 * @route   DELETE /api/stops/:id
 * @access  Private (Organizer only)
 */
const deleteTripStop = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stop ID format'
      });
    }

    const stop = await TripStop.findById(id);
    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Trip stop not found'
      });
    }

    const trip = await Trip.findById(stop.trip);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Parent trip not found'
      });
    }

    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only trip organizers can delete travel stops'
      });
    }

    await stop.deleteOne();

    // Unset stop reference on any linked Activity documents
    await Activity.updateMany({ stop: id }, { $unset: { stop: 1 } });

    return res.status(200).json({
      success: true,
      message: 'Trip stop deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reorder stops for a trip
 * @route   PUT /api/trips/:tripId/stops/reorder
 * @access  Private (Organizer only)
 */
const reorderTripStops = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format'
      });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only trip organizers can reorder travel stops'
      });
    }

    const { stopIds } = req.body;

    if (!stopIds || !Array.isArray(stopIds) || stopIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a stopIds array'
      });
    }

    // Check for duplicate stop IDs in request
    const uniqueIds = new Set(stopIds.map((id) => String(id).trim()));
    if (uniqueIds.size !== stopIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate stop IDs are not allowed in reorder request'
      });
    }

    const existingStops = await TripStop.find({ trip: tripId });

    if (stopIds.length !== existingStops.length) {
      return res.status(400).json({
        success: false,
        message: 'stopIds array length must match total trip stops count'
      });
    }

    const existingIdSet = new Set(existingStops.map((s) => s._id.toString()));

    for (const idStr of stopIds) {
      if (!mongoose.Types.ObjectId.isValid(idStr) || !existingIdSet.has(idStr)) {
        return res.status(400).json({
          success: false,
          message: `Stop ID ${idStr} is invalid or does not belong to this trip`
        });
      }
    }

    // Bulk write order updates
    const bulkOps = stopIds.map((idStr, idx) => ({
      updateOne: {
        filter: { _id: idStr },
        update: { order: idx }
      }
    }));

    await TripStop.bulkWrite(bulkOps);

    const reorderedStops = await TripStop.find({ trip: tripId })
      .populate('destination')
      .sort({ order: 1, arrivalDate: 1 });

    return res.status(200).json({
      success: true,
      message: 'Trip stops reordered successfully',
      data: {
        stops: reorderedStops
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTripStop,
  getTripStops,
  getTripStopById,
  updateTripStop,
  deleteTripStop,
  reorderTripStops
};
