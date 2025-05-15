const pool = require('../config/db');

const createProgramTables = async () => {
    try {
        console.log("Creating program tables...");
        await pool.query('BEGIN');

        // Programme table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS programme (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`);

        // Exercices_programme junction table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS exercices_programme (
        id SERIAL PRIMARY KEY,
        programme_id INTEGER NOT NULL REFERENCES programme(id) ON DELETE CASCADE,
        exercice_id INTEGER NOT NULL REFERENCES exercice(id) ON DELETE CASCADE,
        series INTEGER NOT NULL CHECK (series > 0),
        repetitions INTEGER NOT NULL CHECK (repetitions > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`);

        await pool.query('COMMIT');
        console.log("✅ Program tables ready!");
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("❌ Error creating program tables:", error.message);
        throw error;
    }
};

module.exports = {
    pool,
    initializeProgrammes: async () => {
        try {
            await createProgramTables();
            return pool;
        } catch (error) {
            console.error("Failed to initialize program tables:", error);
            process.exit(1);
        }
    },

    // CRUD operations would go here
    async createProgram(programData) {
        const result = await pool.query(
            'INSERT INTO programme (name, user_id) VALUES ($1, $2) RETURNING *',
            [programData.name, programData.user_id]
        );
        return result.rows[0];
    },

    async createProgramWithExercises(programData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Create the program
            const programResult = await client.query(
                'INSERT INTO programme (name, user_id) VALUES ($1, $2) RETURNING *',
                [programData.name, programData.user_id]
            );
            const newProgram = programResult.rows[0];

            // 2. Add all exercises
            for (const exercise of programData.exercises) {
                // Verify exercise exists
                const exerciseCheck = await client.query(
                    'SELECT id FROM exercice WHERE id = $1',
                    [exercise.exercice_id]
                );

                if (exerciseCheck.rows.length === 0) {
                    throw new Error(`Exercise with ID ${exercise.exercice_id} not found`);
                }

                await client.query(
                    `INSERT INTO exercices_programme 
         (programme_id, exercice_id, series, repetitions)
         VALUES ($1, $2, $3, $4)`,
                    [newProgram.id, exercise.exercice_id, exercise.series, exercise.repetitions]
                );
            }

            await client.query('COMMIT');
            return { ...newProgram, exercises: programData.exercises };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error in createProgramWithExercises:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    async addExercice(programExerciseData) {
        const result = await pool.query(
            `INSERT INTO exercices_programme 
       (programme_id, exercice_id, series, repetitions) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [
                programExerciseData.programme_id,
                programExerciseData.exercice_id,
                programExerciseData.series,
                programExerciseData.repetitions
            ]
        );
        return result.rows[0];
    },
    async getByUserId(userId) {
        try {
            const result = await pool.query(
                `SELECT p.*, 
         json_agg(json_build_object(
           'id', ep.id,
           'exercice', (SELECT row_to_json(e) FROM exercice e WHERE e.id = ep.exercice_id),
           'series', ep.series,
           'repetitions', ep.repetitions
         )) as exercices
         FROM programme p
         LEFT JOIN exercices_programme ep ON p.id = ep.programme_id
         LEFT JOIN exercice e ON ep.exercice_id = e.id
         WHERE p.user_id = $1
         GROUP BY p.id`,
                [userId]
            );
            return result.rows;
        } catch (error) {
            console.error("Erreur dans getByUserId:", error);
            throw error;
        }
    },
    async create(programData) {  // Accept an object parameter
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await client.query(
                `INSERT INTO programme (name, user_id)
                 VALUES ($1, $2) RETURNING *`,
                [programData.name, programData.user_id]  // Use object properties
            );
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error in Programme.create:", error);
            throw error;
        } finally {
            client.release();
        }
    }
};