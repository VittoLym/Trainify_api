const UserModel = require('../models/user.model');
const JWTUtils = require('../utils/jwt');
const db = require('../utils/database');

class AuthService {
  async register(userData) {
    try {
      // Verificar si email ya existe
      const existingEmail = await UserModel.findByEmail(userData.email);
      if (existingEmail) {
        throw new Error('Email already registered');
      }
      // Verificar si username ya existe
      const existingUsername = await UserModel.findByUsername(userData.username);
      if (existingUsername) {
        throw new Error('Username already taken');
      }
      // Crear usuario
      const user = await UserModel.create(userData);
      // Generar tokens
      const tokens = this.generateTokens(user);
      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          fitnessLevel: user.fitness_level,
          createdAt: user.created_at
        },
        tokens
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  async login(credentials) {
    try {
      let user;
      // Buscar por email o username
      if (credentials.email) {
        user = await UserModel.findByEmail(credentials.email);
      } else if (credentials.username) {
        user = await UserModel.findByUsername(credentials.username);
      }
      if (!user) {
        throw new Error('Invalid credentials');
      }
      // Verificar contraseña
      const isValidPassword = await UserModel.verifyPassword(
        credentials.password,
        user.password_hash
      );
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }
      // Actualizar último login
      await UserModel.updateLastLogin(user.id);
      // Generar tokens
      const tokens = this.generateTokens(user);
      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          fitnessLevel: user.fitness_level,
          lastLogin: user.last_login
        },
        tokens
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token required');
      }
      // Verificar refresh token
      const decoded = JWTUtils.verifyRefreshToken(refreshToken);
      if (!decoded) {
        throw new Error('Invalid refresh token');
      }
      // Buscar usuario
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }
      // Generar nuevos tokens
      const tokens = this.generateTokens(user);
      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        tokens
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }
  async logout(userId) {
    try {
      console.log(`User ${userId} logged out`);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
  async getProfile(userId) {
    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        dateOfBirth: user.date_of_birth,
        heightCm: user.height_cm,
        weightKg: user.weight_kg,
        fitnessLevel: user.fitness_level,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }
  async updateProfile(userId, updateData) {
    try {
      const user = await UserModel.updateProfile(userId, updateData);
      if (!user) {
        throw new Error('User not found');
      }
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        heightCm: user.height_cm,
        weightKg: user.weight_kg,
        fitnessLevel: user.fitness_level,
        dateOfBirth: user.date_of_birth,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username
    };

    return {
      accessToken: JWTUtils.generateAccessToken(payload),
      refreshToken: JWTUtils.generateRefreshToken(payload),
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    };
  }
}

module.exports = new AuthService();