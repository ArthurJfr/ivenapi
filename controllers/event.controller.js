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
}

module.exports = EventController;




