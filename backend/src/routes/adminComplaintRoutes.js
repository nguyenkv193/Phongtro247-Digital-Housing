const express = require('express');
const router = express.Router();
const {
    getAllComplaints,
    updateComplaintStatus,
} = require('../controllers/adminComplaintController');

router.get('/', getAllComplaints);
router.put('/:id', updateComplaintStatus);

module.exports = router;
