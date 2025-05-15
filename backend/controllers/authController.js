const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const pool = require("../config/db");
exports.register = async (req, res) => {
  try {
    const { nom, email, password, age, poids, taille, sexe } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "❌ Cet email est déjà utilisé. Essayez un autre !" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create(nom, email, hashedPassword, age, poids, taille, sexe);

    res.status(201).json({ message: "✅ Inscription réussie !", user: newUser });
  } catch (error) {
    console.error("❌ Erreur d'inscription :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
exports.updateMessage = async (req, res) => {
  try {
    const { userId } = req.user;
    const { message } = req.body;

    await pool.query("UPDATE users SET message = $1 WHERE id = $2", [message, userId]);

    console.log(`✅ Message de l'utilisateur ${userId} mis à jour :`, message);

    res.status(200).json({ message: "Message enregistré avec succès." });
  } catch (error) {
    console.error("❌ Erreur updateMessage :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
exports.getMessages = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT nom, message FROM users WHERE message IS NOT NULL AND message <> ''");
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erreur getMessages :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
exports.updateMessage = async (req, res) => {
  const { userId } = req.user;
  const { message } = req.body;

  if (!message) return res.status(400).json({ message: "Message requis" });

  try {
    const { rowCount } = await pool.query(
      "UPDATE users SET message = $1 WHERE id = $2",
      [message, userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log(`✅ Message enregistré par l'utilisateur ${userId} :`, message);
    res.status(200).json({ message: "Message mis à jour avec succès" });
  } catch (err) {
    console.error("❌ Erreur updateMessage:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateUserProfile = async (req, res) => {
  console.log("📥 Requête reçue pour mise à jour :", req.body);

  try {
    const { userId } = req.user;
    const { age, taille, sexe, poids } = req.body;

    if (!age || !taille || !sexe) {
      return res.status(400).json({ message: "❌ Tous les champs sont requis." });
    }

    const { rowCount } = await pool.query(
      "UPDATE users SET age = $1, taille = $2, sexe = $3, poids = $4 WHERE id = $5",
      [age, taille, sexe, poids, userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "❌ Utilisateur non trouvé." });
    }

    // ✅ Ajouter dans l'historique des poids
    if (poids) {
      await pool.query(
        "INSERT INTO poids_history (user_id, poids) VALUES ($1, $2)",
        [userId, poids]
      );
      console.log(`📊 Historique poids mis à jour pour user ${userId} avec poids ${poids}`);
    }

    console.log(`✅ Mise à jour utilisateur ${userId} réussie :`, { age, taille, sexe, poids });
    res.status(200).json({ message: "✅ Profil mis à jour avec succès." });

  } catch (error) {
    console.error("❌ Erreur mise à jour profil :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email);

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "❌ Email et mot de passe requis.",
        errorCode: "MISSING_CREDENTIALS"
      });
    }

    // Find user with password field included
    const user = await User.findByEmail(email, false); // false = don't exclude sensitive fields
    if (!user || !user.password) {
      console.log('User not found or missing password:', email);
      return res.status(400).json({
        message: "❌ Identifiants incorrects.",
        errorCode: "INVALID_CREDENTIALS" // Generic message for security
      });
    }

    // Debug logs (remove in production)
    console.log(`Comparing password for user ${user.id}`);
    console.log('Input password length:', password.length);
    console.log('Stored hash length:', user.password.length);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "❌ Identifiants incorrects.",
        errorCode: "INVALID_CREDENTIALS"
      });
    }

    // Verify JWT secret is configured
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin || false // Include if you have admin flag
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "✅ Connexion réussie !",
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom
        // Exclude sensitive data
      }
    });

  } catch (error) {
    console.error("Login error:", {
      error: error.message,
      stack: error.stack.split("\n")[0] // Just first line of stack
    });

    res.status(500).json({
      message: "Erreur serveur",
      errorCode: "SERVER_ERROR",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

