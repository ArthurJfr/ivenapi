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
}

module.exports = Task;