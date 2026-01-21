const BaseModel = require('./base.model');

class WorkoutExercise extends BaseModel {
  constructor() {
    super('workout_exercises');
  }

  async updateExerciseCompletion(id, completionData) {
    const {
      completedSets,
      completedReps,
      completedWeights,
      rir
    } = completionData;

    const updateData = {};
    
    if (completedSets !== undefined) updateData.completed_sets = completedSets;
    if (completedReps !== undefined) updateData.completed_reps = completedReps;
    if (completedWeights !== undefined) updateData.completed_weights = completedWeights;
    if (rir !== undefined) updateData.rir = rir;

    return await this.update(id, updateData);
  }

  async getWorkoutExercises(workoutId) {
    const result = await this.db.query(
      `SELECT we.*, e.name as exercise_name, e.category, e.muscle_group
       FROM workout_exercises we
       JOIN exercises e ON we.exercise_id = e.id
       WHERE we.workout_id = $1
       ORDER BY we.order_index`,
      [workoutId]
    );

    return result.rows;
  }

  async getUserExerciseStats(userId, exerciseId, startDate, endDate) {
    const query = `
      SELECT 
        COUNT(DISTINCT w.id) as workout_count,
        SUM(we.sets) as total_sets,
        SUM(we.reps) as total_reps,
        AVG(we.weight) as average_weight,
        MAX(we.weight) as max_weight,
        MIN(w.scheduled_date) as first_date,
        MAX(w.scheduled_date) as last_date
      FROM workouts w
      JOIN workout_exercises we ON w.id = we.workout_id
      WHERE w.user_id = $1 
        AND we.exercise_id = $2
        AND w.status = 'completed'
        AND ($3::date IS NULL OR w.scheduled_date >= $3)
        AND ($4::date IS NULL OR w.scheduled_date <= $4)
    `;

    const result = await this.db.query(query, [
      userId,
      exerciseId,
      startDate,
      endDate
    ]);

    return result.rows[0];
  }
}

module.exports = new WorkoutExercise();