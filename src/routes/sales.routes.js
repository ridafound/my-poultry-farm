const express = require('express')
const router = express.Router();
const dateFilterMiddleware =require('../middleware/date-filter')

const {createSale, getSalesHistory} = require('../controllers/sales-controller');

router.route('/create').post(createSale);
router.route('/history').get(dateFilterMiddleware,getSalesHistory);

module.exports = router;