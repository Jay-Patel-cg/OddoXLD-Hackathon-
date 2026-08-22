const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a destination name'],
      trim: true,
      minlength: [2, 'Destination name must be at least 2 characters long'],
      maxlength: [100, 'Destination name cannot exceed 100 characters']
    },
    country: {
      type: String,
      required: [true, 'Please provide a country'],
      trim: true
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    region: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    costIndex: {
      type: Number,
      min: [1, 'costIndex must be at least 1'],
      max: [5, 'costIndex cannot exceed 5'],
      default: 3
    },
    popularity: {
      type: Number,
      min: [0, 'popularity must be at least 0'],
      max: [100, 'popularity cannot exceed 100'],
      default: 50
    },
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    popularCategories: {
      type: [String],
      default: []
    },
    bestTimeToVisit: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Search and filtering indexes
destinationSchema.index({ name: 1 });
destinationSchema.index({ country: 1 });
destinationSchema.index({ state: 1 });
destinationSchema.index({ region: 1 });
destinationSchema.index({ popularity: -1 });
destinationSchema.index({ costIndex: 1 });

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;
