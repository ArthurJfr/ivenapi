const express = require('express');
const router = express.Router();
const EventController = require('../controllers/event.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Routes protégées par authentification
router.use(authMiddleware);

// Routes des événements
router.post('/create', EventController.createEvent);
router.get('/:id', EventController.getEventById);
router.put('/:id', EventController.updateEvent);
router.delete('/:id', EventController.deleteEvent);
router.get('/owner/:ownerId', EventController.getEventsByOwnerId);
router.get('/participant/:participantId', EventController.getEventsByParticipantId);

// Gestion des participants
//router.post('/:eventId/participants', EventController.addParticipant);
router.delete('/:eventId/participants/:userId', EventController.removeParticipant);
router.get('/:eventId/participants', EventController.getEventParticipants);

// Gestion des invitations
router.post('/:eventId/invite', EventController.inviteUser);
router.get('/:eventId/invitations', EventController.getEventInvitations);
router.get('/invitations/user', EventController.getUserInvitations);
router.put('/invitations/:invitationId/respond', EventController.respondToInvitation);
router.delete('/invitations/:invitationId', EventController.cancelInvitation);

// Recherche d'utilisateurs
router.get('/search/users', EventController.searchUsers);

module.exports = router;