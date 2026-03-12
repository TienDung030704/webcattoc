const express = require("express");

const adminController = require("@/controllers/admin.controller");
const adminNotificationRouter = require("@/routes/admin.notification.route");
const adminNewsRouter = require("@/routes/admin.news.route");
const adminProductController = require("@/controllers/admin.product.controller");
const adminOrderRouter = require("@/routes/admin.order.route");
const adminServiceRouter = require("@/routes/admin.service.route");
const authRequired = require("@/middleware/authRequire");
const checkRoles = require("@/middleware/checkRoles");

const router = express.Router();

// Khóa toàn bộ nhánh /api/admin cho user đã đăng nhập và có role ADMIN.
router.use(authRequired, checkRoles("ADMIN"));

// Nhóm API lấy số liệu tổng quan cho dashboard admin.
router.get(
  "/dashboard/appointments-today",
  adminController.getTotalAppointmentsToday,
);
router.get("/dashboard/new-customers", adminController.getNewCustomersToday);
router.get("/dashboard/today-revenue", adminController.getTodayRevenue);
router.get("/dashboard/weekly-revenue", adminController.getWeeklyRevenue);
router.get(
  "/dashboard/most-popular-service",
  adminController.getMostPopularService,
);

// API báo cáo doanh thu từ các lịch đã hoàn thành và đã xác nhận thu tiền.
router.get("/revenue", adminController.getRevenue);

// Nhóm API quản lý lịch hẹn cho admin.
router.get("/appointments/today", adminController.getTodayAppointmentsList);
router.get("/appointments", adminController.getAppointments);
router.get("/appointments/:id", adminController.getAppointmentById);
router.post("/appointments", adminController.createAppointment);
router.patch("/appointments/:id/status", adminController.updateAppointmentStatus);
router.patch("/appointments/:id/payment", adminController.confirmAppointmentPayment);

// Nhóm API quản lý khách hàng cho admin.
router.get("/users", adminController.getUsers);

// Tách notification sang router riêng nhưng vẫn giữ nguyên URL /api/admin/notifications/*.
router.use("/notifications", adminNotificationRouter);

// Tách order manager sang router riêng nhưng vẫn giữ URL /api/admin/orders/*.
router.use("/orders", adminOrderRouter);

// Tách service manager sang router riêng nhưng vẫn giữ URL /api/admin/services/*.
router.use("/services", adminServiceRouter);

// Tách news manager sang router riêng nhưng vẫn giữ URL /api/admin/news/*.
router.use("/news", adminNewsRouter);

// API cập nhật tồn kho; khi về 0 sẽ sinh notification hết hàng.
router.patch("/products/:id/stock", adminProductController.updateStock);

module.exports = router;
