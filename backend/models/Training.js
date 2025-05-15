const pool = require("../config/db");

const Training = {
  async create(userId, type, duration, calories) {
    const { rows } = await pool.query(
      "INSERT INTO trainings (user_id, type, duration, calories, date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [userId, type, duration, calories]
    );
    return rows[0];
  },

  async getByUser(userId) {
    const { rows } = await pool.query("SELECT * FROM trainings WHERE user_id = $1 ORDER BY date DESC", [userId]);
    return rows;
  }
};

module.exports = Training;
