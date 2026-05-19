const express = require('express')
const router = express.Router();
const { getOverview } = require('../controllers/analytics-controller');
const authenticationMiddleware = require('../middleware/authMiddleware');


router.get('/overview'
  , authenticationMiddleware,
  getOverview
);

module.exports = router;