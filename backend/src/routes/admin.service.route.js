const express = require("express");

const adminServiceController = require("@/controllers/admin.service.controller");
const authRequired = require("@/middleware/authRequire");
const checkRoles = require("@/middleware/checkRoles");

const router = express.Router();

// Guard riêng để nếu route này bị auto-mount theo filename thì vẫn không bị public.
router.use(authRequired, checkRoles("ADMIN"));

// Nhóm API quản lý dịch vụ cho admin.
router.get("/", adminServiceController.getServices);
router.get("/:id", adminServiceController.getServiceById);
router.post("/", adminServiceController.createService);
router.patch("/:id", adminServiceController.updateService);
router.delete("/:id", adminServiceController.deleteService);

module.exports = router;
