const pool = require("../config/db");

// Helper function to validate user ID
const validateUserId = (req, res) => {
  if (!req.user?.userId) {
    console.error('User ID missing in request');
    res.status(400).json({ message: "Authentication required" });
    return false;
  }
  return true;
};

// Common error handler
const handleError = (res, error, context) => {
  console.error(`❌ Error in ${context}:`, error);
  res.status(500).json({ message: "Server error" });
};

// Weight History
exports.getWeightHistory = async (req, res) => {
  if (!validateUserId(req, res)) return;

  try {
    const { rows } = await pool.query(
        `SELECT
           id,
           poids AS value, 
        TO_CHAR(date, 'YYYY-MM-DD') AS date
         FROM poids_history
         WHERE user_id = $1
         ORDER BY date ASC`,
        [req.user.userId]
    );
    res.status(200).json(rows || []);
  } catch (error) {
    handleError(res, error, "getWeightHistory");
  }
};


exports.addWeightEntry = async (req, res) => {
  if (!validateUserId(req, res)) return;

  try {
    const { value, date } = req.body;
    const userId = req.user.userId;

    if (!value) {
      return res.status(400).json({ message: "Weight value required" });
    }

    const { rows } = await pool.query(
        `INSERT INTO poids_history (user_id, poids, date) 
       VALUES ($1, $2, $3) 
       RETURNING id, poids AS value, TO_CHAR(date, 'YYYY-MM-DD') AS date`,
        [userId, value, date || new Date()]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    handleError(res, error, "addWeightEntry");
  }
};

// Add Calories Entry
exports.addCaloriesEntry = async (req, res) => {
  if (!validateUserId(req, res)) return;

  try {
    const { value, date } = req.body;
    const userId = req.user.userId;

    if (!value) {
      return res.status(400).json({ message: "Calories value required" });
    }

    const { rows } = await pool.query(
        `INSERT INTO calories_history (user_id, calories, date) 
       VALUES ($1, $2, $3) 
       RETURNING id, calories AS value, TO_CHAR(date, 'YYYY-MM-DD') AS date`,
        [userId, value, date || new Date()]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    handleError(res, error, "addCaloriesEntry");
  }
};

// Calories History
exports.getCaloriesHistory = async (req, res) => {
  if (!validateUserId(req, res)) return;

  try {
    const { rows } = await pool.query(
        `SELECT
           id,
           calories AS value, 
        TO_CHAR(date, 'YYYY-MM-DD') AS date
         FROM calories_history
         WHERE user_id = $1
         ORDER BY date ASC`,
        [req.user.userId]
    );
    res.status(200).json(rows || []);
  } catch (error) {
    handleError(res, error, "getCaloriesHistory");
  }
};

// Performance History
exports.getPerformanceHistory = async (req, res) => {
  if (!validateUserId(req, res)) return;

  try {
    const { rows } = await pool.query(
        `SELECT
           id,
           exercise_type AS type,
           value,
           TO_CHAR(date, 'YYYY-MM-DD') AS date
         FROM performance_history
         WHERE user_id = $1
         ORDER BY date ASC`,
        [req.user.userId]
    );
    res.status(200).json(rows || []);
  } catch (error) {
    handleError(res, error, "getPerformanceHistory");
  }
};

// Body Measurements
exports.getMeasurementsHistory = async (req, res) => {
  if (!validateUserId(req, res)) return;

  try {
    const { rows } = await pool.query(
        `SELECT
           id,
           chest,
           waist,
           arms,
           TO_CHAR(date, 'YYYY-MM-DD') AS date
         FROM measurements_history
         WHERE user_id = $1
         ORDER BY date ASC`,
        [req.user.userId]
    );
    res.status(200).json(rows || []);
  } catch (error) {
    handleError(res, error, "getMeasurementsHistory");
  }
};

// Add new stats entries
exports.addStatEntry = async (req, res) => {
  if (!validateUserId(req, res)) return;

  const { type } = req.params;
  const userId = req.user.userId;

  try {
    let query, values;

    switch (type) {
      case 'weight':
        if (!req.body.value) {
          return res.status(400).json({ message: "Weight value required" });
        }
        query = `INSERT INTO poids_history (user_id, poids) VALUES ($1, $2) RETURNING *`;
        values = [userId, req.body.value];
        break;

      case 'calories':
        if (!req.body.value) {
          return res.status(400).json({ message: "Calories value required" });
        }
        query = `INSERT INTO calories_history (user_id, calories) VALUES ($1, $2) RETURNING *`;
        values = [userId, req.body.value];
        break;

      case 'performance':
        if (!req.body.exerciseType || !req.body.value) {
          return res.status(400).json({ message: "Exercise type and value required" });
        }
        query = `INSERT INTO performance_history (user_id, exercise_type, value) VALUES ($1, $2, $3) RETURNING *`;
        values = [userId, req.body.exerciseType, req.body.value];
        break;

      case 'measurements':
        if (!req.body.chest && !req.body.waist && !req.body.arms) {
          return res.status(400).json({ message: "At least one measurement required" });
        }
        query = `INSERT INTO measurements_history (user_id, chest, waist, arms) VALUES ($1, $2, $3, $4) RETURNING *`;
        values = [userId, req.body.chest || null, req.body.waist || null, req.body.arms || null];
        break;

      default:
        return res.status(400).json({ message: "Invalid stat type" });
    }

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);

  } catch (error) {
    handleError(res, error, `addStatEntry (${type})`);
  }
};

exports.addExampleData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const currentDate = new Date();
    const now = new Date();
    const dates = [
      new Date(now.setDate(now.getDate() - 30)),
      new Date(now.setDate(now.getDate() + 10)),
      new Date(now.setDate(now.getDate() + 10)),
      new Date(now.setDate(now.getDate() + 10))
    ];

    // Verify tables exist first
    await pool.query('SELECT 1 FROM poids_history LIMIT 1');
    await pool.query('SELECT 1 FROM calories_history LIMIT 1');
    await pool.query('SELECT 1 FROM performance_history LIMIT 1');
    await pool.query('SELECT 1 FROM measurements_history LIMIT 1');

    // Add example data within a transaction
    await pool.query('BEGIN');

    await pool.query(
        'INSERT INTO poids_history (user_id, poids, date) VALUES ($1, $2, $3) RETURNING *',
        [userId, 75.5, dates[0]]

    );
    await pool.query(
        'INSERT INTO poids_history (user_id, poids, date) VALUES ($1, $2, $3) RETURNING *',
        [userId, 77, dates[1]]

    );
    await pool.query(
        'INSERT INTO poids_history (user_id, poids, date) VALUES ($1, $2, $3) RETURNING *',
        [userId, 79, dates[2]]

    );
    await pool.query(
        'INSERT INTO poids_history (user_id, poids, date) VALUES ($1, $2, $3) RETURNING *',
        [userId, 82, dates[3]]

    );

    await pool.query(
        'INSERT INTO calories_history (user_id, calories, date) VALUES ($1, $2, $3) RETURNING *',
        [userId, 2200, dates[0]]
    );
    await pool.query(
        'INSERT INTO calories_history (user_id, calories, date) VALUES ($1, $2, $3) RETURNING *',
        [userId, 3000, dates[1]]
    );
    await pool.query(
        'INSERT INTO calories_history (user_id, calories, date) VALUES ($1, $2, $3) RETURNING *',
        [userId, 2300, dates[2]]
    );
    await pool.query(
        'INSERT INTO calories_history (user_id, calories, date) VALUES ($1, $2, $3) RETURNING *',
        [userId, 2600, dates[3]]
    );

    await pool.query(
        'INSERT INTO performance_history (user_id, exercise_type, value, date) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, 'squat', 85, dates[0]]
    );
    await pool.query(
        'INSERT INTO performance_history (user_id, exercise_type, value, date) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, 'squat', 100, dates[1]]
    );
    await pool.query(
        'INSERT INTO performance_history (user_id, exercise_type, value, date) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, 'squat', 102, dates[2]]
    );
    await pool.query(
        'INSERT INTO performance_history (user_id, exercise_type, value, date) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, 'squat', 120, dates[3]]
    );

    await pool.query(
        'INSERT INTO performance_history (user_id, exercise_type, value, date) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, 'bench', 65, dates[0]]
    );
    await pool.query(
        'INSERT INTO performance_history (user_id, exercise_type, value, date) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, 'bench', 70, dates[1]]
    );
    await pool.query(
        'INSERT INTO performance_history (user_id, exercise_type, value, date) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, 'bench', 73, dates[2]]
    );
    await pool.query(
        'INSERT INTO performance_history (user_id, exercise_type, value, date) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, 'bench', 80, dates[3]]
    );

    await pool.query(
        'INSERT INTO measurements_history (user_id, chest, waist, date) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, 95, 82, currentDate]
    );

    await pool.query('COMMIT');

    res.status(201).json({
      success: true,
      message: "✅ Example data added successfully!",
      data: {
        weight: 75.5,
        calories: 2200,
        squat: 85,
        bench: 65,
        chest: 95,
        waist: 82
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Error adding example data:", error);

    if (error.code === '42P01') { // Table doesn't exist
      res.status(500).json({
        success: false,
        message: "Database tables not initialized",
        error: "Please restart the server to initialize tables"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error adding example data",
        error: error.message
      });
    }
  }
};