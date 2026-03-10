const adminNotificationService = require("@/services/admin.notification.service");

const parseNotificationId = (value) => {
  try {
    return BigInt(value);
  } catch {
    throw new Error("Id thông báo không hợp lệ");
  }
};

const getNotificationErrorStatus = (message) => {
  return message === "Không tìm thấy thông báo" ? 404 : 400;
};

const getNotifications = async (req, res) => {
  // Hỗ trợ list notification kèm pagination và filter unread.
  const data = await adminNotificationService.getNotifications(req.query);
  res.success(data);
};

const getNotificationUnreadCount = async (req, res) => {
  const data = await adminNotificationService.getNotificationUnreadCount();
  res.success(data);
};

const markNotificationAsRead = async (req, res) => {
  try {
    // Parse id notification sang BigInt trước khi cập nhật trạng thái đọc.
    const notificationId = parseNotificationId(req.params.id);
    const data = await adminNotificationService.markNotificationAsRead(notificationId);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể cập nhật thông báo";
    res.error(message, getNotificationErrorStatus(message));
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  // Đánh dấu toàn bộ thông báo chưa đọc thành đã đọc cho admin.
  const data = await adminNotificationService.markAllNotificationsAsRead();
  res.success(data);
};

module.exports = {
  getNotifications,
  getNotificationUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
