const mongoose = require('mongoose');

const ALLOWED_CATEGORIES = [
  'food',
  'transport',
  'hotel',
  'activities',
  'shopping',
  'flight',
  'tickets',
  'other'
];

const splitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Split must specify a user']
    },
    amount: {
      type: Number,
      required: [true, 'Split amount is required'],
      min: [0, 'Split amount cannot be negative']
    }
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Expense must belong to a Trip'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide an expense title'],
      trim: true,
      minlength: [2, 'Expense title must be at least 2 characters long'],
      maxlength: [150, 'Expense title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an expense amount'],
      min: [0, 'Expense amount cannot be negative']
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
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify who paid for the expense']
    },
    splitType: {
      type: String,
      enum: {
        values: ['equal', 'custom'],
        message: 'splitType must be either equal or custom'
      },
      default: 'equal'
    },
    splits: {
      type: [splitSchema],
      default: []
    },
    date: {
      type: Date,
      required: [true, 'Please provide an expense date']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes for common query patterns
expenseSchema.index({ trip: 1, date: 1 });
expenseSchema.index({ trip: 1, category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
