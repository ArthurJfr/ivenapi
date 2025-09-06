const express = require('express');
const router = express.Router();
const EventController = require('../controllers/event.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * Middleware d'authentification
 * Toutes les routes suivantes nécessitent une authentification valide.
 */
router.use(authMiddleware);

/**
 * POST /events/create
 * Crée un nouvel événement.
 *
 * Body: { title: string, description?: string, date?: string, ... }
 * Auth: Requis
 * Retour: 201 Evénement créé
 */
router.post('/create', EventController.createEvent);

/**
 * GET /events/:id
 * Récupère un événement par identifiant.
 *
 * Params: { id: string }
 * Auth: Requis
 * Retour: 200 Détails de l'événement
 */
router.get('/:id', EventController.getEventById);

/**
 * PUT /events/:id
 * Met à jour un événement existant.
 *
 * Params: { id: string }
 * Body: champs modifiables de l'événement
 * Auth: Requis
 * Retour: 200 Evénement mis à jour
 */
router.put('/:id', EventController.updateEvent);

/**
 * DELETE /events/:id
 * Supprime un événement.
 *
 * Params: { id: string }
 * Auth: Requis
 * Retour: 200 Confirmation de suppression
 */
router.delete('/:id', EventController.deleteEvent);

/**
 * GET /events/owner/:ownerId
 * Liste les événements appartenant à un propriétaire donné.
 *
 * Params: { ownerId: string }
 * Auth: Requis
 * Retour: 200 Liste d'événements
 */
router.get('/owner/:ownerId', EventController.getEventsByOwnerId);

/**
 * GET /events/participant/:participantId
 * Liste les événements auxquels participe un utilisateur.
 *
 * Params: { participantId: string }
 * Auth: Requis
 * Retour: 200 Liste d'événements
 */
router.get('/participant/:participantId', EventController.getEventsByParticipantId);

/**
 * DELETE /events/:eventId/participants/:userId
 * Retire un participant d'un événement.
 *
 * Params: { eventId: string, userId: string }
 * Auth: Requis
 * Retour: 200 Confirmation
 */
router.delete('/:eventId/participants/:userId', EventController.removeParticipant);

/**
 * GET /events/:eventId/participants
 * Récupère la liste des participants d'un événement.
 *
 * Params: { eventId: string }
 * Auth: Requis
 * Retour: 200 Liste des participants
 */
router.get('/:eventId/participants', EventController.getEventParticipants);

/**
 * POST /events/:eventId/invite
 * Invite un utilisateur à un événement.
 *
 * Params: { eventId: string }
 * Body: { userId: string }
 * Auth: Requis
 * Retour: 200 Invitation créée
 */
router.post('/:eventId/invite', EventController.inviteUser);

/**
 * GET /events/:eventId/invitations
 * Récupère les invitations d'un événement.
 *
 * Params: { eventId: string }
 * Auth: Requis
 * Retour: 200 Liste d'invitations
 */
router.get('/:eventId/invitations', EventController.getEventInvitations);

/**
 * GET /events/invitations/user
 * Récupère les invitations reçues par l'utilisateur courant.
 *
 * Auth: Requis
 * Retour: 200 Liste d'invitations
 */
router.get('/invitations/user', EventController.getUserInvitations);

/**
 * PUT /events/invitations/:invitationId/respond
 * Répond à une invitation (accepter/refuser).
 *
 * Params: { invitationId: string }
 * Body: { response: 'accepted' | 'declined' }
 * Auth: Requis
 * Retour: 200 Invitation mise à jour
 */
router.put('/invitations/:invitationId/respond', EventController.respondToInvitation);

/**
 * DELETE /events/invitations/:invitationId
 * Annule une invitation envoyée.
 *
 * Params: { invitationId: string }
 * Auth: Requis
 * Retour: 200 Invitation annulée
 */
router.delete('/invitations/:invitationId', EventController.cancelInvitation);

/**
 * GET /events/search/users
 * Recherche d'utilisateurs (par critère fourni en query).
 *
 * Query: { q?: string }
 * Auth: Requis
 * Retour: 200 Liste d'utilisateurs correspondant au critère
 */
router.get('/search/users', EventController.searchUsers);

module.exports = router;