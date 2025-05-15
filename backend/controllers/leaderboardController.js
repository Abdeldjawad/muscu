const pool = require("../config/db");

// ✅ Récupérer le classement général des défis
exports.getLeaderboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nom, SUM(c.points) AS total_points
      FROM users u
      JOIN challenge_participants cp ON u.id = cp.user_id
      JOIN challenges c ON cp.challenge_id = c.id
      GROUP BY u.id, u.nom
      ORDER BY total_points DESC
      LIMIT 10;
    `);

    res.status(200).json({ leaderboard: result.rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du classement :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ✅ Récupérer le classement pour un défi spécifique
exports.getChallengeLeaderboard = async (req, res) => {
  const { challengeId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT u.id, u.nom, cp.score
      FROM users u
      JOIN challenge_participants cp ON u.id = cp.user_id
      WHERE cp.challenge_id = $1
      ORDER BY cp.score DESC
      LIMIT 10;
    `,
      [challengeId]
    );

    res.status(200).json({ leaderboard: result.rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du classement du défi :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
