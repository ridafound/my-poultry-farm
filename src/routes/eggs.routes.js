const express = require('express')
const router = express.Router();
const dateFilterMiddleware = require('../middleware/date-filter')
const { addEggs,getHistory,getTodayTotal } = require('../controllers/eggs-controller')

router.route('/add').post(addEggs);
router.route('/history').get(dateFilterMiddleware,getHistory);
router.route('/today-total').get(getTodayTotal);

module.exports = router;