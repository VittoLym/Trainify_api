const authService = require('../services/auth.service');

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        code: 'REGISTRATION_ERROR'
      });
    }
  }
  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
        code: 'LOGIN_ERROR'
      });
    }
  }
  async refreshToken(req, res) {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      res.json({
        success: true,
        data: result,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
        code: 'TOKEN_REFRESH_ERROR'
      });
    }
  }
  async logout(req, res) {
    try {
      await authService.logout(req.userId);
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        code: 'LOGOUT_ERROR'
      });
    }
  }
  async getProfile(req, res) {
    try {
      const profile = await authService.getProfile(req.userId);
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
        code: 'PROFILE_NOT_FOUND'
      });
    }
  }
  async updateProfile(req, res) {
    try {
      const updatedProfile = await authService.updateProfile(req.userId, req.body);
      
      res.json({
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        code: 'PROFILE_UPDATE_ERROR'
      });
    }
  }
}

module.exports = new AuthController();