const express = require('express');
const router = express.Router();
const programmeController = require('../controllers/programmeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/user', programmeController.getUserProgrammes);
router.post('/', programmeController.createProgramme);
router.post('/:programmeId/exercices', programmeController.addExerciceToProgramme);
router.post('/examples', programmeController.addExampleProgrammes);
router.post('/create-with-exercises', programmeController.createProgramWithExercises);

module.exports = router;
