const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/listing/:listingId', reviewController.getReviewsByListing);

router.post('/', verifyToken, reviewController.createReview);
router.delete('/:reviewId', verifyToken, reviewController.deleteReview);

router.get('/my-listings', verifyToken, reviewController.getReviewsForMyListings);
router.get('/my-reviews', verifyToken, reviewController.getMyReviews);

module.exports = router;
