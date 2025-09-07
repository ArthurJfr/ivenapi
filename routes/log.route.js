const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAuthAndRole } = require('../middleware/authRole.middleware');

/**
 * GET /recent
 * Récupère les logs récents avec pagination et filtres.
 *
 * Query:
 * - page?: number (défaut 1)
 * - limit?: number (défaut 20)
 * - level?: string ('info' | 'warn' | 'error' | ...)
 * - from?: string (ISO 8601)
 * - to?: string (ISO 8601)
 *
 * Auth: Public
 * Retour: 200 Liste paginée de logs
 */
router.get('/recent', requireAuthAndRole('admin'), logController.getRecentLogs);

/**
 * GET /stats
 * Retourne des statistiques agrégées sur les logs (par niveau, source, période, ...).
 *
 * Auth: Public
 * Retour: 200 Objet de statistiques
 */
router.get('/stats', requireAuthAndRole('admin'), logController.getLogStats);

/**
 * GET /errors
 * Récupère uniquement les logs de niveau "erreur".
 *
 * Query:
 * - page?: number (défaut 1)
 * - limit?: number (défaut 20)
 * - from?: string (ISO 8601)
 * - to?: string (ISO 8601)
 *
 * Auth: Public
 * Retour: 200 Liste paginée de logs d'erreur
 */
router.get('/errors', requireAuthAndRole('admin'), logController.getErrorLogs);

/**
 * GET /user/:userId
 * Récupère les logs associés à un utilisateur spécifique.
 *
 * Params:
 * - userId: string (identifiant utilisateur)
 *
 * Query:
 * - page?: number (défaut 1)
 * - limit?: number (défaut 20)
 *
 * Auth: Public
 * Retour: 200 Liste paginée de logs pour l'utilisateur
 */
router.get('/user/:userId', requireAuthAndRole('admin'), logController.getUserLogs);

/**
 * DELETE /clean
 * Supprime les anciens logs selon la stratégie définie (date d'expiration, etc.).
 *
 * Auth: Requiert authentification et rôle 'admin' (les 'superadmin' sont également autorisés)
 * Retour: 200 Détails sur le nombre de logs supprimés
 */
router.delete('/clean', requireAuthAndRole('superadmin'), logController.cleanOldLogs);

/**
 * DELETE /clean-all
 * Supprime tous les logs de la base. Opération destructive.
 *
 * Auth: Requiert authentification et rôle 'superadmin'
 * Retour: 200 Résumé de la suppression
 */
router.delete('/clean-all', requireAuthAndRole('superadmin'), logController.cleanAllLogs);
router.delete('/clean-all', requireAuthAndRole('superadmin'), logController.cleanAllLogs);

module.exports = router;
