const express = require("express");

const adminProductController = require("@/controllers/admin.product.controller");
const authRequired = require("@/middleware/authRequire");
const checkRoles = require("@/middleware/checkRoles");
const uploadProductImages = require("@/middleware/uploadProductImages");

const router = express.Router();

// Khóa toàn bộ nhánh /api/admin.product cho user đã đăng nhập và có role ADMIN.
router.use(authRequired, checkRoles("ADMIN"));

// Nhóm API quản lý sản phẩm cho admin.
router.get("/", adminProductController.getProducts);
router.post("/", uploadProductImages, adminProductController.createProduct);
router.patch("/:id", uploadProductImages, adminProductController.updateProduct);
router.patch("/:id/stock", adminProductController.updateStock);
router.patch("/:id/visibility", adminProductController.updateVisibility);

module.exports = router;
