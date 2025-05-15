const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/User");
const {getMessages} = require("../controllers/authController"); // ← ajoute ça !
const { Op } = require("sequelize"); // Required for Sequelize operators

const router = express.Router();

// 🔓 Route publique pour les messages des utilisateurs
router.get("/messages", getMessages);

// 🔒 Récupérer le profil utilisateur (auth requise)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    res.status(200).json({
      message: "Profil utilisateur récupéré avec succès",
      userId: req.user.userId,
    });
  } catch (error) {
    res.status(500).json({message: "Erreur serveur."});
  }
});
// In your userRoutes.js
router.post("/find-by-email", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmailCaseInsensitive(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User found",
      user: user
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//

// 🔓 Liste des utilisateurs (attention, ça expose tout)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({message: "Erreur serveur."});
  }
});

module.exports = router;
