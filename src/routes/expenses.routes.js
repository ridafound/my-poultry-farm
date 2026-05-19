const express = require('express')
const router = express.Router();
const dateFilterMiddleware = require('../middleware/date-filter')
const { addExpense, getExpensesHistory } = require('../controllers/expenses-controller');
const authenticationMiddleware = require('../middleware/authMiddleware');

router.post('/add',
  authenticationMiddleware,
  addExpense
);
router.route('/history').get(dateFilterMiddleware, getExpensesHistory);

module.exports = router;