export function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(value) {
  if (!value) return "--:--";

  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function mapAppointmentStatus(status) {
  if (status === "BOOKED") return "Đã đặt";
  if (status === "IN_PROGRESS") return "Đang làm";
  if (status === "COMPLETED") return "Hoàn thành";
  if (status === "CANCELED") return "Đã hủy";
  return "Chờ";
}

export function mapPaymentMethod(paymentMethod) {
  if (paymentMethod === "BANK_TRANSFER") return "Chuyển khoản";
  if (paymentMethod === "MOMO") return "MoMo";
  if (paymentMethod === "COD") return "Tiền mặt";
  return "Khác";
}

export function mapPaymentStatus(paymentStatus) {
  if (paymentStatus === "PAID") return "Đã thanh toán";
  if (paymentStatus === "PENDING") return "Chờ thanh toán";
  if (paymentStatus === "FAILED") return "Thanh toán lỗi";
  if (paymentStatus === "EXPIRED") return "Hết hạn";
  return "Chưa rõ";
}
