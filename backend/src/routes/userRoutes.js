const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/info', verifyToken, userController.getUserInfo);

router.put('/update', verifyToken, userController.updateUserInfo);

router.post('/become-landlord', verifyToken, userController.becomeLandlord);

router.post('/submit-host-info', verifyToken, userController.submitHostInfo);

router.get('/host-info-status', verifyToken, userController.checkHostInfoStatus);

router.get('/balance', verifyToken, userController.getUserBalance);

module.exports = router;
