const authService = require("@/services/auth.service");

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
  const [error, data] = await authService.handleRefreshToken(
    req.body.refreshToken,
    userAgent,
  );

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

module.exports = {
  login,
  register,
  refreshToken,
  logout,
  getCurrentUser,
};
