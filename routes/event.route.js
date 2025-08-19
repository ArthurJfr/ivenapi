const express = require('express');
const router = express.Router();
const EventController = require('../controllers/event.controller');



router.post('/create', EventController.createEvent);
router.get('/:id', EventController.getEventById);
router.get('/owner/:ownerId', EventController.getEventsByOwnerId);
router.get('/participant/:participantId', EventController.getEventsByParticipantId);

module.exports = router;