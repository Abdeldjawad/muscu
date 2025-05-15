const pool = require("../config/db");

exports.logTraining = async (req, res) => {
  try {
    const { userId, type, duration, calories } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO trainings (user_id, type, duration, calories, date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [userId, type, duration, calories]
    );
    res.status(201).json({ message: "Entraînement ajouté avec succès !", training: rows[0] });
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de l'entraînement :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getTrainingHistory = async (req, res) => {
  try {
    const { userId } = req.user;
    const { rows } = await pool.query("SELECT * FROM trainings WHERE user_id = $1 ORDER BY date DESC", [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'historique des entraînements :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
