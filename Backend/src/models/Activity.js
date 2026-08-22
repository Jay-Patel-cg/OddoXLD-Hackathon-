const mongoose = require('mongoose');

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

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const activitySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Activity must be linked to a parent Trip'],
      index: true
    },
    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TripStop',
      default: null,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide an activity title'],
      trim: true,
      minlength: [2, 'Activity title must be at least 2 characters long'],
      maxlength: [150, 'Activity title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    date: {
      type: Date,
      required: [true, 'Please provide an activity date']
    },
    startTime: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          return !v || TIME_REGEX.test(v);
        },
        message: 'Start time must be in HH:mm 24-hour format (e.g. 09:30 or 14:00)'
      }
    },
    endTime: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          return !v || TIME_REGEX.test(v);
        },
        message: 'End time must be in HH:mm 24-hour format (e.g. 10:30 or 16:00)'
      }
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: [0, 'Estimated cost cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      enum: {
        values: ALLOWED_CATEGORIES,
        message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
      },
      default: 'other'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: ''
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order index cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// Create compound index for efficient querying of trip activities by date and order
activitySchema.index({ trip: 1, date: 1, order: 1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
