const express = require("express");
const { askMuscuAI } = require("../controllers/forumController");

const router = express.Router();

router.post("/ask-ai", askMuscuAI);

module.exports = router;
