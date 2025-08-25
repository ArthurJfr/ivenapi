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
        const [result] = await db.query(`
            SELECT DISTINCT e.* 
            FROM events e
            LEFT JOIN event_participants ep ON e.id = ep.event_id
            WHERE e.owner_id = ? OR ep.user_id = ?
            ORDER BY e.created_at DESC
        `, [participantId, participantId]);
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
            'INSERT INTO event_participants (event_id, user_id, role, created_at) VALUES (?, ?, ?, NOW())',
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
                ep.created_at,
                u.username,
                u.fname,
                u.lname
            FROM event_participants ep
            JOIN users u ON ep.user_id = u.id
            WHERE ep.event_id = ?
            ORDER BY ep.created_at ASC
        `, [eventId]);
        
        return result;
    }   
    static async getTasks(eventId) {
        const [result] = await db.query(`
            SELECT 
                et.id,
                et.owner_id,
                et.event_id,
                et.title,
                et.description,
                et.validated_by,
                et.created_at,
                et.updated_at,
                u.username as owner_username,
                u.fname as owner_fname,
                u.lname as owner_lname
            FROM event_tasks et
            LEFT JOIN users u ON et.owner_id = u.id
            WHERE et.event_id = ?
            ORDER BY et.created_at DESC
        `, [eventId]);
        
        return result;
    }

    // Méthodes de gestion des invitations
    static async createInvitation(eventId, invitedUserId, invitedBy, message = null, expiresInDays = 7) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
        
        const [result] = await db.query(
            'INSERT INTO event_invitations (event_id, invited_user_id, invited_by, message, expires_at) VALUES (?, ?, ?, ?, ?)',
            [eventId, invitedUserId, invitedBy, message, expiresAt]
        );
        return result.insertId;
    }

    static async getInvitation(invitationId) {
        const [result] = await db.query(`
            SELECT 
                ei.*,
                e.title as event_title,
                e.description as event_description,
                e.start_date,
                e.end_date,
                e.location,
                u1.username as invited_username,
                u1.fname as invited_fname,
                u1.lname as invited_lname,
                u1.email as invited_email,
                u2.username as inviter_username,
                u2.fname as inviter_fname,
                u2.lname as inviter_lname
            FROM event_invitations ei
            JOIN events e ON ei.event_id = e.id
            JOIN users u1 ON ei.invited_user_id = u1.id
            JOIN users u2 ON ei.invited_by = u2.id
            WHERE ei.id = ?
        `, [invitationId]);
        return result[0];
    }

    static async getInvitationsByEvent(eventId) {
        const [result] = await db.query(`
            SELECT 
                ei.*,
                u.username as invited_username,
                u.fname as invited_fname,
                u.lname as invited_lname,
                u.email as invited_email
            FROM event_invitations ei
            JOIN users u ON ei.invited_user_id = u.id
            WHERE ei.event_id = ?
            ORDER BY ei.created_at DESC
        `, [eventId]);
        return result;
    }

    static async getInvitationsByUser(userId) {
        const [result] = await db.query(`
            SELECT 
                ei.*,
                e.title as event_title,
                e.description as event_description,
                e.start_date,
                e.end_date,
                e.location,
                u.username as inviter_username,
                u.fname as inviter_fname,
                u.lname as inviter_lname
            FROM event_invitations ei
            JOIN events e ON ei.event_id = e.id
            JOIN users u ON ei.invited_by = u.id
            WHERE ei.invited_user_id = ? AND ei.status = 'pending'
            ORDER BY ei.created_at DESC
        `, [userId]);
        return result;
    }

    static async updateInvitationStatus(invitationId, status) {
        const [result] = await db.query(
            'UPDATE event_invitations SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, invitationId]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Invitation non trouvée');
        }
        return true;
    }

    static async deleteInvitation(invitationId) {
        const [result] = await db.query(
            'DELETE FROM event_invitations WHERE id = ?',
            [invitationId]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Invitation non trouvée');
        }
        return true;
    }

    static async isUserInvited(eventId, userId) {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM event_invitations WHERE event_id = ? AND invited_user_id = ? AND status = "pending"',
            [eventId, userId]
        );
        return result[0].count > 0;
    }

    static async cleanupExpiredInvitations() {
        const [result] = await db.query(
            'UPDATE event_invitations SET status = "expired" WHERE expires_at < NOW() AND status = "pending"'
        );
        return result.affectedRows;
    }
}

module.exports = Event;