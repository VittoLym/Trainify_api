const UserModel = require("../models/user.model.js");
const RefreshToken = require("../models/refreshToken.model.js");
const JWTUtils = require("../utils/jwt.js");
const db = require("../utils/database.js");
const bcrypt = require("bcrypt");

class AuthService {
  async register(userData) {
    try {
      // Verificar si email ya existe
      const existingEmail = await UserModel.findByEmail(userData.email);
      if (existingEmail) {
        throw new Error("Email already registered");
      }
      // Verificar si username ya existe
      const existingUsername = await UserModel.findByUsername(
        userData.username,
      );
      if (existingUsername) {
        throw new Error("Username already taken");
      }
      // Crear usuario
      const user = await UserModel.create(userData);
      // Generar tokens
      const tokens = this.generateTokens(user);
      await RefreshToken.createToken(user.id, tokens.refreshToken);
      UserModel.updateLastLogin(user.id);
      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          fitnessLevel: user.fitness_level,
          createdAt: user.created_at,
        },
        tokens,
      };
    } catch (error) {
      console.log("Registration error:", error.message);
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
        throw new Error("Invalid credentials");
      }
      // Verificar contraseña
      const isValidPassword = await UserModel.verifyPassword(
        credentials.password,
        user.password_hash,
      );
      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }
      // Actualizar último login
      await UserModel.updateLastLogin(user.id);
      // Generar tokens
      const tokens = this.generateTokens(user);
      await RefreshToken.createToken(user.id, tokens.refreshToken);
      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          fitnessLevel: user.fitness_level,
          lastLogin: user.last_login,
        },
        tokens,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error("Refresh token required");
      }
      const tokenRecord = await RefreshToken.findValidToken(refreshToken);
      if (!tokenRecord) {
        throw new Error("Invalid or expired refresh token");
      }
      const decoded = JWTUtils.verifyRefreshToken(refreshToken);
      if (!decoded) {
        await RefreshToken.revokeToken(refreshToken);
        throw new Error("Invalid refresh token");
      }
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        await RefreshToken.revokeToken(refreshToken);
        throw new Error("User not found");
      }
      const tokens = this.generateTokens(user);
      await RefreshToken.revokeToken(refreshToken);
      await RefreshToken.createToken(user.id, tokens.refreshToken);
      return {
        user: { id: user.id, email: user.email, username: user.username },
        tokens,
      };
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  }
  async logout(userId, refreshToken) {
    if (refreshToken) {
      await RefreshToken.revokeToken(refreshToken);
    } else {
      await RefreshToken.revokeAllUserTokens(userId);
    }
    return true;
  }
  async getProfile(userId) {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("User not found");
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
        updatedAt: user.updated_at,
      };
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  }
  async updateProfile(userId, updateData) {
    try {
      const user = await UserModel.updateProfile(userId, updateData);
      if (!user) {
        throw new Error("User not found");
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
        updatedAt: user.updated_at,
      };
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }
  async verifyCurrentPassword(userId, currentPassword) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const isValid = await UserModel.verifyPassword(
        currentPassword,
        user.password_hash,
      );
      return isValid ? user : null;
    } catch (error) {
      console.error("Verify current password error:", error);
      throw error;
    }
  }
  async updatePassword(userId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const query =
        "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2";
      await db.query(query, [hashedPassword, userId]);

      return true;
    } catch (error) {
      console.error("Update password error:", error);
      throw new Error("Failed to update password");
    }
  }
  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      accessToken: JWTUtils.generateAccessToken(payload),
      refreshToken: JWTUtils.generateRefreshToken(payload),
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    };
  }
}

module.exports = new AuthService();
