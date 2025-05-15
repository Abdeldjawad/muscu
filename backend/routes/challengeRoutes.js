const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getLeaderboard, getChallengeLeaderboard } = require("../controllers/leaderboardController");

const router = express.Router();

router.get("/leaderboard", authMiddleware, getLeaderboard); // ✅ Classement général
router.get("/leaderboard/:challengeId", authMiddleware, getChallengeLeaderboard); // ✅ Classement par défi

module.exports = router;
