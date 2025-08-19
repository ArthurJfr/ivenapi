const express = require('express');
const router = express.Router();
const EventController = require('../controllers/event.controller');
const authMiddleware = require('../middlewares/auth.middleware');



router.post('/create', authMiddleware, EventController.createEvent);
router.get('/:id', EventController.getEventById);
router.get('/owner/:ownerId', EventController.getEventsByOwnerId);
router.get('/get-all/:participantId', EventController.getAllEvents);

module.exports = router;