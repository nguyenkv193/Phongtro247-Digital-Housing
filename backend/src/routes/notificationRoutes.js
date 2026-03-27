const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, notificationController.getNotifications);
router.put('/:notificationId/read', verifyToken, notificationController.markAsRead);
router.put('/mark-all-read', verifyToken, notificationController.markAllAsRead);
router.delete('/:notificationId', verifyToken, notificationController.deleteNotification);

module.exports = router;
