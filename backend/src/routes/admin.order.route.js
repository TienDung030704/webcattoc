const express = require("express");

const adminOrderController = require("@/controllers/admin.order.controller");
const authRequired = require("@/middleware/authRequire");
const checkRoles = require("@/middleware/checkRoles");

const router = express.Router();

// Guard riêng để nếu route này bị auto-mount theo filename thì vẫn không bị public.
router.use(authRequired, checkRoles("ADMIN"));

// Nhóm API quản lý đơn hàng cho admin.
router.get("/", adminOrderController.getOrders);
router.get("/:id", adminOrderController.getOrderById);
router.patch("/:id/status", adminOrderController.updateOrderStatus);
router.patch("/:id/payment", adminOrderController.confirmOrderPayment);

module.exports = router;
