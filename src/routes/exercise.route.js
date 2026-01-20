const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exercise.controller');
const { validateQuery } = require('../middleware/validation.middleware');

// GET /api/exercises - Listar todos los ejercicios (con filtros)
router.get('/', 
  validateQuery('filterExercises'),
  exerciseController.getAllExercises
);

// GET /api/exercises/categories - Obtener categorías disponibles
router.get('/categories',
  exerciseController.getCategories
);

// GET /api/exercises/muscle-groups - Obtener grupos musculares
router.get('/muscle-groups',
  exerciseController.getMuscleGroups
);

// GET /api/exercises/search - Buscar ejercicios
router.get('/search',
  exerciseController.searchExercises
);

// GET /api/exercises/category/:category - Ejercicios por categoría
router.get('/category/:category',
  exerciseController.getExercisesByCategory
);

// GET /api/exercises/:id - Obtener ejercicio por ID
router.get('/:id',
  exerciseController.getExerciseById
);

module.exports = router;