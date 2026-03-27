const express = require('express');
const { getAllUsers, toggleBlockUser } = require('../controllers/adminController');

const router = express.Router();

router.get('/users', getAllUsers);
router.patch('/users/:id/block', toggleBlockUser);

module.exports = router;
