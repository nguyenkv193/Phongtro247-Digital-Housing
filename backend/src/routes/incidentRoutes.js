const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, incidentController.createIncident);

router.get('/my-listings', verifyToken, incidentController.getIncidentsForLandlord);

router.patch('/:incidentId/status', verifyToken, incidentController.updateIncidentStatus);

module.exports = router;
