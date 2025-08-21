const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');
//const authMiddleware = require('../middleware/auth.middleware');

// Routes pour les tâches
router.post('/create', TaskController.createTask);
router.get('/:id', TaskController.getTask);
router.get('/event/:eventId', TaskController.getTasksByEventId);
router.get('/owner/:ownerId', TaskController.getTasksByOwnerId);
router.get('/participant/:participantId', TaskController.getTasksByParticipantId);
router.put('/:id', TaskController.updateTask);

module.exports = router;
