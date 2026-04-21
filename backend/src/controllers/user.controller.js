const userService = require("@/services/user.service");

const getProducts = async (req, res) => {
  // Forward query filter/sort/pagination từ storefront xuống service xử lý.
  const data = await userService.getProducts(req.query);
  res.success(data);
};

const getProductDetail = async (req, res) => {
  try {
    // Trả chi tiết 1 sản phẩm public để storefront mở trang detail theo id.
    const data = await userService.getProductDetail(req.params.productId);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể tải chi tiết sản phẩm";
    res.error(message, getUserErrorStatus(message));
  }
};

const getServices = async (req, res) => {
  // Trả danh sách dịch vụ public để booking page lấy dữ liệu thật mà không cần quyền admin.
  const data = await userService.getServices(req.query);
  res.success(data);
};

const getBranches = async (req, res) => {
  try {
    // Trả danh sách chi nhánh public qua user namespace để frontend booking tích hợp thống nhất.
    const data = await userService.getBranches(req.query);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể tải danh sách chi nhánh";
    res.error(message, getUserErrorStatus(message));
  }
};

const getFavorites = async (req, res) => {
  try {
    // Trả danh sách favorite của user hiện tại để frontend render count/list đồng bộ theo account.
    const data = await userService.getFavorites(req.auth.user.id);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể tải danh sách yêu thích";
    res.error(message, getUserErrorStatus(message));
  }
};

const getFavoriteStatus = async (req, res) => {
  try {
    // Kiểm tra trạng thái yêu thích của 1 sản phẩm để heart button render đúng ngay khi mở detail.
    const data = await userService.getFavoriteStatus(
      req.auth.user.id,
      req.params.productId,
    );
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể tải trạng thái yêu thích";
    res.error(message, getUserErrorStatus(message));
  }
};

const addFavorite = async (req, res) => {
  try {
    // Chỉ cho phép user đang đăng nhập thêm sản phẩm active vào favorites của chính họ.
    const data = await userService.addFavorite(req.auth.user.id, req.params.productId);
    res.success(data, 201);
  } catch (error) {
    const message = error?.message || "Không thể thêm sản phẩm vào yêu thích";
    res.error(message, getUserErrorStatus(message));
  }
};

const removeFavorite = async (req, res) => {
  try {
    // Xóa favorite theo productId nhưng vẫn giữ API idempotent nếu user bấm bỏ nhiều lần.
    const data = await userService.removeFavorite(req.auth.user.id, req.params.productId);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể bỏ sản phẩm khỏi yêu thích";
    res.error(message, getUserErrorStatus(message));
  }
};

const getUserErrorStatus = (message) => {
  if (["Không tìm thấy người dùng", "Không tìm thấy sản phẩm", "Không tìm thấy chi nhánh"].includes(message)) {
    return 404;
  }

  if (
    message === "Sản phẩm hiện không khả dụng" ||
    message?.includes("không đủ tồn kho")
  ) {
    return 409;
  }

  return 400;
};


const getAppointments = async (req, res) => {
  try {
    // User chỉ được xem lịch sử đặt lịch của chính mình qua userId lấy từ auth middleware.
    const data = await userService.getAppointments(req.auth.user.id, req.query);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể tải lịch sử đặt lịch";
    res.error(message, getUserErrorStatus(message));
  }
};

const createAppointment = async (req, res) => {
  try {
    // User chỉ được tạo lịch hẹn cho chính mình thông qua userId lấy từ token.
    const data = await userService.createAppointment(req.auth.user.id, req.body);
    res.success(data, 201);
  } catch (error) {
    const message = error?.message || "Không thể đặt lịch";
    res.error(message, getUserErrorStatus(message));
  }
};

const createOrder = async (req, res) => {
  try {
    // User chỉ được tạo đơn hàng cho chính mình nên userId luôn lấy từ auth middleware.
    const data = await userService.createOrder(req.auth.user.id, req.body);
    res.success(data, 201);
  } catch (error) {
    const message = error?.message || "Không thể tạo đơn hàng";
    res.error(message, getUserErrorStatus(message));
  }
};

const updateProfile = async (req, res) => {
  try {
    // Lấy user hiện tại từ auth middleware để chỉ cho phép sửa profile của chính mình.
    const data = await userService.updateProfile(req.auth.user.id, req.body);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể cập nhật thông tin người dùng";
    res.error(message, getUserErrorStatus(message));
  }
};

const changePassword = async (req, res) => {
  try {
    // User chỉ được đổi mật khẩu của chính mình qua userId lấy từ auth middleware.
    const data = await userService.changePassword(req.auth.user.id, req.body);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể đổi mật khẩu";
    res.error(message, getUserErrorStatus(message));
  }
};

const updateAvatar = async (req, res) => {
  try {
    // Tách riêng API avatar để frontend có thể cập nhật image rõ ràng hơn.
    const data = await userService.updateAvatar(req, req.auth.user.id, req.body);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể cập nhật ảnh đại diện";
    res.error(message, getUserErrorStatus(message));
  }
};

module.exports = {
  getProducts,
  getProductDetail,
  getServices,
  getBranches,
  getFavorites,
  getFavoriteStatus,
  addFavorite,
  removeFavorite,
  getAppointments,
  createAppointment,
  createOrder,
  updateProfile,
  changePassword,
  updateAvatar,
};
