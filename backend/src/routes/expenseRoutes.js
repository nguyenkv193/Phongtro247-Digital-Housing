const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, expenseController.getExpenses);

module.exports = router;
