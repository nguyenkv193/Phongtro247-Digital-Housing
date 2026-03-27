const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const hotListingController = require('../controllers/hotListingController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/request', verifyToken, videoController.requestVideo);
router.get('/my-requests', verifyToken, videoController.getMyVideoRequests);

router.get('/all-requests', verifyToken, isAdmin, videoController.getAllVideoRequests);
router.get('/admin-requests', videoController.getAllVideoRequests);

router.post('/approve-video/:id', verifyToken, isAdmin, videoController.approveVideoRequest);
router.post('/reject-video/:id', verifyToken, isAdmin, videoController.rejectVideoRequest);

router.post('/approve-hot/:id', verifyToken, isAdmin, hotListingController.approveHotRequest);
router.post('/reject-hot/:id', verifyToken, isAdmin, hotListingController.rejectHotRequest);

router.delete('/remove/:listing_id', verifyToken, isAdmin, videoController.removeVideo);

module.exports = router;
