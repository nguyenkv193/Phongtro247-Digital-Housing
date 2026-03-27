const express = require('express');
const router = express.Router();
const emailVerificationController = require('../controllers/emailVerificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/send', verifyToken, emailVerificationController.sendVerificationEmail);

router.post('/verify', emailVerificationController.verifyEmail);

module.exports = router;
