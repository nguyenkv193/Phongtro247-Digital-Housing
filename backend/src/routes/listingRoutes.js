const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/home', listingController.getHomeListings);
router.get('/hot', listingController.getHotListings);
router.get('/by-type', listingController.getListingsByType);
router.get('/videos', listingController.getVideoListings);
router.get('/location-stats', listingController.getLocationStats);
router.get('/my-listings', verifyToken, listingController.getMyListings);
router.get('/:id', listingController.getListingById);

router.post('/create', verifyToken, upload.array('images', 10), listingController.createListing);
router.put('/:id', verifyToken, listingController.updateListing);
router.delete('/:id', verifyToken, listingController.deleteListing);
router.patch('/:id/hide', verifyToken, listingController.hideListing);
router.patch('/:id/unhide', verifyToken, listingController.unhideListing);

module.exports = router;
