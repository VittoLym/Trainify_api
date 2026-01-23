jest.mock("../../src/models/user.model.js");
jest.mock("../../src/models/refreshToken.model.js");
jest.mock("../../src/utils/jwt.js");
jest.mock("../../src/utils/database.js");
jest.mock("bcrypt");

const AuthService = require("../../src/services/auth.service.js");
const UserModel = require("../../src/models/user.model.js");
const RefreshToken = require("../../src/models/refreshToken.model.js");
const JWTUtils = require("../../src/utils/jwt.js");
const db = require("../../src/utils/database.js");
const bcrypt = require("bcrypt");
const dotenv = require('dotenv')
dotenv.config()
const mockUser = {
  id: 1,
  email: "test@mail.com",
  username: "testuser",
  password_hash: "hashed",
  first_name: "Test",
  last_name: "User",
  fitness_level: "beginner",
  created_at: new Date(),
  last_login: new Date(),
};

const mockTokens = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  expiresIn: "15m",
};

describe("AuthService.register", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    JWTUtils.generateAccessToken.mockReturnValue("access-token");
    JWTUtils.generateRefreshToken.mockReturnValue("refresh-token");
  });

  it("registers a user successfully", async () => {
    UserModel.findByEmail.mockResolvedValue(null);
    UserModel.findByUsername.mockResolvedValue(null);
    UserModel.create.mockResolvedValue(mockUser);
    RefreshToken.createToken.mockResolvedValue(true);
    UserModel.updateLastLogin.mockResolvedValue(true);

    const result = await AuthService.register({
      email: "test@mail.com",
      username: "testuser",
      password: "123456789",
    });
    expect(UserModel.create).toHaveBeenCalled();
    expect(RefreshToken.createToken).toHaveBeenCalledWith(1, "refresh-token");
    expect(result.user.email).toBe("test@mail.com");
    expect(result.tokens.refreshToken).toBe("refresh-token");
  });

  it("throws error if email already exists", async () => {
    UserModel.findByEmail.mockResolvedValue(mockUser);

    await expect(
      AuthService.register({ email: "test@mail.com", username: "x" }),
    ).rejects.toThrow("Email already registered");
  });

  it("throws error if username already exists", async () => {
    UserModel.findByEmail.mockResolvedValue(null);
    UserModel.findByUsername.mockResolvedValue(mockUser);

    await expect(
      AuthService.register({ email: "x@mail.com", username: "testuser" }),
    ).rejects.toThrow("Username already taken");
  });
});
describe("AuthService.login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    JWTUtils.generateAccessToken.mockReturnValue("access-token");
    JWTUtils.generateRefreshToken.mockReturnValue("refresh-token");
  });

  it("logs in successfully with email", async () => {
    UserModel.findByEmail.mockResolvedValue(mockUser);
    UserModel.verifyPassword.mockResolvedValue(true);
    RefreshToken.createToken.mockResolvedValue(true);

    const result = await AuthService.login({
      email: "test@mail.com",
      password: "123456",
    });

    expect(result.tokens.accessToken).toBe("access-token");
  });

  it("throws error if credentials are invalid", async () => {
    UserModel.findByEmail.mockResolvedValue(null);

    await expect(
      AuthService.login({ email: "x@mail.com", password: "123" }),
    ).rejects.toThrow("Invalid credentials");
  });
});
describe("AuthService.refreshToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    JWTUtils.verifyRefreshToken.mockReturnValue({ id: 1 });
    JWTUtils.generateAccessToken.mockReturnValue("access-token");
    JWTUtils.generateRefreshToken.mockReturnValue("refresh-token");
  });

  it("refreshes token successfully", async () => {
    RefreshToken.findValidToken.mockResolvedValue({ token: "refresh-token" });
    UserModel.findById.mockResolvedValue(mockUser);
    RefreshToken.revokeToken.mockResolvedValue(true);
    RefreshToken.createToken.mockResolvedValue(true);

    const result = await AuthService.refreshToken("refresh-token");

    expect(result.tokens.refreshToken).toBe("refresh-token");
  });

  it("throws error if refresh token is missing", async () => {
    await expect(AuthService.refreshToken()).rejects.toThrow(
      "Refresh token required",
    );
  });
});
describe("AuthService.logout", () => {
  it("revokes single token", async () => {
    RefreshToken.revokeToken.mockResolvedValue(true);

    const result = await AuthService.logout(1, "refresh-token");

    expect(result).toBe(true);
  });

  it("revokes all user tokens", async () => {
    RefreshToken.revokeAllUserTokens.mockResolvedValue(true);

    const result = await AuthService.logout(1);

    expect(result).toBe(true);
  });
});
describe("AuthService.getProfile", () => {
  it("returns user profile", async () => {
    UserModel.findById.mockResolvedValue(mockUser);

    const profile = await AuthService.getProfile(1);

    expect(profile.email).toBe("test@mail.com");
  });

  it("throws if user not found", async () => {
    UserModel.findById.mockResolvedValue(null);

    await expect(AuthService.getProfile(1)).rejects.toThrow("User not found");
  });
});
describe("AuthService.updatePassword", () => {
  it("updates password successfully", async () => {
    bcrypt.hash.mockResolvedValue("new-hash");
    db.query.mockResolvedValue(true);

    const result = await AuthService.updatePassword(1, "newpassword");

    expect(result).toBe(true);
  });
});

