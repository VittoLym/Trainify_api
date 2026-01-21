const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workout.controller');
const { validate, validateQuery } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/workouts - Listar workouts del usuario
router.get('/', 
  authenticate,
  validateQuery('filterWorkouts'),
  workoutController.getUserWorkouts
);

// GET /api/workouts/stats - Estadísticas de workouts
router.get('/stats',
  authenticate,
  workoutController.getWorkoutStats
);

// GET /api/workouts/upcoming - Próximos workouts
router.get('/upcoming',
  authenticate,
  workoutController.getUpcomingWorkouts
);

// GET /api/workouts/:id - Obtener workout por ID
router.get('/:id',
  authenticate,
  workoutController.getWorkoutById
);

// POST /api/workouts - Crear nuevo workout
router.post('/',
  authenticate,
  validate('createWorkout'),
  workoutController.createWorkout
);

// PUT /api/workouts/:id - Actualizar workout
router.put('/:id',
  authenticate,
  validate('updateWorkout'),
  workoutController.updateWorkout
);

// DELETE /api/workouts/:id - Eliminar workout
router.delete('/:id',
  authenticate,
  workoutController.deleteWorkout
);

// POST /api/workouts/:id/complete - Completar workout
router.post('/:id/complete',
  authenticate,
  workoutController.completeWorkout
);

// GET /api/workouts/exercises/:exerciseId/stats - Estadísticas de ejercicio específico
router.get('/exercises/:exerciseId/stats',
  authenticate,
  workoutController.getExerciseStats
);

module.exports = router;