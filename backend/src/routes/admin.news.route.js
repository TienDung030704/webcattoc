const express = require("express");

const newsController = require("@/controllers/news.controller");
const authRequired = require("@/middleware/authRequire");
const checkRoles = require("@/middleware/checkRoles");
const uploadNewsThumbnail = require("@/middleware/uploadNewsThumbnail");

const router = express.Router();

// Guard riêng để nếu route này bị auto-mount theo filename thì vẫn không bị public.
router.use(authRequired, checkRoles("ADMIN"));

// Nhóm API quản lý bài viết cho admin.
router.get("/", newsController.getAdminNews);
router.get("/:id", newsController.getAdminNewsById);
router.post("/", uploadNewsThumbnail, newsController.createNews);
router.patch("/:id", uploadNewsThumbnail, newsController.updateNews);
router.delete("/:id", newsController.deleteNews);

module.exports = router;
