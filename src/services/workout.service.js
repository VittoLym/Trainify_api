const Workout = require('../models/workout.model');
const WorkoutExercise = require('../models/exerciseWorkout.model');
const Exercise = require('../models/exercise.model');

class WorkoutService {
  async createWorkout(userId, workoutData) {
    // Validar que los ejercicios existan
    if (workoutData.exercises && workoutData.exercises.length > 0) {
      for (const exercise of workoutData.exercises) {
        const exerciseExists = await Exercise.findById(exercise.exerciseId);
        if (!exerciseExists) {
          throw new Error(`Exercise with ID ${exercise.exerciseId} not found`);
        }
      }
    }

    const workout = {
      user_id: userId,
      name: workoutData.name,
      description: workoutData.description || null,
      workout_type: workoutData.workoutType || 'strength',
      scheduled_date: workoutData.scheduledDate,
      scheduled_time: workoutData.scheduledTime || null,
      duration_minutes: workoutData.durationMinutes || null,
      tags: workoutData.tags || []
    };

    return await Workout.createWithExercises(workout, workoutData.exercises || []);
  }

  async getUserWorkouts(userId, filters = {}, page = 1, limit = 20) {
    return await Workout.findAllByUserWithFilters(userId, filters, page, limit);
  }

  async getWorkoutById(userId, workoutId) {
    const workout = await Workout.findByIdWithExercises(workoutId);
    
    if (!workout) {
      throw new Error('Workout not found');
    }

    // Verificar que el workout pertenezca al usuario
    if (workout.user_id !== userId) {
      throw new Error('Unauthorized access to workout');
    }

    return workout;
  }

  async updateWorkout(userId, workoutId, updateData) {
    // Verificar que el workout exista y pertenezca al usuario
    const existingWorkout = await Workout.findById(workoutId);
    if (!existingWorkout) {
      throw new Error('Workout not found');
    }

    if (existingWorkout.user_id !== userId) {
      throw new Error('Unauthorized access to workout');
    }

    // Validar ejercicios si se proporcionan
    if (updateData.exercises !== undefined) {
      if (updateData.exercises && updateData.exercises.length > 0) {
        for (const exercise of updateData.exercises) {
          const exerciseExists = await Exercise.findById(exercise.exerciseId);
          if (!exerciseExists) {
            throw new Error(`Exercise with ID ${exercise.exerciseId} not found`);
          }
        }
      }
    }

    const workoutUpdate = {};
    const allowedFields = [
      'name', 'description', 'workout_type', 'scheduled_date',
      'scheduled_time', 'duration_minutes', 'status', 'comments',
      'rating', 'perceived_effort', 'completed_at', 'tags'
    ];

    Object.keys(updateData).forEach(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbKey) && key !== 'exercises') {
        workoutUpdate[dbKey] = updateData[key];
      }
    });

    return await Workout.updateWithExercises(
      workoutId,
      workoutUpdate,
      updateData.exercises
    );
  }

  async deleteWorkout(userId, workoutId) {
    // Verificar que el workout exista y pertenezca al usuario
    const existingWorkout = await Workout.findById(workoutId);
    if (!existingWorkout) {
      throw new Error('Workout not found');
    }

    if (existingWorkout.user_id !== userId) {
      throw new Error('Unauthorized access to workout');
    }

    return await Workout.deleteWithExercises(workoutId);
  }

  async completeWorkout(userId, workoutId, completionData) {
    const existingWorkout = await Workout.findById(workoutId);
    if (!existingWorkout) {
      throw new Error('Workout not found');
    }

    if (existingWorkout.user_id !== userId) {
      throw new Error('Unauthorized access to workout');
    }

    // Actualizar datos de completitud
    const updateData = {
      status: 'completed',
      completed_at: new Date(),
      comments: completionData.comments || null,
      rating: completionData.rating || null,
      perceived_effort: completionData.perceivedEffort || null
    };

    // Actualizar ejercicios completados si se proporcionan
    if (completionData.exercises && completionData.exercises.length > 0) {
      for (const exerciseCompletion of completionData.exercises) {
        await WorkoutExercise.updateExerciseCompletion(
          exerciseCompletion.workoutExerciseId,
          {
            completedSets: exerciseCompletion.completedSets,
            completedReps: exerciseCompletion.completedReps,
            completedWeights: exerciseCompletion.completedWeights,
            rir: exerciseCompletion.rir
          }
        );
      }
    }

    return await Workout.update(workoutId, updateData);
  }

  async getWorkoutStats(userId) {
    return await Workout.getUserWorkoutStats(userId);
  }

  async getUpcomingWorkouts(userId, days = 7) {
    const result = await Workout.db.query(
      `SELECT * FROM workouts
       WHERE user_id = $1 
         AND status = 'scheduled'
         AND scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
       ORDER BY scheduled_date, scheduled_time
       LIMIT 10`,
      [userId]
    );

    return result.rows;
  }

  async getExerciseStats(userId, exerciseId, startDate, endDate) {
    return await WorkoutExercise.getUserExerciseStats(
      userId,
      exerciseId,
      startDate,
      endDate
    );
  }
}

module.exports = new WorkoutService();