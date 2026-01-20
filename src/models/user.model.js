const db = require('../utils/database');
const bcrypt = require('bcrypt');

class UserModel {
  async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }
  async findByUsername(username) {
    try {
      const query = 'SELECT * FROM users WHERE LOWER(username) = LOWER($1)';
      const result = await db.query(query, [username]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }
  async findById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  }
  async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const query = `
        INSERT INTO users (
          email, username, password_hash, first_name, last_name,
          date_of_birth, height_cm, weight_kg, fitness_level
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, email, username, first_name, last_name, 
          fitness_level, created_at
      `;
      const values = [
        userData.email,
        userData.username,
        hashedPassword,
        userData.firstName || null,
        userData.lastName || null,
        userData.dateOfBirth || null,
        userData.heightCm || null,
        userData.weightKg || null,
        userData.fitnessLevel || 'beginner'
      ];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === '23505') { // Violación de unique constraint
        if (error.constraint.includes('email')) {
          throw new Error('Email already exists');
        } else if (error.constraint.includes('username')) {
          throw new Error('Username already exists');
        }
      }
      throw new Error('Failed to create user');
    }
  }
  async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }
  async updateLastLogin(userId) {
    try {
      const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
      await db.query(query, [userId]);
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
  async updateProfile(userId, updateData) {
    try {
      const allowedFields = [
        'first_name', 'last_name', 'height_cm', 'weight_kg',
        'fitness_level', 'date_of_birth'
      ];
      
      const updates = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updateData).forEach(key => {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (allowedFields.includes(dbKey)) {
          updates.push(`${dbKey} = $${paramCount}`);
          values.push(updateData[key]);
          paramCount++;
        }
      });

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push('updated_at = NOW()');
      values.push(userId);

      const query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, email, username, first_name, last_name,
          height_cm, weight_kg, fitness_level, date_of_birth,
          last_login, created_at, updated_at
      `;

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

module.exports = new UserModel();