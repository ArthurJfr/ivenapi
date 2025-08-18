const Event = require('../models/Event');   

class EventController {
    static async createEvent(req, res) {
    const { title, description, date, location, owner_id } = req.body;
    const event = await Event.create({ title, description, date, location, owner_id });
    res.status(201).json(event);
};

    static async getEventById(req, res) {
    const { id } = req.params;
    const event = await Event.findById(id);
    res.json(event);
};
    static async getEventsByOwnerId(req, res) {
    const { ownerId } = req.params;
    const events = await Event.findByOwnerId(ownerId);
    res.json(events);
};
    static async getEventsByParticipantId(req, res) {
    const { participantId } = req.params;
    const events = await Event.findByParticipantId(participantId);
    res.json(events);
};
}
module.exports = EventController;




