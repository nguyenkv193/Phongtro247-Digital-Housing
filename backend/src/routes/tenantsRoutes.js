const express = require('express');
const router = express.Router();
const tenantsController = require('../controllers/tenantsController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/wards', tenantsController.getWards);

router.get('/', tenantsController.getAllTenants);

router.get('/my-info', verifyToken, tenantsController.getMyTenantInfo);

router.post('/', tenantsController.createTenant);

router.patch('/:id', tenantsController.updateTenant);

module.exports = router;
