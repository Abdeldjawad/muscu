const express = require("express");
const router = express.Router();
const {
    getWeightHistory,
    getCaloriesHistory,
    getPerformanceHistory,
    getMeasurementsHistory, addExampleData, addWeightEntry,addCaloriesEntry
} = require("../controllers/statsController");
const authMiddleware = require("../middlewares/authMiddleware");

// Test route to verify authentication
router.get("/test-auth", authMiddleware, (req, res) => {
    res.json({
        message: "Authentification réussie!",
        userId: req.user.userId
    });
});

// Stats routes
router.get("/weight", authMiddleware, getWeightHistory);
router.get("/calories", authMiddleware, getCaloriesHistory);
router.get("/performance", authMiddleware, getPerformanceHistory);
router.get("/measurements", authMiddleware, getMeasurementsHistory);
router.post("/add-example-data", authMiddleware, addExampleData);
router.post("/weight", authMiddleware, addWeightEntry);
router.post("/calories", authMiddleware, addCaloriesEntry);

module.exports = router;