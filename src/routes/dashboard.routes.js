const express = require('express')
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard-controller');
const authenticationMiddleware = require('../middleware/authMiddleware');

router.get(
  "/dashboard",
  authenticationMiddleware,
  getDashboardStats
);

module.exports = router;