const express = require('express')
const router = express.Router();
const { addBirds,getHistory } = require('../controllers/birds-controllers');


router.route('/add').post(addBirds);

router.route('/history').get(getHistory);

module.exports = router;