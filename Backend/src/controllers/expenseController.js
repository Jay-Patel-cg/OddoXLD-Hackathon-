const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const User = require('../models/User');

const SAFE_USER_FIELDS = 'name email profileImage';
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

/**
 * Helper to check if a user is a member (organizer or participant) of a trip
 */
const isTripMember = (trip, userId) => {
  if (!trip || !userId) return false;
  const uid = userId.toString();
  if (trip.organizer.toString() === uid) return true;
  return trip.participants.some((p) => p.toString() === uid);
};

/**
 * Helper to check if a date falls within [startDate, endDate] inclusive
 */
const isDateWithinTripRange = (expenseDate, tripStart, tripEnd) => {
  const exp = new Date(expenseDate);
  const start = new Date(tripStart);
  const end = new Date(tripEnd);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return exp >= start && exp <= end;
};

/**
 * Helper to calculate equal splits with exact cent distribution
 */
const calculateEqualSplits = (totalAmount, memberIds) => {
  if (!memberIds || memberIds.length === 0) return [];
  const len = memberIds.length;
  const baseAmount = Math.floor((totalAmount / len) * 100) / 100;
  let remainder = Math.round((totalAmount - baseAmount * len) * 100) / 100;

  return memberIds.map((userId) => {
    let amt = baseAmount;
    if (remainder > 0.009) {
      amt = Math.round((amt + 0.01) * 100) / 100;
      remainder = Math.round((remainder - 0.01) * 100) / 100;
    }
    return {
      user: userId,
      amount: amt
    };
  });
};

/**
 * @desc    Create a new expense
 * @route   POST /api/trips/:tripId/expenses
 * @access  Private (Organizer or Participant)
 */
