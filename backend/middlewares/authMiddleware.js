const jwt = require('jsonwebtoken');
const pool = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    // 1. Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: "❌ Authentification requise" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const { rows } = await pool.query('SELECT id FROM users WHERE id = $1', [decoded.userId]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "❌ Utilisateur non trouvé" });
    }

    // 4. Attach user to request
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.error("❌ Erreur d'authentification:", error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "❌ Token invalide" });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "❌ Session expirée" });
    }

    res.status(500).json({ message: "Erreur serveur" });
  }
};