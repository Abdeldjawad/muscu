const pool = require("../config/db");

// ✅ Créer un nouveau défi
exports.createChallenge = async (req, res) => {
  try {
    const { titre, description, objectif, date_fin } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO challenges (titre, description, objectif, date_fin) VALUES ($1, $2, $3, $4) RETURNING *",
      [titre, description, objectif, date_fin]
    );
    res.status(201).json({ message: "Défi créé avec succès !", challenge: rows[0] });
  } catch (error) {
    console.error("❌ Erreur lors de la création du défi :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ✅ Récupérer tous les défis
exports.getAllChallenges = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM challenges ORDER BY date_fin DESC");
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des défis :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ✅ Participer à un défi
exports.joinChallenge = async (req, res) => {
  try {
    const { userId, challengeId } = req.body;
    await pool.query(
      "INSERT INTO participations (user_id, challenge_id) VALUES ($1, $2)",
      [userId, challengeId]
    );
    res.status(200).json({ message: "Participation enregistrée avec succès !" });
  } catch (error) {
    console.error("❌ Erreur lors de la participation au défi :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ✅ Récupérer le classement d'un défi
exports.getLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { rows } = await pool.query(
      "SELECT users.nom, participations.points FROM participations JOIN users ON participations.user_id = users.id WHERE challenge_id = $1 ORDER BY points DESC",
      [challengeId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du classement :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
