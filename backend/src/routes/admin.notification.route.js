const express = require("express");

const adminNotificationController = require("@/controllers/admin.notification.controller");
const authRequired = require("@/middleware/authRequire");
const checkRoles = require("@/middleware/checkRoles");

const router = express.Router();

// Guard riêng để nếu route này bị auto-mount theo filename thì vẫn không bị public.
router.use(authRequired, checkRoles("ADMIN"));

// File này gom toàn bộ logic notification admin vào 1 router riêng để dễ quản lý.
router.get("/", adminNotificationController.getNotifications);
router.get("/unread-count", adminNotificationController.getNotificationUnreadCount);
router.patch("/:id/read", adminNotificationController.markNotificationAsRead);
router.patch("/read-all", adminNotificationController.markAllNotificationsAsRead);

module.exports = router;
