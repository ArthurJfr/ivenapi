const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { requireAuthAndRole } = require('../middleware/authRole.middleware');

// Route pour récupérer les logs récents (pagination et filtres)
router.get('/recent', logController.getRecentLogs);

// Route pour obtenir les statistiques des logs
router.get('/stats', logController.getLogStats);

// Route pour récupérer les logs d'erreur
router.get('/errors', logController.getErrorLogs);

// Route pour récupérer les logs d'un utilisateur spécifique
router.get('/user/:userId', logController.getUserLogs);

// Route pour nettoyer les anciens logs (admin et superadmin)
router.delete('/clean', requireAuthAndRole('admin'), logController.cleanOldLogs);

// Route pour supprimer TOUS les logs (superadmin seulement)
router.delete('/clean-all', requireAuthAndRole('superadmin'), logController.cleanAllLogs);

module.exports = router;
