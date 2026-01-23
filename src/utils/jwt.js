const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};
class JWTUtils {
  static generateAccessToken(payload) {
    return jwt.sign(payload, JWT_CONFIG.secret, {
      expiresIn: JWT_CONFIG.expiresIn
    });
  }
  static generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_CONFIG.refreshSecret, {
      expiresIn: JWT_CONFIG.refreshExpiresIn
    });
  }
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_CONFIG.secret);
    } catch (error) {
      return null;
    }
  }
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, JWT_CONFIG.refreshSecret);
    } catch (error) {
      return null;
    }
  }
  static decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = JWTUtils;