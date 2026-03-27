const express = require("express");

const momoController = require("@/controllers/momo.controller");
const authRequired = require("@/middleware/authRequire");

const router = express.Router();

// Nhóm API tạo/check/retry/hủy thanh toán MoMo cho user đang đăng nhập.
router.post("/orders", authRequired, momoController.createOrderPayment);
router.get("/orders/:orderId/status", authRequired, momoController.getOrderPaymentStatus);
router.post("/orders/:orderId/recreate", authRequired, momoController.recreateOrderPayment);
router.post("/orders/:orderId/cancel", authRequired, momoController.cancelPendingOrder);

// Provider callback/IPN để đồng bộ trạng thái giao dịch từ MoMo về hệ thống.
router.get("/return", momoController.handleReturn);
router.post("/ipn", momoController.handleIpn);

module.exports = router;
