const express = require('express')
const router = express.Router();
const dateFilterMiddleware = require('../middleware/date-filter')
const authenticationMiddleware = require('../middleware/authMiddleware');

const { createSale, getSalesHistory } = require('../controllers/sales-controller');

router.post('/create',
  authenticationMiddleware,
  createSale
);

router.route('/history').get(dateFilterMiddleware, getSalesHistory);

module.exports = router;