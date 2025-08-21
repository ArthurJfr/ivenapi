const express = require('express');
const router = express.Router();
const EventController = require('../controllers/event.controller');
const authMiddleware = require('../middleware/auth.middleware');

//create event
router.post('/create', EventController.createEvent);
//single event
router.get('/:id', EventController.getEventById);

//get events by owner
router.get('/owner/:ownerId', EventController.getEventsByOwnerId);
router.get('/participant/:participantId', EventController.getEventsByParticipantId);

router.put('/:id', EventController.updateEvent);
router.delete('/:id', authMiddleware, EventController.deleteEvent);

// Gestion des participants
router.post('/:eventId/participants', EventController.addParticipant);
router.delete('/:eventId/participants/:userId', EventController.removeParticipant);
router.get('/:eventId/participants', EventController.getEventParticipants);

module.exports = router;