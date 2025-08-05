const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/health.controller');

// Route pour le health check
router.get('/', HealthController.healthCheck);

module.exports = router;