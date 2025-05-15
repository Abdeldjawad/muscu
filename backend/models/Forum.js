const pool = require("../config/db");

const Forum = {
  async createPost(userId, title, content) {
    const { rows } = await pool.query(
      "INSERT INTO forum_posts (user_id, title, content, date) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [userId, title, content]
    );
    return rows[0];
  },

  async getAllPosts() {
    const { rows } = await pool.query("SELECT * FROM forum_posts ORDER BY date DESC");
    return rows;
  }
};

module.exports = Forum;
