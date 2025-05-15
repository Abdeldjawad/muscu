const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const pool = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const trainingRoutes = require("./routes/trainingRoutes");
const statsRoutes = require("./routes/statsRoutes");
const forumRoutes = require("./routes/forumRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const programmeRoutes = require("./routes/programmeRoutes");
const exerciceRoutes = require("./routes/exerciceRoutes");

const { initializeStats } = require("./models/Stats"); // Correct import path
const { initializeExercice } = require("./models/Exercice"); // Correct import path
const { initializeProgrammes } = require("./models/Programme"); // Correct import path

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

// Verify database connection
pool.connect()
    .then(() => console.log("✅ PostgreSQL connecté !"))
    .catch(err => console.error("❌ Erreur PostgreSQL :", err.message));

// Initialize and start server
async function startServer() {
  try {
    await initializeStats();
    await initializeExercice();
    await initializeProgrammes();
    console.log("✅ Database tables verified");

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/user", userRoutes);
    app.use("/api/training", trainingRoutes);
    app.use("/api/stats", statsRoutes);
    app.use("/api/programmes", programmeRoutes);
    app.use("/api/forum", forumRoutes);
    app.use("/api/challenge", challengeRoutes);
    // Add this with other app.use() routes
    app.use("/api/exercices", exerciceRoutes);

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ message: "❌ Route non trouvée !" });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize server:", error);
    process.exit(1);
  }
}

startServer();