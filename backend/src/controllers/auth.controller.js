const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const authService = require("@/services/auth.service");

// Khởi tạo Google Strategy một lần khi module được load
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || "http://localhost:3000"}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => done(null, profile),
  ),
);

const register = async (req, res) => {
  const { username, email, password } = req.body;
  const userAgent = req.headers["user-agent"];
  const userTokens = await authService.handleRegister(
    username,
    email,
    password,
    userAgent,
  );

  res.success(userTokens);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const userAgent = req.headers["user-agent"];
  const [error, userTokens] = await authService.handleLogin(
    email,
    password,
    userAgent,
  );
  if (error) return res.unauthorized();

  res.success(userTokens);
};

const refreshToken = async (req, res) => {
  const userAgent = req.headers["user-agent"];
  const token = req.body.refreshToken ?? req.body.refresh_token;
  const [error, data] = await authService.handleRefreshToken(token, userAgent);

  if (error) return res.unauthorized();

  res.success(data);
};

const logout = async (req, res) => {
  const refreshToken = req.body?.refreshToken;
  const [error, data] = await authService.handleLogout(refreshToken);

  if (error) return res.unauthorized();

  res.success(data);
};

const getCurrentUser = async (req, res) => {
  res.success(req.auth.user);
};

// Bắt đầu flow Google OAuth
const googleLogin = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
};

// Callback sau khi Google xác thực xong
const googleCallback = [
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/google/callback?error=google_failed`,
  }),
  async (req, res) => {
    const profile = req.user;
    const email = profile.emails?.[0]?.value;
    const avatar = profile.photos?.[0]?.value;
    const displayName = profile.displayName;
    const googleId = profile.id;
    const userAgent = req.headers["user-agent"];
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const [error, userData] = await authService.handleGoogleAuth(
      googleId,
      email,
      displayName,
      avatar,
      userAgent,
    );
    if (error) {
      return res.redirect(
        `${frontendUrl}/auth/google/callback?error=google_failed`,
      );
    }

    const params = new URLSearchParams({
      access_token: userData.accessToken,
      refresh_token: userData.refreshToken,
      user: JSON.stringify(userData),
      is_new: userData.isNewUser ? "1" : "0",
    });
    res.redirect(`${frontendUrl}/auth/google/callback?${params.toString()}`);
  },
];

module.exports = {
  login,
  register,
  refreshToken,
  logout,
  getCurrentUser,
  googleLogin,
  googleCallback,
};