const createExpense = async (req, res, next) => {
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

    // Authorization: User must be a trip member
    if (!isTripMember(trip, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this trip'
      });
    }

    const {
      title,
      description,
      amount,
      currency,
      category,
      paidBy,
      splitType,
      splitBetween,
      splits,
      date,
      notes
    } = req.body;

    // 1. Validate required fields
    if (!title || amount === undefined || !paidBy || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, paidBy, and date'
      });
    }

    // 2. Validate amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense amount must be a non-negative number'
      });
    }

    // 3. Validate paidBy user is a trip member
    if (!mongoose.Types.ObjectId.isValid(paidBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid paidBy user ID format'
      });
    }

    if (!isTripMember(trip, paidBy)) {
      return res.status(400).json({
        success: false,
        message: 'paidBy user is not a member of this trip'
      });
    }

    // 4. Validate expense date against trip range
    const expDate = new Date(date);
    if (isNaN(expDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid expense date'
      });
    }

    if (!isDateWithinTripRange(expDate, trip.startDate, trip.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Expense date must fall within the trip date range'
      });
    }

    // 5. Validate category
    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
      });
    }

    // 6. Process splitType and splits
    const finalSplitType = splitType || 'equal';
    if (!['equal', 'custom'].includes(finalSplitType)) {
      return res.status(400).json({
        success: false,
        message: 'splitType must be either equal or custom'
      });
    }

    let finalSplits = [];

    if (finalSplitType === 'equal') {
      let targetMembers = [];
      if (splitBetween && Array.isArray(splitBetween) && splitBetween.length > 0) {
        targetMembers = [...new Set(splitBetween.map((id) => String(id).trim()))];
      } else {
        // Default to all trip members (organizer + participants)
        targetMembers = [trip.organizer.toString(), ...trip.participants.map((p) => p.toString())];
      }

      if (targetMembers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Equal split requires at least one member'
        });
      }

      // Verify all splitBetween users are trip members
      for (const mId of targetMembers) {
        if (!mongoose.Types.ObjectId.isValid(mId) || !isTripMember(trip, mId)) {
          return res.status(400).json({
            success: false,
            message: `Split user ${mId} is not a member of this trip`
          });
        }
      }

      finalSplits = calculateEqualSplits(numAmount, targetMembers);
    } else if (finalSplitType === 'custom') {
      if (!splits || !Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Custom split requires an array of splits'
        });
      }

      // Duplicate user check for custom splits
      const customUserIds = splits.map((s) => (s.user ? s.user.toString() : ''));
      if (new Set(customUserIds).size !== customUserIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate users are not allowed in custom splits'
        });
      }

      let splitsSum = 0;
      for (const s of splits) {
        if (!s.user || !mongoose.Types.ObjectId.isValid(s.user)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid split user ID format'
          });
        }

        if (!isTripMember(trip, s.user)) {
          return res.status(400).json({
            success: false,
            message: `Split user ${s.user} is not a member of this trip`
          });
        }

        const sAmt = Number(s.amount);
        if (isNaN(sAmt) || sAmt < 0) {
          return res.status(400).json({
            success: false,
            message: 'Split amounts cannot be negative'
          });
        }

        splitsSum += sAmt;
        finalSplits.push({ user: s.user, amount: Math.round(sAmt * 100) / 100 });
      }

      // Safe precision comparison
      if (Math.abs(splitsSum - numAmount) > 0.01) {
        return res.status(400).json({
          success: false,
          message: 'Custom split total does not equal expense amount'
        });
      }
    }

    const expense = await Expense.create({
      trip: tripId,
      title,
      description: description || '',
      amount: numAmount,
      currency: currency ? currency.toUpperCase() : 'INR',
      category: category || 'other',
      paidBy,
      splitType: finalSplitType,
      splits: finalSplits,
      date: expDate,
      notes: notes || ''
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', SAFE_USER_FIELDS)
      .populate('splits.user', SAFE_USER_FIELDS);

    return res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: {
        expense: populatedExpense
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all expenses for a trip
 * @route   GET /api/trips/:tripId/expenses
 * @access  Private (Trip members only)
 */
const getTripExpenses = async (req, res, next) => {
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

    const expenses = await Expense.find({ trip: tripId })
      .populate('paidBy', SAFE_USER_FIELDS)
      .populate('splits.user', SAFE_USER_FIELDS)
      .sort({ date: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: {
        expenses
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single expense by ID
 * @route   GET /api/expenses/:id
 * @access  Private (Trip members only)
 */
const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID format'
      });
    }

    const expense = await Expense.findById(id)
      .populate('paidBy', SAFE_USER_FIELDS)
      .populate('splits.user', SAFE_USER_FIELDS);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const trip = await Trip.findById(expense.trip);
    if (!trip || !isTripMember(trip, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this trip'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        expense
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an expense (Organizer or payer)
 * @route   PUT /api/expenses/:id
 * @access  Private (Organizer or payer)
 */
const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID format'
      });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const trip = await Trip.findById(expense.trip);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Parent trip not found'
      });
    }

    const userIdStr = req.user._id.toString();
    const isOrganizer = trip.organizer.toString() === userIdStr;
    const isPayer = expense.paidBy.toString() === userIdStr;

    if (!isOrganizer && !isPayer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update expenses you paid for'
      });
    }

    const {
      title,
      description,
      amount,
      currency,
      category,
      paidBy,
      splitType,
      splitBetween,
      splits,
      date,
      notes
    } = req.body;

    // Security check: Participants CANNOT change paidBy ownership of an expense
    if (paidBy !== undefined && paidBy.toString() !== expense.paidBy.toString() && !isOrganizer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Participants cannot change paidBy ownership of an expense'
      });
    }

    const newAmount = amount !== undefined ? Number(amount) : expense.amount;
    if (isNaN(newAmount) || newAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense amount must be a non-negative number'
      });
    }

    const newPaidBy = paidBy !== undefined ? paidBy : expense.paidBy;
    if (!mongoose.Types.ObjectId.isValid(newPaidBy) || !isTripMember(trip, newPaidBy)) {
      return res.status(400).json({
        success: false,
        message: 'paidBy user is not a member of this trip'
      });
    }

    const newDate = date ? new Date(date) : expense.date;
    if (isNaN(newDate.getTime()) || !isDateWithinTripRange(newDate, trip.startDate, trip.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Expense date must fall within the trip date range'
      });
    }

    if (category !== undefined && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
      });
    }

    const newSplitType = splitType !== undefined ? splitType : expense.splitType;
    if (!['equal', 'custom'].includes(newSplitType)) {
      return res.status(400).json({
        success: false,
        message: 'splitType must be either equal or custom'
      });
    }

    let newSplits = expense.splits;

    if (
      amount !== undefined ||
      splitType !== undefined ||
      splitBetween !== undefined ||
      splits !== undefined
    ) {
      if (newSplitType === 'equal') {
        let targetMembers = [];
        if (splitBetween && Array.isArray(splitBetween) && splitBetween.length > 0) {
          targetMembers = [...new Set(splitBetween.map((id) => String(id).trim()))];
        } else {
          targetMembers = [trip.organizer.toString(), ...trip.participants.map((p) => p.toString())];
        }

        for (const mId of targetMembers) {
          if (!mongoose.Types.ObjectId.isValid(mId) || !isTripMember(trip, mId)) {
            return res.status(400).json({
              success: false,
              message: `Split user ${mId} is not a member of this trip`
            });
          }
        }

        newSplits = calculateEqualSplits(newAmount, targetMembers);
      } else if (newSplitType === 'custom') {
        const inputSplits = splits || expense.splits;
        if (!inputSplits || !Array.isArray(inputSplits) || inputSplits.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Custom split requires an array of splits'
          });
        }

        // Duplicate user check for custom splits
        const customUserIds = inputSplits.map((s) => (s.user ? s.user.toString() : ''));
        if (new Set(customUserIds).size !== customUserIds.length) {
          return res.status(400).json({
            success: false,
            message: 'Duplicate users are not allowed in custom splits'
          });
        }

        let splitsSum = 0;
        const processedCustom = [];
        for (const s of inputSplits) {
          if (!s.user || !mongoose.Types.ObjectId.isValid(s.user) || !isTripMember(trip, s.user)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid or non-member split user ID'
            });
          }
          const sAmt = Number(s.amount);
          if (isNaN(sAmt) || sAmt < 0) {
            return res.status(400).json({
              success: false,
              message: 'Split amounts cannot be negative'
            });
          }
          splitsSum += sAmt;
          processedCustom.push({ user: s.user, amount: Math.round(sAmt * 100) / 100 });
        }

        if (Math.abs(splitsSum - newAmount) > 0.01) {
          return res.status(400).json({
            success: false,
            message: 'Custom split total does not equal expense amount'
          });
        }
        newSplits = processedCustom;
      }
    }

    if (title !== undefined) expense.title = title;
    if (description !== undefined) expense.description = description;
    expense.amount = newAmount;
    if (currency !== undefined) expense.currency = currency.toUpperCase();
    if (category !== undefined) expense.category = category;
    expense.paidBy = newPaidBy;
    expense.splitType = newSplitType;
    expense.splits = newSplits;
    expense.date = newDate;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();

    const updatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', SAFE_USER_FIELDS)
      .populate('splits.user', SAFE_USER_FIELDS);

    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: {
        expense: updatedExpense
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an expense (Organizer or payer)
 * @route   DELETE /api/expenses/:id
 * @access  Private (Organizer or payer)
 */
const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID format'
      });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const trip = await Trip.findById(expense.trip);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Parent trip not found'
      });
    }

    const userIdStr = req.user._id.toString();
    const isOrganizer = trip.organizer.toString() === userIdStr;
    const isPayer = expense.paidBy.toString() === userIdStr;

    if (!isOrganizer && !isPayer) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only delete expenses you paid for"
      });
    }

    await expense.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get expense summary and derived member balances for a trip
 * @route   GET /api/trips/:tripId/expenses/summary
 * @access  Private (Trip members only)
 */
