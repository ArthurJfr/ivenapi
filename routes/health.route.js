const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/health.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Route publique pour le health check basique
router.get('/', HealthController.healthCheck);

// Route protégée pour le health check détaillé (nécessite authentification)
router.get('/protected', authMiddleware, HealthController.healthCheckProtected);

module.exports = router;