const db = require('../utils/database');
function buildProgressReportQuery(groupBy) {
    let groupByClause;
    switch (groupBy) {
      case 'day':
        groupByClause = "DATE_TRUNC('day', w.scheduled_date)";
        break;
      case 'month':
        groupByClause = "DATE_TRUNC('month', w.scheduled_date)";
        break;
      case 'exercise':
        groupByClause = 'we.exercise_id';
        break;
      default: // week
        groupByClause = "DATE_TRUNC('week', w.scheduled_date)";
    }

    const fields = [
        `${groupByClause} as period`,
        'COUNT(DISTINCT w.id) as workout_count',
        'COUNT(DISTINCT CASE WHEN w.status = \'completed\' THEN w.id END) as completed_count',
        'AVG(w.rating) as average_rating',
        `SUM(
          CASE 
            WHEN w.start_time IS NOT NULL AND w.end_time IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (w.end_time - w.start_time)) / 60
            ELSE COALESCE(w.duration_minutes, 0)
          END
        ) as total_duration`,
        'COUNT(DISTINCT we.exercise_id) as unique_exercises',
        'SUM(we.sets * we.reps * COALESCE(we.weight, 1)) as total_volume'
    ];

    if (groupBy === 'exercise') {
        fields.push('e.name as exercise_name');
        fields.push('e.category as exercise_category');
        fields.push('e.muscle_group as exercise_muscle_group');
    }

    let query = `SELECT ${fields.join(',\n        ')}\n`;
    query += `FROM workouts w\n`;
    query += `LEFT JOIN workout_exercises we ON w.id = we.workout_id\n`;
    
    if (groupBy === 'exercise') {
        query += `LEFT JOIN exercises e ON we.exercise_id = e.id\n`;
    }
    
    query += `WHERE w.user_id = $1\n`;
    query += `  AND w.scheduled_date BETWEEN $2 AND $3\n`;
    query += `GROUP BY ${groupByClause}`;
    
    if (groupBy === 'exercise') {
        query += ', e.name, e.category, e.muscle_group';
    }
    
    query += `\nORDER BY period DESC`;
    
    return query;
}
class ReportService {
  async generateProgressReport(userId, startDate, endDate, groupBy = 'week') {
    const query = buildProgressReportQuery(groupBy);
    const result = await db.query(query, [userId, startDate, endDate]);
    return result.rows;
}

  async generateVolumeReport(userId, startDate, endDate) {
    const query = `
      SELECT 
        e.name as exercise_name,
        e.category,
        e.muscle_group,
        COUNT(DISTINCT w.id) as workout_count,
        SUM(we.sets) as total_sets,
        SUM(we.reps) as total_reps,
        AVG(we.weight) as average_weight,
        MAX(we.weight) as max_weight,
        SUM(we.sets * we.reps * COALESCE(we.weight, 1)) as total_volume,
        COUNT(DISTINCT DATE(w.scheduled_date)) as days_performed
      FROM workouts w
      JOIN workout_exercises we ON w.id = we.workout_id
      JOIN exercises e ON we.exercise_id = e.id
      WHERE w.user_id = $1
        AND w.status = 'completed'
        AND w.scheduled_date BETWEEN $2 AND $3
      GROUP BY e.id, e.name, e.category, e.muscle_group
      ORDER BY total_volume DESC
      LIMIT 20
    `;

    const result = await db.query(query, [userId, startDate, endDate]);

    return result.rows;
  }

  async generateFrequencyReport(userId, startDate, endDate) {
    const query = `
      SELECT 
        DATE_TRUNC('week', w.scheduled_date) as week,
        COUNT(DISTINCT DATE(w.scheduled_date)) as days_trained,
        COUNT(DISTINCT w.id) as workouts_completed,
        SUM(w.duration_minutes) as total_minutes,
        STRING_AGG(DISTINCT TO_CHAR(w.scheduled_date, 'Dy'), ', ') as days_list
      FROM workouts w
      WHERE w.user_id = $1
        AND w.status = 'completed'
        AND w.scheduled_date BETWEEN $2 AND $3
      GROUP BY DATE_TRUNC('week', w.scheduled_date)
      ORDER BY week DESC
    `;

    const result = await db.query(query, [userId, startDate, endDate]);

    return result.rows;
  }

