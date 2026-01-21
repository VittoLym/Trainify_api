const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('../../src/services/auth.service');

// Mock de dependencias
jest.mock('../../models/User');
jest.mock('../../models/RefreshToken');
jest.mock('../../utils/jwt');
jest.mock('bcrypt');

const User = require('../../models/User');
const RefreshToken = require('../../models/RefreshToken');
const JWTUtils = require('../../utils/jwt');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUserData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        fitness_level: 'beginner',
        created_at: new Date()
      };

      const mockTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456'
      };

      User.findByEmail.mockResolvedValue(null);
      User.findByUsername.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      JWTUtils.generateTokens.mockReturnValue(mockTokens);
      bcrypt.hash.mockResolvedValue('hashed-password');

      const result = await authService.register(mockUserData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(mockUserData.email);
      expect(result.user.username).toBe(mockUserData.username);
      expect(User.create).toHaveBeenCalled();
      expect(RefreshToken.createToken).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const mockUserData = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'Password123'
      };

      User.findByEmail.mockResolvedValue({ email: 'existing@example.com' });

      await expect(authService.register(mockUserData))
        .rejects
        .toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login user with email successfully', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        password_hash: 'hashed-password',
        fitness_level: 'beginner',
        last_login: null
      };

      const mockTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456'
      };

      User.findByEmail.mockResolvedValue(mockUser);
      User.verifyPassword.mockResolvedValue(true);
      JWTUtils.generateTokens.mockReturnValue(mockTokens);

      const result = await authService.login(mockCredentials);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(mockCredentials.email);
      expect(User.updateLastLogin).toHaveBeenCalled();
    });

    it('should throw error for invalid credentials', async () => {
      const mockCredentials = {
        email: 'nonexistent@example.com',
        password: 'WrongPassword'
      };

      User.findByEmail.mockResolvedValue(null);

      await expect(authService.login(mockCredentials))
        .rejects
        .toThrow('Invalid credentials');
    });
  });
});