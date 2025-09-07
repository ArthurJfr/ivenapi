const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/health.controller');
const { requireAuthAndRole } = require('../middleware/authRole.middleware');

/**
 * GET /health
 * Vérification basique de l'état du service.
 *
 * Auth: Public
 * Retour: 200 Détails de l'état
 */
router.get('/', HealthController.healthCheck);

/**
 * GET /health/protected
 * Vérification détaillée du service (accès protégé).
 *
 * Auth: Requis
 * Retour: 200 Détails avancés de l'état
 */
router.get('/protected', requireAuthAndRole('admin'), HealthController.healthCheckProtected);

module.exports = router;