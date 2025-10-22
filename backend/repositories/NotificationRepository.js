const { query } = require('../config/db');

class NotificationRepository {
  async create(data = {}) {
    const { user_id, type = 'info', title = '', message = '', metadata = null } = data;
    const sql = `INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())`;
    const params = [user_id, type, title, message, metadata ? JSON.stringify(metadata) : null];
    const result = await query(sql, params);
    return result.insertId || (result[0] && result[0].insertId) || null;
  }

  async listByUser(user_id, { limit = 50, offset = 0 } = {}) {
    const sql = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const results = await query(sql, [user_id, Number(limit), Number(offset)]);
    const rows = results[0] || [];
    return rows.map(r => {
      try { r.metadata = r.metadata ? JSON.parse(r.metadata) : null; } catch(e){ r.metadata = null; }
      r.is_read = !!r.is_read; return r;
    });
  }

  async markRead(id) {
    await query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new NotificationRepository();
