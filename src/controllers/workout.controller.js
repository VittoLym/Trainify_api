const workoutService = require('../services/workout.service');

class WorkoutController {
  async createWorkout(req, res) {
    try {
      const workout = await workoutService.createWorkout(
        req.user.id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: workout,
        message: 'Workout created successfully'
      });
    } catch (error) {
      console.error('Create workout error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'EXERCISE_NOT_FOUND'
        });
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create workout',
        code: 'WORKOUT_CREATE_ERROR'
      });
    }
  }

  async getUserWorkouts(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20,
        status,
        workoutType,
        startDate,
        endDate,
        search
      } = req.query;

      const filters = {
        status,
        workoutType,
        startDate,
        endDate,
        search
      };

      const result = await workoutService.getUserWorkouts(
        req.user.id,
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
      console.error('Get workouts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch workouts',
        code: 'WORKOUT_FETCH_ERROR'
      });
    }
  }

  async getWorkoutById(req, res) {
    try {
      const { id } = req.params;
      const workout = await workoutService.getWorkoutById(req.user.id, id);

      res.json({
        success: true,
        data: workout
      });
    } catch (error) {
      if (error.message === 'Workout not found') {
        return res.status(404).json({
          success: false,
          message: 'Workout not found',
          code: 'WORKOUT_NOT_FOUND'
        });
      }

      if (error.message === 'Unauthorized access to workout') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access',
          code: 'UNAUTHORIZED'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch workout',
        code: 'WORKOUT_FETCH_ERROR'
      });
    }
  }

  async updateWorkout(req, res) {
    try {
      const { id } = req.params;
      const workout = await workoutService.updateWorkout(
        req.user.id,
        id,
        req.body
      );

      res.json({
        success: true,
        data: workout,
        message: 'Workout updated successfully'
      });
    } catch (error) {
      if (error.message === 'Workout not found') {
        return res.status(404).json({
          success: false,
          message: 'Workout not found',
          code: 'WORKOUT_NOT_FOUND'
        });
      }

      if (error.message === 'Unauthorized access to workout') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access',
          code: 'UNAUTHORIZED'
        });
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'EXERCISE_NOT_FOUND'
        });
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update workout',
        code: 'WORKOUT_UPDATE_ERROR'
      });
    }
  }

  async deleteWorkout(req, res) {
    try {
      const { id } = req.params;
      await workoutService.deleteWorkout(req.user.id, id);

      res.json({
        success: true,
        message: 'Workout deleted successfully'
      });
    } catch (error) {
      if (error.message === 'Workout not found') {
        return res.status(404).json({
          success: false,
          message: 'Workout not found',
          code: 'WORKOUT_NOT_FOUND'
        });
      }

      if (error.message === 'Unauthorized access to workout') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access',
          code: 'UNAUTHORIZED'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete workout',
        code: 'WORKOUT_DELETE_ERROR'
      });
    }
  }

  async completeWorkout(req, res) {
    try {
      const { id } = req.params;
      const workout = await workoutService.completeWorkout(
        req.user.id,
        id,
        req.body
      );

      res.json({
        success: true,
        data: workout,
        message: 'Workout marked as completed'
      });
    } catch (error) {
      if (error.message === 'Workout not found') {
        return res.status(404).json({
          success: false,
          message: 'Workout not found',
          code: 'WORKOUT_NOT_FOUND'
        });
      }

      if (error.message === 'Unauthorized access to workout') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access',
          code: 'UNAUTHORIZED'
        });
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete workout',
        code: 'WORKOUT_COMPLETE_ERROR'
      });
    }
  }

  async getWorkoutStats(req, res) {
    try {
      const stats = await workoutService.getWorkoutStats(req.user.id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch workout stats',
        code: 'STATS_FETCH_ERROR'
      });
    }
  }

  async getUpcomingWorkouts(req, res) {
    try {
      const { days = 7 } = req.query;
      const workouts = await workoutService.getUpcomingWorkouts(
        req.user.id,
        parseInt(days)
      );

      res.json({
        success: true,
        data: workouts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch upcoming workouts',
        code: 'UPCOMING_WORKOUTS_ERROR'
      });
    }
  }

  async getExerciseStats(req, res) {
    try {
      const { exerciseId } = req.params;
      const { startDate, endDate } = req.query;

      const stats = await workoutService.getExerciseStats(
        req.user.id,
        exerciseId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch exercise stats',
        code: 'EXERCISE_STATS_ERROR'
      });
    }
  }
}

module.exports = new WorkoutController();