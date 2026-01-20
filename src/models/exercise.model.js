const BaseModel = require('./base.model');

class Exercise extends BaseModel {
  constructor() {
    super('exercises');
  }
  async findAllWithFilters(filters = {}, page = 1, limit = 20) {
    const {
      category,
      muscleGroup,
      difficultyLevel,
      equipmentNeeded,
      search
    } = filters;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (category) {
      whereConditions.push(`category = $${paramCount}`);
      params.push(category);
      paramCount++;
    }

    if (muscleGroup) {
      whereConditions.push(`muscle_group = $${paramCount}`);
      params.push(muscleGroup);
      paramCount++;
    }

    if (difficultyLevel) {
      whereConditions.push(`difficulty_level = $${paramCount}`);
      params.push(difficultyLevel);
      paramCount++;
    }

    if (equipmentNeeded) {
      whereConditions.push(`equipment_needed ILIKE $${paramCount}`);
      params.push(`%${equipmentNeeded}%`);
      paramCount++;
    }

    if (search) {
      whereConditions.push(`(name ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    // Obtener total
    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM exercises ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Calcular offset
    const offset = (page - 1) * limit;

    // Obtener datos
    const query = `
      SELECT * FROM exercises
      ${whereClause}
      ORDER BY name ASC
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

  async findByCategory(category) {
    const result = await this.db.query(
      'SELECT * FROM exercises WHERE category = $1 ORDER BY name',
      [category]
    );
    return result.rows;
  }

  async findByMuscleGroup(muscleGroup) {
    const result = await this.db.query(
      'SELECT * FROM exercises WHERE muscle_group = $1 ORDER BY name',
      [muscleGroup]
    );
    return result.rows;
  }
}

module.exports = new Exercise();