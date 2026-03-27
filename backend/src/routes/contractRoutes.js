const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

router.get('/listings/by-type', contractController.getListingsByType);
router.get('/tenants', contractController.getTenants);

router.get('/', contractController.getContracts);
router.get('/:id', contractController.getContractById);
router.post('/', contractController.createContract);
router.put('/:id', contractController.updateContract);
router.delete('/:id', contractController.deleteContract);

module.exports = router;
