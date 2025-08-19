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
}

module.exports = Event;