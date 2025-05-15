const pool = require('../config/db');

const createExerciseTable = async () => {
    try {
        console.log("Creating exercise table...");
        await pool.query('BEGIN');

        // Exercise table creation with UNIQUE constraint on nom
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exercice (
                                                    id SERIAL PRIMARY KEY,
                                                    nom VARCHAR(255) NOT NULL UNIQUE,
                imageUrl VARCHAR(512),
                groupe_musculaire VARCHAR(255) NOT NULL,
                materiel VARCHAR(255) NOT NULL,
                difficulte VARCHAR(50) NOT NULL,
                type_exercice VARCHAR(50) NOT NULL
                );`);

        // Check if table is empty before inserting
        const { rows } = await pool.query('SELECT COUNT(*) FROM exercice');
        const count = parseInt(rows[0].count);

        if (count === 0) {
            // Insert example exercises only if table is empty
            await pool.query(`
                INSERT INTO exercice 
                (nom, imageUrl, groupe_musculaire, materiel, difficulte, type_exercice)
                VALUES 
                    ('Squat', 'https://www.docteur-fitness.com/wp-content/uploads/2021/11/homme-faisant-un-squat-avec-barre.gif', 'Jambes', 'Barre', 'Intermédiaire', 'Force'),
                    ('Planche', 'https://www.docteur-fitness.com/wp-content/uploads/2022/05/planche-abdos.gif', 'Abdominaux', 'Aucun', 'Débutant', 'Statique'),
                    ('Crunch', 'https://www.docteur-fitness.com/wp-content/uploads/2000/07/crunch-au-sol-exercice-musculation.gif', 'Abdominaux', 'Aucun', 'Débutant', 'Endurance'),
                    ('Traction', 'https://www.docteur-fitness.com/wp-content/uploads/2022/02/traction-musculation-dos.gif', 'Dos', 'Barre de traction', 'Avancé', 'Force'),
                    ('Curl Biceps', 'https://www.docteur-fitness.com/wp-content/uploads/2022/09/curl-biceps-alterne-sur-banc-incline.gif', 'Bras', 'Haltères', 'Intermédiaire', 'Hypertrophie'),
                    ('Développé Couché', 'https://www.docteur-fitness.com/wp-content/uploads/2019/08/developpe-couche.gif', 'Poitrine', 'Barre', 'Intermédiaire', 'Force'),
                    ('Soulevé de Terre', 'https://www.docteur-fitness.com/wp-content/uploads/2021/12/souleve-de-terre.gif', 'Chaîne Postérieure', 'Barre', 'Avancé', 'Force')
            `);
            console.log("✅ Inserted example exercises");
        }

        await pool.query('COMMIT');
        console.log("✅ Exercise table ready!");
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("❌ Error creating exercise table:", error.message);
        throw error;
    }
};

module.exports = {
    pool,
    initializeExercice: async () => {
        try {
            await createExerciseTable();
            return pool;
        } catch (error) {
            console.error("Failed to initialize exercise tables:", error);
            process.exit(1);
        }
    },
    async getAll() {
        const result = await pool.query('SELECT * FROM exercice');
        return result.rows;
    },
    async getById(id) {
        const result = await pool.query('SELECT * FROM exercice WHERE id = $1', [id]);
        return result.rows[0];
    }
};