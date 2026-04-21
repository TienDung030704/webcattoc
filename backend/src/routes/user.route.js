const express = require("express");

const branchRouter = require("@/routes/branch.route");
const userController = require("@/controllers/user.controller");
const authRequired = require("@/middleware/authRequire");
const uploadUserAvatar = require("@/middleware/uploadUserAvatar");

const router = express.Router();

// Public API cho storefront lấy danh sách sản phẩm đang hiển thị.
router.get("/products", userController.getProducts);

// Public API cho storefront lấy chi tiết 1 sản phẩm đang hiển thị.
router.get("/products/:productId", userController.getProductDetail);

// Public API cho booking/stores page lấy danh sách chi nhánh đang hoạt động.
router.use("/branches", branchRouter);

// Public API cho booking page lấy danh sách dịch vụ đang hiển thị.
router.get("/services", userController.getServices);

// API cho user đang đăng nhập lấy danh sách sản phẩm yêu thích của chính mình.
router.get("/favorites", authRequired, userController.getFavorites);

// API cho user đang đăng nhập kiểm tra trạng thái favorite của 1 sản phẩm.
router.get("/favorites/:productId/status", authRequired, userController.getFavoriteStatus);

// API cho user đang đăng nhập thêm 1 sản phẩm vào favorites của chính mình.
router.post("/favorites/:productId", authRequired, userController.addFavorite);

// API cho user đang đăng nhập bỏ 1 sản phẩm khỏi favorites của chính mình.
router.delete("/favorites/:productId", authRequired, userController.removeFavorite);

// API để user đang đăng nhập xem toàn bộ lịch sử đặt lịch của chính mình.
router.get("/appointments", authRequired, userController.getAppointments);

// API để user đang đăng nhập tự đặt lịch cho chính mình.
router.post("/appointments", authRequired, userController.createAppointment);

// API để user đang đăng nhập tự tạo đơn hàng sản phẩm từ checkout page.
router.post("/orders", authRequired, userController.createOrder);

// API cho user đang đăng nhập tự cập nhật thông tin profile của chính mình.
router.patch("/profile", authRequired, userController.updateProfile);

// API đổi mật khẩu riêng để tách hẳn khỏi luồng update profile thường.
router.patch("/profile/password", authRequired, userController.changePassword);

// API cập nhật riêng avatar/image của user hiện tại.
router.patch("/profile/avatar", authRequired, uploadUserAvatar, userController.updateAvatar);

module.exports = router;
