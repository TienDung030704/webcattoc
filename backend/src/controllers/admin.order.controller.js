const adminOrderService = require("@/services/admin.order.service");

const parseOrderId = (value) => {
  try {
    // Parse id sang BigInt để khớp kiểu bigint đang dùng ở bảng orders.
    return BigInt(value);
  } catch {
    throw new Error("Id đơn hàng không hợp lệ");
  }
};

const getOrderErrorStatus = (message) => {
  if (message === "Không tìm thấy đơn hàng") {
    return 404;
  }

  return 400;
};

const getOrders = async (req, res) => {
  try {
    const data = await adminOrderService.getOrders(req.query);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể tải danh sách đơn hàng";
    res.error(message, getOrderErrorStatus(message));
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);
    const data = await adminOrderService.getOrderDetail(orderId);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể lấy chi tiết đơn hàng";
    res.error(message, getOrderErrorStatus(message));
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);
    const data = await adminOrderService.updateOrderStatus(orderId, req.body?.status);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể cập nhật trạng thái đơn hàng";
    res.error(message, getOrderErrorStatus(message));
  }
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
};
