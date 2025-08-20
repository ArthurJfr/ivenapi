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
}

module.exports = EventController;




