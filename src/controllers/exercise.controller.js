const exerciseService = require('../services/excercise.service');

class ExerciseController {
  async getAllExercises(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20,
        category,
        muscleGroup,
        difficultyLevel,
        equipmentNeeded,
        search
      } = req.query;
      const filters = {
        category,
        muscleGroup,
        difficultyLevel,
        equipmentNeeded,
        search
      };

      const result = await exerciseService.getAllExercises(
        filters, 
        parseInt(page), 
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get all exercises error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch exercises',
        code: 'EXERCISE_FETCH_ERROR'
      });
    }
  }

  async getExerciseById(req, res) {
    try {
      const { id } = req.params;
      const exercise = await exerciseService.getExerciseById(id);

      res.json({
        success: true,
        data: exercise
      });
    } catch (error) {
      if (error.message === 'Exercise not found') {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found',
          code: 'EXERCISE_NOT_FOUND'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch exercise by id',
        code: 'EXERCISE_FETCH_ERROR'
      });
    }
  }

  async getExercisesByCategory(req, res) {
    try {
      const { category } = req.params;
      const exercises = await exerciseService.getExercisesByCategory(category);

      res.json({
        success: true,
        data: exercises
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch exercises by category',
        code: 'EXERCISE_FETCH_ERROR'
      });
    }
  }

  async searchExercises(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search term must be at least 2 characters',
          code: 'INVALID_SEARCH_TERM'
        });
      }

      const exercises = await exerciseService.searchExercises(q);

      res.json({
        success: true,
        data: exercises
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to search exercises',
        code: 'EXERCISE_SEARCH_ERROR'
      });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await exerciseService.getExerciseCategories();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        code: 'CATEGORY_FETCH_ERROR'
      });
    }
  }

  async getMuscleGroups(req, res) {
    try {
      const muscleGroups = await exerciseService.getMuscleGroups();

      res.json({
        success: true,
        data: muscleGroups
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch muscle groups',
        code: 'MUSCLE_GROUP_FETCH_ERROR'
      });
    }
  }
}

module.exports = new ExerciseController();