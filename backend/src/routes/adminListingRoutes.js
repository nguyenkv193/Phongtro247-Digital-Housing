const express = require('express');
const router = express.Router();
const {
    getAllListings,
    updateHotLabel,
    updateStatus,
} = require('../controllers/adminListingController');

router.get('/', getAllListings);

router.put('/:id', updateHotLabel);

router.put('/:id/status', updateStatus);

module.exports = router;
