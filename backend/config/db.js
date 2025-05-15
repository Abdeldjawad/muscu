const { Pool } = require("pg");
require("dotenv").config();


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log("PostgreSQL connecté !"))
  .catch((err) => {
    console.error(" Erreur de connexion PostgreSQL :", err.message);
    process.exit(1);
  });

module.exports = pool;
