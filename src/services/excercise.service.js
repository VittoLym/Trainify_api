const Exercise = require('../models/exercise.model');

class ExerciseService {
  async getAllExercises(filters = {}, page = 1, limit = 20) {
    return await Exercise.findAllWithFilters(filters, page, limit);
  }

  async getExerciseById(id) {
    const exercise = await Exercise.findById(id);
    
    if (!exercise) {
      throw new Error('Exercise not found');
    }

    return exercise;
  }

  async getExercisesByCategory(category) {
    return await Exercise.findByCategory(category);
  }

  async getExercisesByMuscleGroup(muscleGroup) {
    return await Exercise.findByMuscleGroup(muscleGroup);
  }

  async searchExercises(searchTerm) {
    const result = await Exercise.db.query(
      `SELECT * FROM exercises 
       WHERE name ILIKE $1 OR description ILIKE $1
       ORDER BY name
       LIMIT 50`,
      [`%${searchTerm}%`]
    );
    return result.rows;
  }

  async getExerciseCategories() {
    const result = await Exercise.db.query(
      'SELECT DISTINCT category FROM exercises ORDER BY category'
    );
    return result.rows.map(row => row.category);
  }

  async getMuscleGroups() {
    const result = await Exercise.db.query(
      'SELECT DISTINCT muscle_group FROM exercises WHERE muscle_group IS NOT NULL ORDER BY muscle_group'
    );
    return result.rows.map(row => row.muscle_group);
  }
}

module.exports = new ExerciseService();