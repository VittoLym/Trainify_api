const BaseModel = require('./base.model');
const db = require('../utils/database');

class Workout extends BaseModel {
  constructor() {
    super('workouts');
  }

  async createWithExercises(workoutData, exercises = []) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // 1. Crear el workout
      const workout = await this.create(workoutData);
      // 2. Insertar ejercicios si existen
      if (exercises.length > 0) {
        for (const exercise of exercises) {
          console.log(exercise)
          await client.query(
            `INSERT INTO workout_exercises (
              workout_id, exercise_id, sets, reps, weight,
              distance_km, duration_minutes, rest_time_seconds,
              order_index, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              workout.id,
              exercise.exerciseId,
              exercise.sets || 3,
              exercise.reps || 10,
              exercise.weight || null,
              exercise.distanceKm || null,
              exercise.durationMinutes || null,
              exercise.restTimeSeconds || 60,
              exercise.orderIndex || 0,
              exercise.notes || null
            ]
          );
        }
      }

      await client.query('COMMIT');
      
      // 3. Obtener workout con ejercicios
      return await this.findByIdWithExercises(workout.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findByIdWithExercises(id) {
    const workoutResult = await this.db.query(
      `SELECT w.*, 
              json_agg(
                json_build_object(
                  'id', we.id,
                  'exerciseId', we.exercise_id,
                  'sets', we.sets,
                  'reps', we.reps,
                  'weight', we.weight,
                  'distanceKm', we.distance_km,
                  'durationMinutes', we.duration_minutes,
                  'restTimeSeconds', we.rest_time_seconds,
                  'orderIndex', we.order_index,
                  'notes', we.notes,
                  'completedSets', we.completed_sets,
                  'completedReps', we.completed_reps,
                  'completedWeights', we.completed_weights,
                  'rir', we.rir,
                  'exercise', json_build_object(
                    'id', e.id,
                    'name', e.name,
                    'category', e.category,
                    'muscleGroup', e.muscle_group
                  )
                ) ORDER BY we.order_index
              ) as exercises
       FROM workouts w
       LEFT JOIN workout_exercises we ON w.id = we.workout_id
       LEFT JOIN exercises e ON we.exercise_id = e.id
       WHERE w.id = $1
       GROUP BY w.id`,
      [id]
    );

    return workoutResult.rows[0];
  }

  async findAllByUserWithFilters(userId, filters = {}, page = 1, limit = 20) {
    const {
      status,
      workoutType,
      startDate,
      endDate,
      search
    } = filters;

    let whereConditions = ['w.user_id = $1'];
    let params = [userId];
    let paramCount = 2;

    if (status) {
      whereConditions.push(`w.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (workoutType) {
      whereConditions.push(`w.workout_type = $${paramCount}`);
      params.push(workoutType);
      paramCount++;
    }

    if (startDate) {
      whereConditions.push(`w.scheduled_date >= $${paramCount}`);
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      whereConditions.push(`w.scheduled_date <= $${paramCount}`);
      params.push(endDate);
      paramCount++;
    }

    if (search) {
      whereConditions.push(`(w.name ILIKE $${paramCount} OR w.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Obtener total
    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM workouts w ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Calcular offset
    const offset = (page - 1) * limit;

    // Obtener datos
    const query = `
      SELECT w.*,
             json_agg(
               json_build_object(
                 'id', we.id,
                 'exerciseId', we.exercise_id,
                 'exerciseName', e.name,
                 'sets', we.sets,
                 'reps', we.reps,
                 'weight', we.weight
               ) ORDER BY we.order_index
             ) as exercises_summary
      FROM workouts w
      LEFT JOIN workout_exercises we ON w.id = we.workout_id
      LEFT JOIN exercises e ON we.exercise_id = e.id
      ${whereClause}
      GROUP BY w.id
      ORDER BY w.scheduled_date DESC, w.scheduled_time DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await this.db.query(query, [...params, limit, offset]);
    
    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  async updateWithExercises(id, updateData, exercises = null) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // 1. Actualizar el workout
      const workout = await this.update(id, updateData);

      // 2. Actualizar ejercicios si se proporcionan
      if (exercises !== null) {
        // Eliminar ejercicios existentes
        await client.query(
          'DELETE FROM workout_exercises WHERE workout_id = $1',
          [id]
        );

        // Insertar nuevos ejercicios
        if (exercises.length > 0) {
          for (const exercise of exercises) {
            await client.query(
              `INSERT INTO workout_exercises (
                workout_id, exercise_id, sets, reps, weight,
                distance_km, duration_minutes, rest_time_seconds,
                order_index, notes
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
              [
                id,
                exercise.exerciseId,
                exercise.sets || 3,
                exercise.reps || 10,
                exercise.weight || null,
                exercise.distanceKm || null,
                exercise.durationMinutes || null,
                exercise.restTimeSeconds || 60,
                exercise.orderIndex || 0,
                exercise.notes || null
              ]
            );
          }
        }
      }

      await client.query('COMMIT');
      
      // 3. Obtener workout actualizado con ejercicios
      return await this.findByIdWithExercises(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteWithExercises(id) {
    // ON DELETE CASCADE se encarga de eliminar los workout_exercises
    return await this.delete(id);
  }

  async completeWorkout(id, completedData) {
    const updateData = {
      status: 'completed',
      completed_at: new Date(),
      ...completedData
    };

    return await this.update(id, updateData);
  }

  async getUserWorkoutStats(userId) {
    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total_workouts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_workouts,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_workouts,
        AVG(rating) as average_rating,
        SUM(duration_minutes) as total_minutes,
        MIN(scheduled_date) as first_workout_date,
        MAX(scheduled_date) as last_workout_date
       FROM workouts
       WHERE user_id = $1`,
      [userId]
    );

    return result.rows[0];
  }
}

module.exports = new Workout();