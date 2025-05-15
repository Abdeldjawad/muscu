const express = require("express");
const { register, login, updateUserProfile,updateMessage, getMessages } = require("../controllers/authController"); // ✅ Vérifie bien cet import
const authMiddleware = require("../middlewares/authMiddleware"); // ✅ Vérifie que le middleware est bien importé

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/profile", authMiddleware, updateUserProfile); // ✅ Route de mise à jour du profil
router.put("/message", authMiddleware, updateMessage);
router.get("/messages", getMessages);


module.exports = router;
