const branchService = require("@/services/branch.service");

const getBranches = async (req, res) => {
  try {
    // Trả danh sách chi nhánh public để booking page và stores page dùng chung một nguồn dữ liệu.
    const data = await branchService.getBranches(req.query);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể tải danh sách chi nhánh";
    res.error(message, 400);
  }
};

module.exports = {
  getBranches,
};
