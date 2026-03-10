const prisma = require("../libs/prisma");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authConfig = require("../config/authConfig");
const randomString = require("../../utils/randomString");

class AuthService {
  // Xử lý đăng ký user mới
  async handleRegister(username, email, password, userAgent) {
    // Hash password để bảo mật
    const hash = await bcrypt.hash(password, 10);

    // Tạo user mới trong database
    const user = await prisma.user.create({
      data: { username, email, password: hash },
    });
    // Tạo cặp token cho user
    const userTokens = await this.generateUserTokens(user, userAgent);
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      ...userTokens,
    };
  }

  // Xử lý đăng nhập
  async handleLogin(email, password, userAgent) {
    // Tìm user theo email
    const user = await prisma.user.findUnique({ where: { email } });

    // Nếu không tìm thấy user
    if (!user) {
      return [true, null];
    }

    // Kiểm tra password có đúng không
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      // Password đúng → tạo token
      const userTokens = await this.generateUserTokens(user, userAgent);
      return [
        null,
        {
          id: user.id,
          username: user.username,
          role: user.role,
          ...userTokens,
        },
      ];
    }
    // Password sai
    return [true, null];
  }

  // Xử lý refresh token
  async handleRefreshToken(token, userAgent) {
    // Tìm refresh token trong database
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    // Nếu token không hợp lệ
    if (!refreshToken) {
      return [true, null];
    }

    // Thu hồi token cũ (1 lần dùng)
    await prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { isRevoked: true },
    });

    // Tạo fake user object để tạo token mới
    const user = { id: refreshToken.userId };
    const userTokens = await this.generateUserTokens(user, userAgent);
    return [null, userTokens];
  }

  // Xử lý đăng xuất
  async handleLogout(token) {
    if (!token) {
      return [null, { loggedOut: true }];
    }
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      return [null, { loggedOut: true }];
    }

    await prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { isRevoked: true },
    });

    return [null, { loggedOut: true }];
  }

  // Tạo access token
  generateAccessToken(user) {
    const expiresAt = Math.floor(Date.now() / 1000) + authConfig.accessTokenTTL;
    const tokenPayload = { sub: user.id, exp: expiresAt };
    return jwt.sign(tokenPayload, authConfig.jwtSecret);
  }

  // Tạo refresh token
  async generateRefreshToken(user, userAgent) {
    // Tạo token ngẫu nhiên (unique)
    let token;
    let exists = false;

    do {
      token = randomString(32);
      const count = await prisma.refreshToken.count({ where: { token } });
      exists = count > 0;
    } while (exists);

    // Tính thời gian hết hạn
    const expiresAt = new Date(Date.now() + authConfig.refreshTokenTTL * 1000);

    // Lưu token vào database
    const refreshToken = await prisma.refreshToken.create({
      data: { userId: user.id, token, userAgent, expiresAt },
    });

    return refreshToken.token;
  }

  // Lấy thông tin user theo ID
  async getUserById(id) {
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isVerified: true,
        emailVerifiedAt: true,
        _count: {
          select: {
            refreshTokens: true,
          },
        },
      },
      where: { id },
    });
    return user;
  }

  // Tạo cặp token (access + refresh)
  async generateUserTokens(user, userAgent) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, userAgent);

    return {
      accessToken,
      accessTokenTTL: authConfig.accessTokenTTL,
      refreshToken,
    };
  }
}

module.exports = new AuthService();
