const express = require("express");
const router = express.Router();
const exerciceController = require("../controllers/exerciceController");

router.get("/", exerciceController.getAllExercices);
router.post("/examples", exerciceController.addExampleExercises);

module.exports = router;