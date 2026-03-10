const express = require("express");

const authController = require("@/controllers/auth.controller");
const authRequired = require("@/middleware/authRequire");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/me", authRequired, authController.getCurrentUser);

module.exports = router;
