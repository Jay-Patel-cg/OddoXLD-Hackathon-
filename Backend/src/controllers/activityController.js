const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Trip = require('../models/Trip');
const TripStop = require('../models/TripStop');

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const ALLOWED_CATEGORIES = [
  'food',
  'sightseeing',
  'transport',
  'hotel',
  'shopping',
  'entertainment',
  'adventure',
  'relaxation',
  'other'
];

/**
 * Helper to check if a date falls within [startDate, endDate] inclusive (comparing calendar dates)
 */
const isDateWithinTripRange = (activityDate, tripStart, tripEnd) => {
  const act = new Date(activityDate);
  const start = new Date(tripStart);
  const end = new Date(tripEnd);

  // Set start to beginning of day and end to end of day UTC/local
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return act >= start && act <= end;
};

/**
 * Helper to check if endTime is on or after startTime
 */
const isEndTimeValid = (startTime, endTime) => {
  if (!startTime || !endTime) return true;
  return endTime >= startTime;
};

/**
 * @desc    Create a new activity for a trip (Organizer only)
 * @route   POST /api/trips/:tripId/activities
 * @access  Private (Organizer only)
 */
const createActivity = async (req, res, next) => {
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

    // Authorization: Only organizer can create activities
    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the trip organizer can create activities'
      });
    }

    const {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      estimatedCost,
      currency,
      category,
      notes,
      order,
      stop
    } = req.body;

    // 1. Validate title & date
    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide activity title and date'
      });
    }

    const actDate = new Date(date);
    if (isNaN(actDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid activity date'
      });
    }

    // 2. Validate activity date against trip date range
    if (!isDateWithinTripRange(actDate, trip.startDate, trip.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Activity date must fall within the trip date range'
      });
    }

    // 3. Validate optional TripStop connection
    let stopId = null;
    if (stop) {
      if (!mongoose.Types.ObjectId.isValid(stop)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid stop ID format'
        });
      }

      const stopDoc = await TripStop.findById(stop);
      if (!stopDoc) {
        return res.status(404).json({
          success: false,
          message: 'TripStop not found'
        });
      }

      if (stopDoc.trip.toString() !== tripId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'TripStop does not belong to this trip'
        });
      }

      const stopArr = new Date(stopDoc.arrivalDate);
      const stopDep = new Date(stopDoc.departureDate);
      stopArr.setHours(0, 0, 0, 0);
      stopDep.setHours(23, 59, 59, 999);

      if (actDate < stopArr || actDate > stopDep) {
        return res.status(400).json({
          success: false,
          message: 'Activity date must fall within the selected travel stop arrival and departure dates'
        });
      }

      stopId = stopDoc._id;
    }

    // 4. Validate times format and range
    if (startTime && !TIME_REGEX.test(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be in HH:mm 24-hour format (e.g. 09:30)'
      });
    }

    if (endTime && !TIME_REGEX.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be in HH:mm 24-hour format (e.g. 17:00)'
      });
    }

    if (startTime && endTime && !isEndTimeValid(startTime, endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time cannot be before start time'
      });
    }

    // 5. Validate estimatedCost
    const numericCost = estimatedCost !== undefined ? Number(estimatedCost) : 0;
    if (isNaN(numericCost) || numericCost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Estimated cost cannot be negative'
      });
    }

    // 6. Validate category
    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
      });
    }

    const activity = await Activity.create({
      trip: tripId,
      stop: stopId,
      title,
      description,
      date: actDate,
      startTime: startTime || '',
      endTime: endTime || '',
      location: location || '',
      estimatedCost: numericCost,
      currency: currency ? currency.toUpperCase() : 'INR',
      category: category || 'other',
      notes: notes || '',
      order: order !== undefined ? Number(order) : 0
    });

    const populatedActivity = await Activity.findById(activity._id).populate('stop');

    return res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: {
        activity: populatedActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all activities for a trip (Organizer or Participant)
 * @route   GET /api/trips/:tripId/activities
 * @access  Private (Organizer or Participant)
 */
const getTripActivities = async (req, res, next) => {
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

    // Access control: User must be organizer OR participant
    const userIdStr = req.user._id.toString();
    const organizerIdStr = trip.organizer.toString();
    const isParticipant = trip.participants.some((p) => p.toString() === userIdStr);

    if (organizerIdStr !== userIdStr && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a participant or organizer of this trip'
      });
    }

    // Fetch activities sorted by date, order, and start time
    const activities = await Activity.find({ trip: tripId }).sort({
      date: 1,
      order: 1,
      startTime: 1
    });

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: {
        activities
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single activity by ID
 * @route   GET /api/activities/:id
 * @access  Private (Organizer or Participant of parent trip)
 */
const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format'
      });
    }

    const activity = await Activity.findById(id).populate('trip', 'title destination startDate endDate organizer participants');
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const trip = activity.trip;
    const userIdStr = req.user._id.toString();
    const organizerIdStr = trip.organizer.toString();
    const isParticipant = trip.participants.some((p) => p.toString() === userIdStr);

    if (organizerIdStr !== userIdStr && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a participant or organizer of this trip'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        activity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an activity (Organizer only)
 * @route   PUT /api/activities/:id
 * @access  Private (Organizer only)
 */
const updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format'
      });
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const trip = await Trip.findById(activity.trip);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Parent trip not found'
      });
    }

    // Authorization: Only trip organizer can update activity
    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the trip organizer can update activities'
      });
    }

    const {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      estimatedCost,
      currency,
      category,
      notes,
      order,
      stop
    } = req.body;

    // Validate updated date if provided
    const newDate = date ? new Date(date) : activity.date;
    if (isNaN(newDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid activity date'
      });
    }

    if (!isDateWithinTripRange(newDate, trip.startDate, trip.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Activity date must fall within the trip date range'
      });
    }

    // Validate updated stop if provided
    if (stop !== undefined) {
      if (stop === null || stop === '') {
        activity.stop = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(stop)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid stop ID format'
          });
        }

        const stopDoc = await TripStop.findById(stop);
        if (!stopDoc) {
          return res.status(404).json({
            success: false,
            message: 'TripStop not found'
          });
        }

        if (stopDoc.trip.toString() !== trip._id.toString()) {
          return res.status(400).json({
            success: false,
            message: 'TripStop does not belong to this trip'
          });
        }

        const stopArr = new Date(stopDoc.arrivalDate);
        const stopDep = new Date(stopDoc.departureDate);
        stopArr.setHours(0, 0, 0, 0);
        stopDep.setHours(23, 59, 59, 999);

        if (newDate < stopArr || newDate > stopDep) {
          return res.status(400).json({
            success: false,
            message: 'Activity date must fall within the selected travel stop arrival and departure dates'
          });
        }

        activity.stop = stopDoc._id;
      }
    } else if (activity.stop && date !== undefined) {
      // Re-verify existing stop date range if date changed
      const stopDoc = await TripStop.findById(activity.stop);
      if (stopDoc) {
        const stopArr = new Date(stopDoc.arrivalDate);
        const stopDep = new Date(stopDoc.departureDate);
        stopArr.setHours(0, 0, 0, 0);
        stopDep.setHours(23, 59, 59, 999);

        if (newDate < stopArr || newDate > stopDep) {
          return res.status(400).json({
            success: false,
            message: 'Activity date must fall within the selected travel stop arrival and departure dates'
          });
        }
      }
    }

    // Validate updated times if provided
    const newStart = startTime !== undefined ? startTime : activity.startTime;
    const newEnd = endTime !== undefined ? endTime : activity.endTime;

    if (newStart && !TIME_REGEX.test(newStart)) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be in HH:mm 24-hour format (e.g. 09:30)'
      });
    }

    if (newEnd && !TIME_REGEX.test(newEnd)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be in HH:mm 24-hour format (e.g. 17:00)'
      });
    }

    if (newStart && newEnd && !isEndTimeValid(newStart, newEnd)) {
      return res.status(400).json({
        success: false,
        message: 'End time cannot be before start time'
      });
    }

    // Validate updated estimatedCost
    if (estimatedCost !== undefined) {
      const numericCost = Number(estimatedCost);
      if (isNaN(numericCost) || numericCost < 0) {
        return res.status(400).json({
          success: false,
          message: 'Estimated cost cannot be negative'
        });
      }
      activity.estimatedCost = numericCost;
    }

    // Validate updated category
    if (category !== undefined) {
      if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
        });
      }
      activity.category = category;
    }

    if (title !== undefined) activity.title = title;
    if (description !== undefined) activity.description = description;
    if (date !== undefined) activity.date = newDate;
    if (startTime !== undefined) activity.startTime = newStart;
    if (endTime !== undefined) activity.endTime = newEnd;
    if (location !== undefined) activity.location = location;
    if (currency !== undefined) activity.currency = currency.toUpperCase();
    if (notes !== undefined) activity.notes = notes;
    if (order !== undefined) activity.order = Number(order);

    await activity.save();

    const updatedActivity = await Activity.findById(activity._id).populate('stop');

    return res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: {
        activity: updatedActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an activity (Organizer only)
 * @route   DELETE /api/activities/:id
 * @access  Private (Organizer only)
 */
const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format'
      });
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const trip = await Trip.findById(activity.trip);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Parent trip not found'
      });
    }

    // Authorization: Only trip organizer can delete activities
    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the trip organizer can delete activities'
      });
    }

    await activity.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reorder activities within a trip (Organizer only)
 * @route   PUT /api/trips/:tripId/activities/reorder
 * @access  Private (Organizer only)
 */
