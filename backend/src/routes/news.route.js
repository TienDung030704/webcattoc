const express = require("express");

const newsController = require("@/controllers/news.controller");
const authRequired = require("@/middleware/authRequire");
const checkRoles = require("@/middleware/checkRoles");
const uploadNewsThumbnail = require("@/middleware/uploadNewsThumbnail");

const router = express.Router();

// Public API trả danh sách bài viết đã publish để frontend news page dùng trực tiếp.
router.get("/", newsController.getNews);

// Admin CRUD bài viết được gắn ngay trong router news theo yêu cầu hiện tại.
router.post(
  "/",
  authRequired,
  checkRoles("ADMIN"),
  uploadNewsThumbnail,
  newsController.createNews,
);
router.patch(
  "/:id",
  authRequired,
  checkRoles("ADMIN"),
  uploadNewsThumbnail,
  newsController.updateNews,
);
router.delete(
  "/:id",
  authRequired,
  checkRoles("ADMIN"),
  newsController.deleteNews,
);

// Public API trả chi tiết 1 bài viết đã publish theo slug.
router.get("/:slug", newsController.getNewsDetail);

module.exports = router;
