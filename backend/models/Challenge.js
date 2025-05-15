const pool = require("../config/db");

const Challenge = {
  async create(name, description, reward) {
    const { rows } = await pool.query(
      "INSERT INTO challenges (name, description, reward, date_created) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [name, description, reward]
    );
    return rows[0];
  },

  async getAll() {
    const { rows } = await pool.query("SELECT * FROM challenges ORDER BY date_created DESC");
    return rows;
  }
};

module.exports = Challenge;
