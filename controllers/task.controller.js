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

    // Nouvelle méthode pour valider une tâche
    static async validateTask(req, res) {
        try {
            const { id } = req.params;
            const validatorId = req.user.id; // ID de l'utilisateur connecté

            // Vérifier que la tâche existe
            const existingTask = await Task.findById(id);
            if (!existingTask) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Tâche non trouvée' 
                });
            }

            // Vérifier que l'utilisateur n'est pas le propriétaire de la tâche
            // (un propriétaire ne peut pas valider sa propre tâche)
            // if (existingTask.owner_id === validatorId) {
            //     return res.status(403).json({ 
            //         success: false,
            //         error: 'Vous ne pouvez pas valider votre propre tâche' 
            //     });
            // }

            // Vérifier que la tâche n'est pas déjà validée
            if (existingTask.validated_by) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Cette tâche est déjà validée' 
                });
            }

            // Valider la tâche
            const validatedTask = await Task.validateTask(id, validatorId);
            
            res.json({
                success: true,
                message: 'Tâche validée avec succès',
                task: validatedTask
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    // Méthode pour annuler la validation d'une tâche
    static async unvalidateTask(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Vérifier que la tâche existe
            const existingTask = await Task.findById(id);
            if (!existingTask) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Tâche non trouvée' 
                });
            }

            // Vérifier que l'utilisateur est celui qui a validé la tâche
            if (existingTask.validated_by !== userId) {
                return res.status(403).json({ 
                    success: false,
                    error: 'Seul le validateur peut annuler sa validation' 
                });
            }

            // Annuler la validation
            const unvalidatedTask = await Task.unvalidateTask(id);
            
            res.json({
                success: true,
                message: 'Validation de la tâche annulée',
                task: unvalidatedTask
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    // Méthode pour obtenir les tâches validées par un utilisateur
    static async getTasksValidatedByUser(req, res) {
        try {
            const { userId } = req.params;
            const tasks = await Task.findValidatedByUser(userId);
            
            res.json({
                success: true,
                data: {
                    tasks,
                    count: tasks.length
                },
                message: `${tasks.length} tâches validées trouvées`
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }
}

module.exports = TaskController;
