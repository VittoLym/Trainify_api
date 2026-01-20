const BaseModel = require('./base.model');

class RefreshToken extends BaseModel {
  constructor() {
    super('refresh_tokens');
  }

  async createToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    return await this.create({
      user_id: userId,
      token: token,
      expires_at: expiresAt,
      revoked: false
    });
  }

  async findValidToken(token) {
    const result = await this.db.query(
      `SELECT rt.*, u.email, u.username 
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1 
       AND rt.revoked = false 
       AND rt.expires_at > NOW()`,
      [token]
    );
    return result.rows[0];
  }

  async revokeToken(token) {
    await this.db.query(
      'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
      [token]
    );
  }

  async revokeAllUserTokens(userId) {
    await this.db.query(
      'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1',
      [userId]
    );
  }
}

module.exports = new RefreshToken();