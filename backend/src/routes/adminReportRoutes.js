const express = require('express');
const router = express.Router();
const { getDashboardReport } = require('../controllers/adminReportController');

router.get('/', getDashboardReport);

module.exports = router;
