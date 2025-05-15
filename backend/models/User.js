const pool = require("../config/db");
const { Op } = require("sequelize"); // Still available if needed for other parts

// Créer la table si elle n'existe pas
const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        age INT,
        poids FLOAT,
        taille FLOAT,
        sexe VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Table 'users' prête !");
  } catch (error) {
    console.error("❌ Erreur création table users :", error.message);
  }
};

createTable();

// Fonctions d'interaction avec la base de données
const User = {
  async findByEmail(email, excludeSensitive = true) {
    try {
      let query = "SELECT id, nom, email, age, poids, taille, sexe";
      if (!excludeSensitive) {
        query = "SELECT *";
      }
      query += " FROM users WHERE LOWER(email) = LOWER($1)";

      const { rows } = await pool.query(query, [email]);
      return rows[0];
    } catch (error) {
      console.error("Error in findByEmail:", error);
      throw error;
    }
  },

  async create(nom, email, password, age, poids, taille, sexe) {
    const { rows } = await pool.query(
        "INSERT INTO users (nom, email, password, age, poids, taille, sexe) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nom, email, age, poids, taille, sexe",
        [nom, email, password, age, poids, taille, sexe]
    );
    return rows[0];
  },

  async findAll() {
    const { rows } = await pool.query("SELECT id, nom, email, age, poids, taille, sexe FROM users");
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
        "SELECT id, nom, email, age, poids, taille, sexe FROM users WHERE id = $1",
        [id]
    );
    return rows[0];
  },

  // New method for case-insensitive search with exclusions
  async findByEmailCaseInsensitive(email) {
    const { rows } = await pool.query(
        `SELECT id, nom, email, age, poids, taille, sexe 
       FROM users 
       WHERE email ILIKE $1`,
        [email]
    );
    return rows[0];
  }
};

module.exports = User;