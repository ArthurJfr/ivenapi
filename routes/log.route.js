const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');

// Route pour récupérer les logs récents (pagination et filtres)
router.get('/recent', logController.getRecentLogs);

// Route pour obtenir les statistiques des logs
router.get('/stats', logController.getLogStats);

// Route pour récupérer les logs d'erreur
router.get('/errors', logController.getErrorLogs);

// Route pour récupérer les logs d'un utilisateur spécifique
router.get('/user/:userId', logController.getUserLogs);

// Route pour nettoyer les anciens logs (admin)
router.delete('/clean', logController.cleanOldLogs);

// Route pour supprimer TOUS les logs (admin)
router.delete('/clean-all', logController.cleanAllLogs);

module.exports = router;
