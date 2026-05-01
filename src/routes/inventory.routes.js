const express = require('express')
const router = express.Router();
const { getInventoryStats } = require('../controllers/inventory-controller')

router.route('/inventory').get(getInventoryStats);

module.exports = router;
