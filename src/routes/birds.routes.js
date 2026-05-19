const express = require('express')
const router = express.Router();
const { addBirds, getHistory } = require('../controllers/birds-controllers');
const authenticationMiddleware = require('../middleware/authMiddleware');

router.post('/add',
  authenticationMiddleware,
  addBirds
);

router.route('/history').get(getHistory);

module.exports = router;