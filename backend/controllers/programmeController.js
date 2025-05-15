const Programme = require('../models/Programme');
const pool =require("../config/db");

const validateUserId = (req, res) => {
    if (!req.user?.userId) {
        res.status(401).json({ message: "Authentication required" });
        return false;
    }
    return true;
};

exports.getUserProgrammes = async (req, res) => {
    try {
        if (!validateUserId(req, res)) return;

        const programmes = await Programme.getByUserId(req.user.userId);
        res.status(200).json(programmes || []);

    } catch (error) {
        console.error("Error in getUserProgrammes:", error);
        res.status(500).json({
            message: "Server error",
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

exports.createProgramme = async (req, res) => {
    try {
        console.log("Creating program with data:", req.body); // Log incoming data

        if (!validateUserId(req, res)) return;

        if (!req.body.name) {
            console.log("Missing program name");
            return res.status(400).json({ message: "Program name required" });
        }

        console.log("Creating program for user:", req.user.userId);
        const programme = await Programme.create({
            name: req.body.name,
            user_id: req.user.userId
        });

        console.log("Program created successfully:", programme);
        res.status(201).json(programme);

    } catch (error) {
        console.error("Full error in createProgramme:", error);
        res.status(500).json({
            message: "Failed to create program",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.addExerciceToProgramme = async (req, res) => {
    try {
        if (!validateUserId(req, res)) return;

        const { programmeId } = req.params;
        const { exerciceId, series, repetitions } = req.body;

        if (!exerciceId || !series || !repetitions) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Verify program exists and belongs to user
        const programCheck = await pool.query(
            'SELECT id FROM programme WHERE id = $1 AND user_id = $2',
            [programmeId, req.user.userId]
        );

        if (programCheck.rows.length === 0) {
            return res.status(404).json({ message: "Program not found" });
        }

        // Verify exercise exists
        const exerciseCheck = await pool.query(
            'SELECT id FROM exercice WHERE id = $1',
            [exerciceId]
        );

        if (exerciseCheck.rows.length === 0) {
            return res.status(404).json({ message: "Exercise not found" });
        }

        // Add to program using correct table name
        const result = await pool.query(
            `INSERT INTO exercices_programme 
       (programme_id, exercice_id, series, repetitions)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [programmeId, exerciceId, series, repetitions]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error in addExerciceToProgramme:", error);

        res.status(500).json({
            message: "Failed to add exercise to program",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            hint: "Check if the exercise and program IDs exist"
        });
    }
};

exports.createProgramWithExercises = async (req, res) => {
    try {
        if (!validateUserId(req, res)) return;

        const { name, exercises } = req.body;

        if (!name || !exercises?.length) {
            return res.status(400).json({
                message: "Program name and at least one exercise are required"
            });
        }

        const programData = {
            name,
            user_id: req.user.userId,
            exercises: exercises.map(ex => ({
                exercice_id: ex.exerciceId,
                series: ex.series || 3, // Default values
                repetitions: ex.repetitions || 10
            }))
        };

        const newProgram = await Programme.createProgramWithExercises(programData);
        res.status(201).json(newProgram);

    } catch (error) {
        console.error("Error in createProgramWithExercises:", error);
        res.status(500).json({
            message: "Failed to create program",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.addExampleProgrammes = async (req, res) => {
    try {
        if (!validateUserId(req, res)) return;

        console.log(`Adding example programs for user ${req.user.userId}`); // Log user ID

        const examplePrograms = [
            {
                name: "Full Body Routine",
                exercises: [
                    { exerciseId: 1, series: 4, repetitions: 8 }, // Squat
                    { exerciseId: 6, series: 3, repetitions: 10 }, // Développé Couché
                    { exerciseId: 7, series: 5, repetitions: 5 }  // Soulevé de Terre
                ]
            },
            {
                name: "Core Workout",
                exercises: [
                    { exerciseId: 2, series: 3, repetitions: 60 }, // Planche
                    { exerciseId: 3, series: 4, repetitions: 20 }  // Crunch
                ]
            }
        ];

        await pool.query('BEGIN');

        // First verify all exercise IDs exist
        for (const program of examplePrograms) {
            for (const exercise of program.exercises) {
                const exerciseCheck = await pool.query(
                    'SELECT id FROM exercice WHERE id = $1',
                    [exercise.exerciseId]
                );
                if (exerciseCheck.rows.length === 0) {
                    throw new Error(`Exercise with ID ${exercise.exerciseId} not found`);
                }
            }
        }

        // Then create programs
        for (const program of examplePrograms) {
            const { rows: [newProgram] } = await pool.query(
                `INSERT INTO programme (name, user_id) 
                 VALUES ($1, $2) RETURNING id`,
                [program.name, req.user.userId]
            );

            for (const exercise of program.exercises) {
                await pool.query(
                    `INSERT INTO exercices_programme 
                     (programme_id, exercice_id, series, repetitions)
                     VALUES ($1, $2, $3, $4)`,
                    [newProgram.id, exercise.exerciseId, exercise.series, exercise.repetitions]
                );
            }
        }

        await pool.query('COMMIT');
        res.status(201).json({ success: true, message: "Example programs added" });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error in addExampleProgrammes:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add example programs",
            error: error.message // Include specific error message
        });
    }
};