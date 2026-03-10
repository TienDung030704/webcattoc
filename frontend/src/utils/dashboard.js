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
