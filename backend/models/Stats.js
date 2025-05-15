const pool = require("../config/db");

const createStatsTables = async () => {
  try {
    console.log("Creating statistics tables...");
    await pool.query('BEGIN');

    // Weight history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS poids_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        poids FLOAT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

    // Calories history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS calories_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        calories INTEGER NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE
        )`);

    // Performance history table (fixed missing parenthesis)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS performance_history (
                                                       id SERIAL PRIMARY KEY,
                                                       user_id INTEGER REFERENCES users(id),
        exercise_type VARCHAR(50) NOT NULL,
        value FLOAT NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        CHECK (exercise_type IN ('squat', 'bench', 'deadlift', 'pullup'))
        )`);

    // Body measurements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS measurements_history (
                                                        id SERIAL PRIMARY KEY,
                                                        user_id INTEGER REFERENCES users(id),
        chest FLOAT,
        waist FLOAT,
        arms FLOAT,
        date DATE NOT NULL DEFAULT CURRENT_DATE
        )`);

    await pool.query('COMMIT');
    console.log("✅ Statistics tables ready!");
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("❌ Error creating stats tables:", error.message);
    throw error;
  }
};

// Single export statement
module.exports = {
  pool,
  initializeStats: async () => {
    try {
      await createStatsTables();
      return pool;
    } catch (error) {
      console.error("Failed to initialize stats tables:", error);
      process.exit(1);
    }
  }
};