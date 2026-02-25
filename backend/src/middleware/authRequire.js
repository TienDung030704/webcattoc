const jwt = require("jsonwebtoken");
const authConfig = require("../config/authConfig");
const authService = require("../service/auth.service");

async function authRequired(req, res, next) {
  try {
    const accessToken = req.headers?.authorization
      ?.replace("Bearer", "")
      ?.trim();

    if (!accessToken) {
      return res.unauthorized();
    }

    const payload = jwt.verify(accessToken, authConfig.jwtSecret);

    //Check expires
    if (payload.exp < Date.now() / 1000) {
      return res.unauthorized();
    }

    const userId = payload.sub;
    const user = await authService.getUserById(userId);
    if (!user) {
      return res.unauthorized();
    }
    req.auth = {
      user,
    };

    next();
  } catch (error) {
    return res.unauthorized();
  }
}
module.exports = authRequired;
