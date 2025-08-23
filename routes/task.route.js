const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth.middleware');
//const { requireAuthAndRole } = require('../middleware/authRole.middleware');

// Routes pour les tâches
router.post('/create', authMiddleware, TaskController.createTask);
router.get('/:id', TaskController.getTask);
router.get('/event/:eventId', TaskController.getTasksByEventId);
router.get('/owner/:ownerId', TaskController.getTasksByOwnerId);
router.get('/participant/:participantId', TaskController.getTasksByParticipantId);
router.put('/:id', authMiddleware, TaskController.updateTask);

// Nouvelles routes pour la validation
router.post('/:id/validate', authMiddleware, TaskController.validateTask);
router.delete('/:id/validate', authMiddleware, TaskController.unvalidateTask);
router.get('/validated-by/:userId', TaskController.getTasksValidatedByUser);

module.exports = router;
