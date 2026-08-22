const mongoose = require('mongoose');

const tripStopSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'TripStop must belong to a Trip'],
      index: true
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'TripStop must reference a Destination']
    },
    cityName: {
      type: String,
      required: [true, 'City name is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    arrivalDate: {
      type: Date,
      required: [true, 'Please provide an arrival date']
    },
    departureDate: {
      type: Date,
      required: [true, 'Please provide a departure date']
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
      min: [0, 'Order must be a non-negative number']
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for ordering and timeline retrieval
tripStopSchema.index({ trip: 1, order: 1 });
tripStopSchema.index({ trip: 1, arrivalDate: 1 });

const TripStop = mongoose.model('TripStop', tripStopSchema);

module.exports = TripStop;
