const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth.middleware');
//const { requireAuthAndRole } = require('../middleware/authRole.middleware');

/**
 * POST /tasks/create
 * Crée une nouvelle tâche.
 *
 * Body: { title: string, description?: string, eventId?: string, ... }
 * Auth: Requis
 * Retour: 201 Tâche créée
 */
router.post('/create', authMiddleware, TaskController.createTask);
/**
 * GET /tasks/:id
 * Récupère une tâche par identifiant.
 *
 * Params: { id: string }
 * Auth: Public
 * Retour: 200 Tâche
 */
router.get('/:id', TaskController.getTask);
/**
 * GET /tasks/event/:eventId
 * Liste les tâches d'un événement.
 *
 * Params: { eventId: string }
 * Auth: Public
 * Retour: 200 Liste de tâches
 */
router.get('/event/:eventId', TaskController.getTasksByEventId);
/**
 * GET /tasks/owner/:ownerId
 * Liste les tâches créées par un propriétaire donné.
 *
 * Params: { ownerId: string }
 * Auth: Public
 * Retour: 200 Liste de tâches
 */
router.get('/owner/:ownerId', TaskController.getTasksByOwnerId);
/**
 * GET /tasks/participant/:participantId
 * Liste les tâches auxquelles un utilisateur participe.
 *
 * Params: { participantId: string }
 * Auth: Public
 * Retour: 200 Liste de tâches
 */
router.get('/participant/:participantId', TaskController.getTasksByParticipantId);
router.put('/:id', authMiddleware, TaskController.updateTask);

/**
 * POST /tasks/:id/validate
 * Valide une tâche.
 *
 * Params: { id: string }
 * Auth: Requis
 * Retour: 200 Tâche validée
 */
router.post('/:id/validate', authMiddleware, TaskController.validateTask);
/**
 * DELETE /tasks/:id/validate
 * Annule la validation d'une tâche.
 *
 * Params: { id: string }
 * Auth: Requis
 * Retour: 200 Validation annulée
 */
router.delete('/:id/validate', authMiddleware, TaskController.unvalidateTask);
/**
 * GET /tasks/validated-by/:userId
 * Liste les tâches validées par un utilisateur.
 *
 * Params: { userId: string }
 * Auth: Public
 * Retour: 200 Liste de tâches
 */
router.get('/validated-by/:userId', TaskController.getTasksValidatedByUser);

module.exports = router;
