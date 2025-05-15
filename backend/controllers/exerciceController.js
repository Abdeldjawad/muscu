const Exercice = require('../models/Exercice');
const pool = require("../config/db");

// Helper functions
const validateUserId = (req, res) => {
    if (!req.user?.userId) {
        console.error('User ID missing in request');
        res.status(400).json({ message: "Authentication required" });
        return false;
    }
    return true;
};

const handleError = (res, error, context) => {
    console.error(`❌ Error in ${context}:`, error);
    res.status(500).json({ message: "Server error" });
};

// Get all exercises
// controllers/exerciceController.js
exports.getAllExercices = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM exercice");

        // Normalize property names
        const exercises = result.rows.map(ex => ({
            id: ex.id,
            name: ex.nom,
            imageUrl: ex.imageurl, // Map lowercase to camelCase
            muscle_group: ex.groupe_musculaire,
            equipment: ex.materiel,
            difficulty: ex.difficulte,
            type: ex.type_exercice
        }));
        res.json(exercises);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Add example exercises
exports.addExampleExercises = async (req, res) => {
    if (!validateUserId(req, res)) return;

    try {
        const exercises = [
            {
                name: 'Squat',
                imageUrl: 'https://www.docteur-fitness.com/wp-content/uploads/2021/11/homme-faisant-un-squat-avec-barre.gif',
                muscle_group: 'Jambes',
                equipment: 'Barre',
                difficulty: 'Intermédiaire',
                type: 'Force'
            },
            {
                name: 'Planche',
                imageUrl: 'https://www.docteur-fitness.com/wp-content/uploads/2022/05/planche-abdos.gif',
                muscle_group: 'Abdominaux',
                equipment: 'Aucun',
                difficulty: 'Débutant',
                type: 'Statique'
            },
            {
                name: 'Crunch',
                imageUrl: 'https://www.docteur-fitness.com/wp-content/uploads/2000/07/crunch-au-sol-exercice-musculation.gif',
                muscle_group: 'Abdominaux',
                equipment: 'Aucun',
                difficulty: 'Débutant',
                type: 'Endurance'
            },
            {
                name: 'Traction',
                imageUrl: 'https://www.docteur-fitness.com/wp-content/uploads/2022/02/traction-musculation-dos.gif',
                muscle_group: 'Dos',
                equipment: 'Barre de traction',
                difficulty: 'Avancé',
                type: 'Force'
            },
            {
                name: 'Curl Biceps',
                imageUrl: 'https://www.docteur-fitness.com/wp-content/uploads/2022/09/curl-biceps-alterne-sur-banc-incline.gif',
                muscle_group: 'Bras',
                equipment: 'Haltères',
                difficulty: 'Intermédiaire',
                type: 'Hypertrophie'
            },
            {
                name: 'Développé Couché',
                imageUrl: 'https://www.docteur-fitness.com/wp-content/uploads/2019/08/developpe-couche.gif',
                muscle_group: 'Poitrine',
                equipment: 'Barre',
                difficulty: 'Intermédiaire',
                type: 'Force'
            },
            {
                name: 'Soulevé de Terre',
                imageUrl: 'https://www.docteur-fitness.com/wp-content/uploads/2021/12/souleve-de-terre.gif',
                muscle_group: 'Chaîne Postérieure',
                equipment: 'Barre',
                difficulty: 'Avancé',
                type: 'Force'
            }
        ];

        await pool.query('BEGIN');

        for (const exercise of exercises) {
            await pool.query(
                `INSERT INTO exercice 
        (nom, imageUrl, groupe_musculaire, materiel, difficulte, type_exercice)
        VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    exercise.name,
                    exercise.imageUrl,
                    exercise.muscle_group,
                    exercise.equipment,
                    exercise.difficulty,
                    exercise.type
                ]
            );
        }

        await pool.query('COMMIT');

        res.status(201).json({
            success: true,
            message: "✅ Example exercises added successfully!",
            count: exercises.length
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        handleError(res, error, "addExampleExercises");
    }
};