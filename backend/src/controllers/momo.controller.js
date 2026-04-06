const momoService = require("@/services/momo.service");

const parseOrderId = (value) => {
  try {
    // Parse id sang BigInt để khớp kiểu bigint đang dùng ở bảng orders.
    return BigInt(value);
  } catch {
    throw new Error("Id đơn hàng không hợp lệ");
  }
};

const getMomoErrorStatus = (message) => {
  if (["Không tìm thấy đơn hàng", "Không tìm thấy phiên thanh toán MoMo"].includes(message)) {
    return 404;
  }

  if (
    [
      "Đơn hàng này đã được thanh toán",
      "Đơn hàng này không sử dụng thanh toán MoMo",
      "Không thể tạo lại phiên thanh toán cho đơn đã hủy",
      "Không thể hủy đơn hàng đã thanh toán",
      "Chữ ký MoMo không hợp lệ",
      "Thiếu chữ ký MoMo",
      "Thiếu mã đơn hàng MoMo",
      "Thiếu dữ liệu xác nhận MoMo",
      "PartnerCode MoMo không hợp lệ",
      "Số tiền MoMo không khớp với đơn hàng",
    ].includes(message) || message?.startsWith("Thiếu cấu hình MoMo:")
  ) {
    return 400;
  }

  if (message?.includes("không đủ tồn kho")) {
    return 409;
  }

  return 400;
};

const createOrderPayment = async (req, res) => {
  try {
    // Tạo order + phiên thanh toán MoMo riêng để không trộn với flow COD/chuyển khoản thường.
    const data = await momoService.createOrderPayment(req.auth.user.id, req.body);
    res.success(data, 201);
  } catch (error) {
    const message = error?.message || "Không thể tạo phiên thanh toán MoMo";
    res.error(message, getMomoErrorStatus(message));
  }
};

const getOrderPaymentStatus = async (req, res) => {
  try {
    // User chỉ được xem trạng thái thanh toán của chính đơn hàng thuộc về họ.
    const orderId = parseOrderId(req.params.orderId);
    const data = await momoService.getOrderPaymentStatus(req.auth.user.id, orderId);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể lấy trạng thái thanh toán MoMo";
    res.error(message, getMomoErrorStatus(message));
  }
};

const recreateOrderPayment = async (req, res) => {
  try {
    // Cho phép tạo lại session QR mới cho đơn MoMo đang pending/chưa hoàn tất.
    const orderId = parseOrderId(req.params.orderId);
    const data = await momoService.recreateOrderPayment(req.auth.user.id, orderId);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể tạo lại phiên thanh toán MoMo";
    res.error(message, getMomoErrorStatus(message));
  }
};

const cancelPendingOrder = async (req, res) => {
  try {
    // Hủy đơn MoMo pending theo chủ đơn để frontend có nút bỏ thanh toán an toàn.
    const orderId = parseOrderId(req.params.orderId);
    const data = await momoService.cancelPendingOrder(req.auth.user.id, orderId);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể hủy đơn thanh toán MoMo";
    res.error(message, getMomoErrorStatus(message));
  }
};

const handleReturn = async (req, res) => {
  try {
    // Return URL chỉ dùng để điều hướng UX về frontend callback page, không tự chốt đơn paid ở đây.
    const data = await momoService.handleReturn(req.query);
    res.redirect(data.redirectUrl);
  } catch (error) {
    const message = error?.message || "Không thể xử lý callback MoMo";
    res.error(message, getMomoErrorStatus(message));
  }
};

const handleIpn = async (req, res) => {
  try {
    // IPN là nguồn xác nhận thanh toán chính từ MoMo, dùng để cập nhật trạng thái order thực tế.
    const data = await momoService.handleIpn(req.body);
    res.status(200).json(data.ack);
  } catch (error) {
    const message = error?.message || "Không thể xử lý IPN MoMo";
    res.status(200).json({
      resultCode: 1,
      message,
    });
  }
};

module.exports = {
  createOrderPayment,
  getOrderPaymentStatus,
  recreateOrderPayment,
  cancelPendingOrder,
  handleReturn,
  handleIpn,
};
