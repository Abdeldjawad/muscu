const pool = require("../config/db");

const Message = {
  async sendMessage(senderId, receiverId, content) {
    const { rows } = await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, content, date) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [senderId, receiverId, content]
    );
    return rows[0];
  },

  async getUserMessages(userId) {
    const { rows } = await pool.query(
      "SELECT * FROM messages WHERE sender_id = $1 OR receiver_id = $1 ORDER BY date DESC",
      [userId]
    );
    return rows;
  }
};

module.exports = Message;
