const express = require('express');
const router = express.Router();
const hotListingController = require('../controllers/hotListingController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/request', verifyToken, hotListingController.createHotRequest);
router.get('/my-requests', verifyToken, hotListingController.getMyHotRequests);
router.delete('/request/:id', verifyToken, hotListingController.cancelHotRequest);

router.get('/admin/requests', verifyToken, isAdmin, hotListingController.getAllHotRequests);
router.post('/admin/approve/:id', verifyToken, isAdmin, hotListingController.approveHotRequest);
router.post('/admin/reject/:id', verifyToken, isAdmin, hotListingController.rejectHotRequest);

module.exports = router;
