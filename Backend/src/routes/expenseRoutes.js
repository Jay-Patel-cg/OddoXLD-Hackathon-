const express = require('express');
const {
  createExpense,
  getTripExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Protect all expense routes with JWT middleware
router.use(protect);

/**
 * Trip-nested expense routes:
 * POST /api/trips/:tripId/expenses
 * GET  /api/trips/:tripId/expenses/summary  (Defined BEFORE wildcard :id routes)
 * GET  /api/trips/:tripId/expenses
 */
router.get('/trips/:tripId/expenses/summary', getExpenseSummary);
router.post('/trips/:tripId/expenses', createExpense);
router.get('/trips/:tripId/expenses', getTripExpenses);

/**
 * Direct expense routes:
 * GET    /api/expenses/:id
 * PUT    /api/expenses/:id
 * DELETE /api/expenses/:id
 */
router.get('/expenses/:id', getExpenseById);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

module.exports = router;
