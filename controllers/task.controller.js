const Task = require('../models/Task');

class TaskController {
    static async createTask(req, res) {
        try {
            const { title, description, event_id, owner_id } = req.body;
            const task = await Task.create({ title, description, event_id, owner_id });
            res.status(201).json(task);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTask(req, res) {
        try {
            const { id } = req.params;
            const task = await Task.findById(id);
            res.json(task);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTasksByEventId(req, res) {
        try {
            const { eventId } = req.params;
            const tasks = await Task.findByEventId(eventId);
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTasksByOwnerId(req, res) {
        try {
            const { ownerId } = req.params;
            const tasks = await Task.findByOwnerId(ownerId);
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTasksByParticipantId(req, res) {
        try {
            const { participantId } = req.params;
            const tasks = await Task.findByParticipantId(participantId);
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateTask(req, res) {
        try {
            const { id } = req.params;
            const { title, description, status, priority, due_date, assigned_to } = req.body;
            
            // Vérifier que la tâche existe
            const existingTask = await Task.findById(id);
            if (!existingTask) {
                return res.status(404).json({ error: 'Tâche non trouvée' });
            }

            // Vérifier que l'utilisateur est le propriétaire de la tâche
            if (existingTask.owner_id !== req.user.id) {
                return res.status(403).json({ error: 'Accès non autorisé. Seul le propriétaire peut modifier cette tâche.' });
            }

            // Mettre à jour la tâche
            const updatedTask = await Task.update(id, { title, description, status, priority, due_date, assigned_to });
            
            res.json({
                message: 'Tâche mise à jour avec succès',
                task: updatedTask
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = TaskController;
