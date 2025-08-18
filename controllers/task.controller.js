const Task = require('../models/Task');

class TaskController {
    static async createTask(req, res) {
        const { title, description, event_id, owner_id } = req.body;
        const task = await Task.create({ title, description, event_id, owner_id });
        res.status(201).json(task);
    }
    static async getTask(req, res) {
        const { id } = req.params;
        const task = await Task.findById(id);
        res.json(task);
    }
    static async getTasksByEventId(req, res) {
        const { eventId } = req.params;
        const tasks = await Task.findByEventId(eventId);
        res.json(tasks);
    }
    static async getTasksByOwnerId(req, res) {
        const { ownerId } = req.params;
        const tasks = await Task.findByOwnerId(ownerId);
        res.json(tasks);
    }
    static async getTasksByParticipantId(req, res) {
        const { participantId } = req.params;
        const tasks = await Task.findByParticipantId(participantId);
        res.json(tasks);
    }

}

module.exports = TaskController;
