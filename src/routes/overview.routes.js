const express = require('express')
const router = express.Router();
const {getOverview} = require('../controllers/analytics-controller');

router.route('/overview').get(getOverview);

module.exports = router;