const reorderActivities = async (req, res, next) => {
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

    // Authorization: Only trip organizer can reorder activities
    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the trip organizer can reorder activities'
      });
    }

    const { activityIds } = req.body;

    if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of activityIds to reorder'
      });
    }

    // Validate format of all activity ObjectIds
    for (const actId of activityIds) {
      if (!mongoose.Types.ObjectId.isValid(actId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid activity ID format: ${actId}`
        });
      }
    }

    // Check for duplicates in activityIds array
    const uniqueActivityIds = [...new Set(activityIds)];
    if (uniqueActivityIds.length !== activityIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate activity IDs are not allowed in reorder request'
      });
    }

    // Verify all requested activity IDs belong to this trip
    const existingActivities = await Activity.find({
      _id: { $in: uniqueActivityIds },
      trip: tripId
    });

    if (existingActivities.length !== uniqueActivityIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more activity IDs are invalid or belong to another trip'
      });
    }

    // Update order for each activity matching its position in uniqueActivityIds
    const updatePromises = uniqueActivityIds.map((actId, index) =>
      Activity.findByIdAndUpdate(actId, { order: index }, { new: true })
    );

    await Promise.all(updatePromises);

    const reorderedActivities = await Activity.find({ trip: tripId }).sort({
      date: 1,
      order: 1,
      startTime: 1
    });

    return res.status(200).json({
      success: true,
      message: 'Activities reordered successfully',
      data: {
        activities: reorderedActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivity,
  getTripActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  reorderActivities
};
