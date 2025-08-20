const express = require('express');
const router = express.Router();
const EventController = require('../controllers/event.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/create', authMiddleware, EventController.createEvent);
router.get('/:id', EventController.getEventById);
router.get('/owner/:ownerId', EventController.getEventsByOwnerId);
router.get('/participant/:participantId', EventController.getEventsByParticipantId);
router.put('/:id', authMiddleware, EventController.updateEvent);
router.delete('/:id', authMiddleware, EventController.deleteEvent);

// Gestion des participants
router.post('/:eventId/participants', authMiddleware, EventController.addParticipant);
router.delete('/:eventId/participants/:userId', authMiddleware, EventController.removeParticipant);
router.get('/:eventId/participants', EventController.getEventParticipants);

module.exports = router;