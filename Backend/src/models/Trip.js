const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a trip title'],
      trim: true,
      minlength: [2, 'Trip title must be at least 2 characters long'],
      maxlength: [100, 'Trip title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    destination: {
      type: String,
      required: [true, 'Please provide a destination'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date']
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date']
    },
    budget: {
      type: Number,
      required: [true, 'Please provide a budget'],
      default: 0,
      min: [0, 'Budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    status: {
      type: String,
      enum: {
        values: ['planned', 'ongoing', 'completed', 'cancelled'],
        message: 'Status must be planned, ongoing, completed, or cancelled'
      },
      default: 'planned'
    }
  },
  {
    timestamps: true
  }
);

// Custom validation to ensure endDate is on or after startDate
tripSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date cannot be before start date');
  }
  next();
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
