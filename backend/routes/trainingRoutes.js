const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { logTraining, getTrainingHistory } = require("../controllers/trainingController");

const router = express.Router();

router.post("/log", authMiddleware, logTraining); // ✅ Ajouter un entraînement
router.get("/history", authMiddleware, getTrainingHistory); // ✅ Historique des entraînements

module.exports = router;