const getExpenseSummary = async (req, res, next) => {
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

    const expenses = await Expense.find({ trip: tripId });

    // 1. Calculate budget metrics
    const budget = trip.budget || 0;
    const currency = trip.currency || 'INR';
    const totalSpent = Math.round(
      expenses.reduce((sum, exp) => sum + exp.amount, 0) * 100
    ) / 100;
    const remaining = Math.round((budget - totalSpent) * 100) / 100;
    const percentageUsed =
      budget > 0
        ? Math.round(((totalSpent / budget) * 100) * 100) / 100
        : 0;

    // 2. Calculate category breakdown
    const categoryBreakdown = {};
    ALLOWED_CATEGORIES.forEach((cat) => {
      categoryBreakdown[cat] = 0;
    });

    expenses.forEach((exp) => {
      const cat = exp.category || 'other';
      if (categoryBreakdown[cat] !== undefined) {
        categoryBreakdown[cat] += exp.amount;
      } else {
        categoryBreakdown['other'] += exp.amount;
      }
    });

    Object.keys(categoryBreakdown).forEach((cat) => {
      categoryBreakdown[cat] = Math.round(categoryBreakdown[cat] * 100) / 100;
    });

    // 3. Calculate member balances
    const allMemberIds = [
      trip.organizer.toString(),
      ...trip.participants.map((p) => p.toString())
    ];
    const uniqueMemberIds = [...new Set(allMemberIds)];

    const memberUsers = await User.find({ _id: { $in: uniqueMemberIds } }).select(
      'name email profileImage'
    );

    const memberBalances = memberUsers.map((member) => {
      const mId = member._id.toString();

      const paid = expenses.reduce((sum, exp) => {
        return exp.paidBy.toString() === mId ? sum + exp.amount : sum;
      }, 0);

      const owes = expenses.reduce((sum, exp) => {
        const splitMatch = exp.splits.find((s) => s.user.toString() === mId);
        return splitMatch ? sum + splitMatch.amount : sum;
      }, 0);

      const paidRounded = Math.round(paid * 100) / 100;
      const owesRounded = Math.round(owes * 100) / 100;
      const balance = Math.round((paidRounded - owesRounded) * 100) / 100;

      return {
        user: {
          id: member._id,
          name: member.name,
          email: member.email,
          profileImage: member.profileImage || null
        },
        paid: paidRounded,
        owes: owesRounded,
        balance
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        budget,
        currency,
        totalSpent,
        remaining,
        percentageUsed,
        categoryBreakdown,
        memberBalances
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getTripExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary
};
