const db = require('../config/db');

class Event {
    static async create(eventData) {
        const { title, description, start_date, end_date, location, owner_id } = eventData;
        const [result] = await db.query('INSERT INTO events (title, description, start_date, end_date, location, owner_id) VALUES (?, ?, ?, ?, ?, ?)', [title, description, start_date, end_date, location, owner_id]);
        
        // Ajouter le propriétaire comme participant
        await db.query('INSERT INTO event_participants (event_id, user_id, role) VALUES (?, ?, ?)', [result.insertId, owner_id, 'owner']);
        
        return result.insertId;
    }
    static async findById(id) {
        const [result] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
        return result[0];
    }
    static async findByOwnerId(ownerId) {
        const [result] = await db.query('SELECT * FROM events WHERE owner_id = ?', [ownerId]);
        return result;
    }
    static async findByParticipantId(participantId) {
        const [result] = await db.query('SELECT * FROM events WHERE owner_id = ? OR id IN (SELECT event_id FROM event_participants WHERE user_id = ?)', [participantId, participantId]);
        return result;
    }
    static async findByTaskId(taskId) { 
        const [result] = await db.query('SELECT * FROM events WHERE id IN (SELECT event_id FROM event_tasks WHERE id = ?)', [taskId]);
        return result[0];
    }
    static async findByExpenseId(expenseId) {
        const [result] = await db.query('SELECT * FROM events WHERE id IN (SELECT event_id FROM event_expenses WHERE id = ?)', [expenseId]);
        return result[0];
    }
    static async findByEventId(eventId) {
        const [result] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
        return result[0];
    }
    static async update(id, updateData) {
        const { title, description, start_date, end_date, location } = updateData;
        
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
        if (start_date !== undefined) {
            updateFields.push('start_date = ?');
            updateValues.push(start_date);
        }
        if (end_date !== undefined) {
            updateFields.push('end_date = ?');
            updateValues.push(end_date);
        }
        if (location !== undefined) {
            updateFields.push('location = ?');
            updateValues.push(location);
        }
        
        if (updateFields.length === 0) {
            throw new Error('Aucun champ à mettre à jour');
        }
        
        updateValues.push(id);
        
        const [result] = await db.query(
            `UPDATE events SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            updateValues
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Événement non trouvé');
        }
        
        // Retourner l'événement mis à jour
        return await Event.findById(id);
    }

    static async delete(id) {
        // Commencer une transaction pour supprimer en cascade
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // Supprimer d'abord les participants de l'événement
            await connection.query('DELETE FROM event_participants WHERE event_id = ?', [id]);
            
            // Supprimer les tâches associées à l'événement
            await connection.query('DELETE FROM event_tasks WHERE event_id = ?', [id]);
            
            // Supprimer les dépenses associées à l'événement
            await connection.query('DELETE FROM event_expenses WHERE event_id = ?', [id]);
            
            // Enfin, supprimer l'événement lui-même
            const [result] = await connection.query('DELETE FROM events WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                throw new Error('Événement non trouvé');
            }
            
            await connection.commit();
            return true;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async addParticipant(eventId, userId, role = 'participant') {
        const [result] = await db.query(
            'INSERT INTO event_participants (event_id, user_id, role, joined_at) VALUES (?, ?, ?, NOW())',
            [eventId, userId, role]
        );
        return result.insertId;
    }

    static async removeParticipant(eventId, userId) {
        const [result] = await db.query(
            'DELETE FROM event_participants WHERE event_id = ? AND user_id = ?',
            [eventId, userId]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Participant non trouvé');
        }
        return true;
    }

    static async isUserParticipant(eventId, userId) {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM event_participants WHERE event_id = ? AND user_id = ?',
            [eventId, userId]
        );
        return result[0].count > 0;
    }

    static async getParticipants(eventId) {
        const [result] = await db.query(`
            SELECT 
                ep.user_id,
                ep.role,
                ep.joined_at,
                u.username,
                u.email,
                u.fname,
                u.lname
            FROM event_participants ep
            JOIN users u ON ep.user_id = u.id
            WHERE ep.event_id = ?
            ORDER BY ep.joined_at ASC
        `, [eventId]);
        
        return result;
    }
}

module.exports = Event;