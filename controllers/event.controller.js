const Event = require('../models/Event');   

class EventController {
    static async createEvent(req, res) {
        try {
            const { title, description, start_date, end_date, location, owner_id } = req.body;
            const event = await Event.create({ title, description, start_date, end_date, location, owner_id });
            res.status(201).json(event);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getEventById(req, res) {
        try {
            const { id } = req.params;
            const event = await Event.findById(id);
            res.json(event);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getEventsByOwnerId(req, res) {
        try {
            const { ownerId } = req.params;
            const events = await Event.findByOwnerId(ownerId);
            res.json(events);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getEventsByParticipantId(req, res) {
        try {
            const { participantId } = req.params;
            const events = await Event.findByParticipantId(participantId);

            for (const event of events) {
                const participants = await Event.getParticipants(event.id);
                event.participants = participants;

                const tasks = await Event.getTasks(event.id);
                event.tasks = tasks;
            }
            res.json(events);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateEvent(req, res) {
        try {
            const { id } = req.params;
            const { title, description, start_date, end_date, location } = req.body;
            
            // Vérifier que l'événement existe
            const existingEvent = await Event.findById(id);
            if (!existingEvent) {
                return res.status(404).json({ error: 'Événement non trouvé' });
            }

            // Vérifier que l'utilisateur est le propriétaire de l'événement
            if (existingEvent.owner_id !== req.user.id) {
                return res.status(403).json({ error: 'Accès non autorisé. Seul le propriétaire peut modifier cet événement.' });
            }

            // Mettre à jour l'événement
            const updatedEvent = await Event.update(id, { title, description, start_date, end_date, location });
            
            res.json({
                message: 'Événement mis à jour avec succès',
                event: updatedEvent
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteEvent(req, res) {
        try {
            const { id } = req.params;
            
            // Vérifier que l'événement existe
            const existingEvent = await Event.findById(id);
            if (!existingEvent) {
                return res.status(404).json({ error: 'Événement non trouvé' });
            }

            // Vérifier que l'utilisateur est le propriétaire de l'événement
            if (existingEvent.owner_id !== req.user.id) {
                return res.status(403).json({ error: 'Accès non autorisé. Seul le propriétaire peut supprimer cet événement.' });
            }

            // Supprimer l'événement
            await Event.delete(id);
            
            res.json({
                message: 'Événement supprimé avec succès',
                eventId: id
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async addParticipant(req, res) {
        try {
            const { eventId } = req.params;
            const { userId, role = 'participant' } = req.body;
            
            // Vérifier que l'événement existe
            const existingEvent = await Event.findById(eventId);
            if (!existingEvent) {
                return res.status(404).json({ error: 'Événement non trouvé' });
            }

            // Vérifier que l'utilisateur est le propriétaire de l'événement
            if (existingEvent.owner_id !== req.user.id) {
                return res.status(403).json({ error: 'Accès non autorisé. Seul le propriétaire peut ajouter des participants.' });
            }

            // Vérifier que l'utilisateur à ajouter existe
            const User = require('../models/User');
            const userToAdd = await User.findById(userId);
            if (!userToAdd) {
                return res.status(404).json({ error: 'Utilisateur à ajouter non trouvé' });
            }

            // Vérifier que l'utilisateur n'est pas déjà participant
            const isAlreadyParticipant = await Event.isUserParticipant(eventId, userId);
            if (isAlreadyParticipant) {
                return res.status(400).json({ error: 'Cet utilisateur est déjà participant de cet événement' });
            }

            // Ajouter le participant
            const participant = await Event.addParticipant(eventId, userId, role);
            
            res.status(201).json({
                message: 'Participant ajouté avec succès',
                participant: {
                    event_id: eventId,
                    user_id: userId,
                    role: role,
                    username: userToAdd.username,
                    email: userToAdd.email
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async removeParticipant(req, res) {
        try {
            const { eventId, userId } = req.params;
            
            // Vérifier que l'événement existe
            const existingEvent = await Event.findById(eventId);
            if (!existingEvent) {
                return res.status(404).json({ error: 'Événement non trouvé' });
            }

            // Vérifier que l'utilisateur est le propriétaire de l'événement
            if (existingEvent.owner_id !== req.user.id) {
                return res.status(403).json({ error: 'Accès non autorisé. Seul le propriétaire peut retirer des participants.' });
            }

            // Vérifier que l'utilisateur à retirer est bien participant
            const isParticipant = await Event.isUserParticipant(eventId, userId);
            if (!isParticipant) {
                return res.status(400).json({ error: 'Cet utilisateur n\'est pas participant de cet événement' });
            }

            // Vérifier qu'on ne retire pas le propriétaire
            if (parseInt(userId) === existingEvent.owner_id) {
                return res.status(400).json({ error: 'Impossible de retirer le propriétaire de l\'événement' });
            }

            // Retirer le participant
            await Event.removeParticipant(eventId, userId);
            
            res.json({
                message: 'Participant retiré avec succès',
                eventId: eventId,
                userId: userId
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getEventParticipants(req, res) {
        try {
            const { eventId } = req.params;
            
            // Vérifier que l'événement existe
            const existingEvent = await Event.findById(eventId);
            if (!existingEvent) {
                return res.status(404).json({ error: 'Événement non trouvé' });
            }

            // Récupérer tous les participants
            const participants = await Event.getParticipants(eventId);
            
            res.json({
                event_id: eventId,
                participants: participants
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Méthodes de gestion des invitations
    static async inviteUser(req, res) {
        try {
            const { eventId } = req.params;
            const { userId, message } = req.body;
            
            // Vérifier que l'événement existe
            const existingEvent = await Event.findById(eventId);
            if (!existingEvent) {
                return res.status(404).json({ error: 'Événement non trouvé' });
            }

            // Vérifier que l'utilisateur est le propriétaire de l'événement
            if (existingEvent.owner_id !== req.user.id) {
                return res.status(403).json({ error: 'Accès non autorisé. Seul le propriétaire peut inviter des utilisateurs.' });
            }

            // Vérifier que l'utilisateur à inviter existe
            const User = require('../models/User');
            const userToInvite = await User.findById(userId);
            if (!userToInvite) {
                return res.status(404).json({ error: 'Utilisateur à inviter non trouvé' });
            }

            // Vérifier que l'utilisateur n'est pas déjà participant
            const isAlreadyParticipant = await Event.isUserParticipant(eventId, userId);
            if (isAlreadyParticipant) {
                return res.status(400).json({ error: 'Cet utilisateur est déjà participant de cet événement' });
            }

            // Vérifier que l'utilisateur n'est pas déjà invité
            const isAlreadyInvited = await Event.isUserInvited(eventId, userId);
            if (isAlreadyInvited) {
                return res.status(400).json({ error: 'Cet utilisateur est déjà invité à cet événement' });
            }

            // Créer l'invitation
            const invitationId = await Event.createInvitation(eventId, userId, req.user.id, message);
            
            // Récupérer l'invitation créée
            const invitation = await Event.getInvitation(invitationId);
            
            res.status(201).json({
                message: 'Invitation envoyée avec succès',
                invitation: {
                    id: invitationId,
                    event_id: eventId,
                    invited_user: {
                        id: userId,
                        username: userToInvite.username,
                        email: userToInvite.email,
                        fname: userToInvite.fname,
                        lname: userToInvite.lname
                    },
                    message: message,
                    expires_at: invitation.expires_at
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getEventInvitations(req, res) {
        try {
            const { eventId } = req.params;
            
            // Vérifier que l'événement existe
            const existingEvent = await Event.findById(eventId);
            if (!existingEvent) {
                return res.status(404).json({ error: 'Événement non trouvé' });
            }

            // Vérifier que l'utilisateur est le propriétaire de l'événement
            if (existingEvent.owner_id !== req.user.id) {
                return res.status(403).json({ error: 'Accès non autorisé. Seul le propriétaire peut voir les invitations.' });
            }

            // Récupérer toutes les invitations
            const invitations = await Event.getInvitationsByEvent(eventId);
            
            res.json({
                event_id: eventId,
                invitations: invitations
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getUserInvitations(req, res) {
        try {
            // Récupérer les invitations de l'utilisateur connecté
            const invitations = await Event.getInvitationsByUser(req.user.id);
            
            res.json({
                user_id: req.user.id,
                invitations: invitations
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async respondToInvitation(req, res) {
        try {
            const { invitationId } = req.params;
            const { response } = req.body; // 'accepted' ou 'declined'
            
            if (!['accepted', 'declined'].includes(response)) {
                return res.status(400).json({ error: 'Réponse invalide. Utilisez "accepted" ou "declined".' });
            }

            // Récupérer l'invitation
            const invitation = await Event.getInvitation(invitationId);
            if (!invitation) {
                return res.status(404).json({ error: 'Invitation non trouvée' });
            }

            // Vérifier que l'utilisateur est bien l'invité
            if (invitation.invited_user_id !== req.user.id) {
                return res.status(403).json({ error: 'Accès non autorisé. Vous ne pouvez répondre qu\'à vos propres invitations.' });
            }

            // Vérifier que l'invitation est encore en attente
            if (invitation.status !== 'pending') {
                return res.status(400).json({ error: 'Cette invitation a déjà été traitée ou a expiré.' });
            }

            // Mettre à jour le statut de l'invitation
            await Event.updateInvitationStatus(invitationId, response);

            if (response === 'accepted') {
                // Ajouter l'utilisateur comme participant
                await Event.addParticipant(invitation.event_id, req.user.id, 'participant');
                
                res.json({
                    message: 'Invitation acceptée. Vous êtes maintenant participant de l\'événement.',
                    event: {
                        id: invitation.event_id,
                        title: invitation.event_title,
                        start_date: invitation.start_date,
                        end_date: invitation.end_date,
                        location: invitation.location
                    }
                });
            } else {
                res.json({
                    message: 'Invitation déclinée.',
                    invitation_id: invitationId
                });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async cancelInvitation(req, res) {
        try {
            const { invitationId } = req.params;
            
            // Récupérer l'invitation
            const invitation = await Event.getInvitation(invitationId);
            if (!invitation) {
                return res.status(404).json({ error: 'Invitation non trouvée' });
            }

            // Vérifier que l'utilisateur est le propriétaire de l'événement
            const existingEvent = await Event.findById(invitation.event_id);
            if (existingEvent.owner_id !== req.user.id) {
                return res.status(403).json({ error: 'Accès non autorisé. Seul le propriétaire peut annuler une invitation.' });
            }

            // Vérifier que l'invitation est encore en attente
            if (invitation.status !== 'pending') {
                return res.status(400).json({ error: 'Cette invitation a déjà été traitée ou a expiré.' });
            }

            // Supprimer l'invitation
            await Event.deleteInvitation(invitationId);
            
            res.json({
                message: 'Invitation annulée avec succès',
                invitation_id: invitationId
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async searchUsers(req, res) {
        try {
            const { q: searchTerm, eventId, excludeParticipants = true } = req.query;
            
            if (!searchTerm || searchTerm.length < 2) {
                return res.status(400).json({ error: 'Le terme de recherche doit contenir au moins 2 caractères.' });
            }

            // Récupérer les utilisateurs correspondant à la recherche
            const User = require('../models/User');
            let users = await User.searchUsers(searchTerm);

            // Filtrer les utilisateurs déjà participants si demandé
            if (eventId && excludeParticipants === 'true') {
                const participants = await Event.getParticipants(eventId);
                const participantIds = participants.map(p => p.user_id);
                users = users.filter(user => !participantIds.includes(user.id));
            }

            // Limiter le nombre de résultats
            users = users.slice(0, 20);

            res.json({
                success: true,
                data: {
                    users: users,
                    count: users.length,
                    searchTerm: searchTerm
                },
                message: `${users.length} utilisateur(s) trouvé(s)`
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = EventController;




