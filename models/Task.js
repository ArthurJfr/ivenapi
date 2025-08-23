const db = require('../config/db');

class Task {
    static async create(taskData) {
        const { title, description, event_id, owner_id } = taskData;
        const [result] = await db.query('INSERT INTO event_tasks (title, description, event_id, owner_id) VALUES (?, ?, ?, ?)', [title, description, event_id, owner_id]);
        return result.insertId;
    }
    static async findById(id) {
        const [result] = await db.query('SELECT * FROM event_tasks WHERE id = ?', [id]);
        return result[0];
    }
    static async findByEventId(eventId) {
        const [result] = await db.query('SELECT * FROM event_tasks WHERE event_id = ?', [eventId]);
        return result;
    }
    static async findByOwnerId(ownerId) {
        const [result] = await db.query('SELECT * FROM event_tasks WHERE owner_id = ?', [ownerId]);
        return result;
    }
    static async findByParticipantId(participantId) {
        const [result] = await db.query('SELECT * FROM event_tasks WHERE owner_id = ? OR id IN (SELECT event_id FROM event_participants WHERE user_id = ?)', [participantId, participantId]);
        return result;
    }

    static async update(id, updateData) {
        const { title, description, status, priority, due_date, assigned_to } = updateData;
        
        // Construire la requête de mise à jour dynamiquement
        const updateFields = [];
        const updateValues = [];
        
        if (title !== undefined) {
            updateFields.push('title = ?');
            updateValues.push(title);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }
        if (priority !== undefined) {
            updateFields.push('priority = ?');
            updateValues.push(priority);
        }
        if (due_date !== undefined) {
            updateFields.push('due_date = ?');
            updateValues.push(due_date);
        }
        if (assigned_to !== undefined) {
            updateFields.push('assigned_to = ?');
            updateValues.push(assigned_to);
        }
        
        if (updateFields.length === 0) {
            throw new Error('Aucun champ à mettre à jour');
        }
        
        updateValues.push(id);
        
        const [result] = await db.query(
            `UPDATE event_tasks SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            updateValues
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Tâche non trouvée');
        }
        
        // Retourner la tâche mise à jour
        return await Task.findById(id);
    }

    // Nouvelle méthode pour valider une tâche
    static async validateTask(taskId, validatorId) {
        try {
            // Vérifier que la tâche existe
            const task = await Task.findById(taskId);
            if (!task) {
                throw new Error('Tâche non trouvée');
            }

            // Mettre à jour la colonne validated_by
            const [result] = await db.query(
                'UPDATE event_tasks SET validated_by = ?, updated_at = NOW() WHERE id = ?',
                [validatorId, taskId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Erreur lors de la validation de la tâche');
            }

            // Retourner la tâche mise à jour
            return await Task.findById(taskId);
        } catch (error) {
            throw error;
        }
    }

    // Méthode pour annuler la validation d'une tâche
    static async unvalidateTask(taskId) {
        try {
            // Vérifier que la tâche existe
            const task = await Task.findById(taskId);
            if (!task) {
                throw new Error('Tâche non trouvée');
            }

            // Supprimer la validation (mettre validated_by à NULL)
            const [result] = await db.query(
                'UPDATE event_tasks SET validated_by = NULL, updated_at = NOW() WHERE id = ?',
                [taskId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Erreur lors de l\'annulation de la validation');
            }

            // Retourner la tâche mise à jour
            return await Task.findById(taskId);
        } catch (error) {
            throw error;
        }
    }

    // Méthode pour obtenir les tâches validées par un utilisateur
    static async findValidatedByUser(userId) {
        try {
            const [result] = await db.query(
                'SELECT * FROM event_tasks WHERE validated_by = ?',
                [userId]
            );
            return result;
        } catch (error) {
            throw new Error('Erreur lors de la récupération des tâches validées');
        }
    }
}

module.exports = Task;