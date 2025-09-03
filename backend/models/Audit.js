const { query } = require('../config/db');

class Audit {
  static async log({ userId, userName, userEmail, action, details }) {
    const sql = `INSERT INTO audit_logs (user_id, user_name, user_email, action, details, timestamp) VALUES (?, ?, ?, ?, ?, NOW())`;
    await query(sql, [userId, userName, userEmail, action, details]);
  }

  static async getAll() {
    const sql = 'SELECT * FROM audit_logs ORDER BY timestamp DESC';
    const results = await query(sql);
    return results[0];
  }
}

module.exports = Audit;