  async generateStrengthProgressReport(userId, exerciseId, startDate, endDate) {
    const query = `
      SELECT 
        w.scheduled_date,
        we.weight,
        we.sets,
        we.reps,
        we.completed_weights,
        we.completed_reps,
        (we.sets * we.reps * we.weight) as volume,
        w.rating,
        w.perceived_effort
      FROM workouts w
      JOIN workout_exercises we ON w.id = we.workout_id
      WHERE w.user_id = $1
        AND we.exercise_id = $2
        AND w.status = 'completed'
        AND we.weight IS NOT NULL
        AND w.scheduled_date BETWEEN $3 AND $4
      ORDER BY w.scheduled_date
    `;

    const result = await db.query(query, [userId, exerciseId, startDate, endDate]);

    return result.rows;
  }

  async generateBodyMetricsReport(userId, startDate, endDate) {
    const query = `
      SELECT 
        metric_date,
        weight_kg,
        body_fat_percentage,
        muscle_mass_kg,
        resting_heart_rate,
        sleep_hours,
        stress_level,
        notes
      FROM user_metrics
      WHERE user_id = $1
        AND metric_date BETWEEN $2 AND $3
      ORDER BY metric_date DESC
    `;

    const result = await db.query(query, [userId, startDate, endDate]);

    return result.rows;
  }

  async generateGoalProgressReport(userId) {
    const query = `
      SELECT 
        g.*,
        CASE 
          WHEN g.current_value IS NULL THEN 0
          WHEN g.target_value IS NULL OR g.target_value = 0 THEN 100
          ELSE (g.current_value / g.target_value * 100)
        END as calculated_progress
      FROM user_goals g
      WHERE g.user_id = $1
        AND g.status = 'active'
      ORDER BY g.target_date
    `;

    const result = await db.query(query, [userId]);

    return result.rows;
  }

  async generateDashboardStats(userId) {
    // Estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT w.id) as total_workouts,
        COUNT(DISTINCT CASE WHEN w.status = 'completed' THEN w.id END) as completed_workouts,
        COUNT(DISTINCT CASE WHEN w.status = 'scheduled' THEN w.id END) as scheduled_workouts,
        COUNT(DISTINCT we.exercise_id) as unique_exercises,
        AVG(w.rating) as average_rating,
        SUM(w.duration_minutes) as total_minutes,
        MIN(w.scheduled_date) as first_workout,
        MAX(w.scheduled_date) as last_workout,
        COUNT(DISTINCT DATE(w.scheduled_date)) as active_days
      FROM workouts w
      LEFT JOIN workout_exercises we ON w.id = we.workout_id
      WHERE w.user_id = $1
    `;

    // Próximos workouts
    const upcomingQuery = `
      SELECT * FROM workouts
      WHERE user_id = $1 
        AND status = 'scheduled'
        AND scheduled_date >= CURRENT_DATE
      ORDER BY scheduled_date, scheduled_time
      LIMIT 5
    `;

    // Ejercicios más frecuentes
    const frequentExercisesQuery = `
      SELECT 
        e.name,
        e.category,
        COUNT(DISTINCT w.id) as workout_count,
        SUM(we.sets * we.reps * COALESCE(we.weight, 1)) as total_volume
      FROM workouts w
      JOIN workout_exercises we ON w.id = we.workout_id
      JOIN exercises e ON we.exercise_id = e.id
      WHERE w.user_id = $1
        AND w.status = 'completed'
      GROUP BY e.id, e.name, e.category
      ORDER BY workout_count DESC
      LIMIT 5
    `;

    const [statsResult, upcomingResult, frequentResult] = await Promise.all([
      db.query(statsQuery, [userId]),
      db.query(upcomingQuery, [userId]),
      db.query(frequentExercisesQuery, [userId])
    ]);

    return {
      stats: statsResult.rows[0],
      upcomingWorkouts: upcomingResult.rows,
      frequentExercises: frequentResult.rows
    };
  }
}

module.exports = new ReportService();