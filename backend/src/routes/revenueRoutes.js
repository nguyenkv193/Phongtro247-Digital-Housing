const express = require('express');
const router = express.Router();
const { getRevenues } = require('../controllers/revenueController');

router.get('/', getRevenues);

module.exports = router;
