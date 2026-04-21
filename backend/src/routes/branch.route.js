const express = require("express");

const branchController = require("@/controllers/branch.controller");

const router = express.Router();

// Public API cho booking page và stores page lấy danh sách chi nhánh đang hoạt động.
router.get("/", branchController.getBranches);

module.exports = router;
