const express = require('express')
const router = express.Router();
const dateFilterMiddleware = require('../middleware/date-filter')
const { addExpense, getExpensesHistory } = require('../controllers/expenses-controller');


router.route('/add').post(addExpense);
router.route('/history').get(dateFilterMiddleware, getExpensesHistory);

module.exports = router;