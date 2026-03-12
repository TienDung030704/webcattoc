const prisma = require("@/libs/prisma");

class NotificationService {
  async create({
    type,
    title,
    message,
    resourceType = null,
    resourceId = null,
    payload = null,
  }) {
    // Hàm gốc để lưu mọi loại notification vào bảng notifications.
    return await prisma.notification.create({
      data: {
        type,
        title,
        message,
        resourceType,
        resourceId,
        payload,
      },
    });
  }

  async createAppointmentBookedNotification(appointment) {
    // Sinh notification khi có lịch hẹn mới được tạo.
    return await this.create({
      type: "APPOINTMENT_BOOKED",
      title: "Có lịch hẹn mới",
      message: `${appointment.customerName} đã đặt lịch ${appointment.serviceName}${appointment.branchName ? ` tại ${appointment.branchName}` : ""}`,
      resourceType: "APPOINTMENT",
      resourceId: appointment.id,
      payload: {
        appointmentId: appointment.id.toString(),
        customerName: appointment.customerName,
        serviceName: appointment.serviceName,
        appointmentTime: appointment.appointmentAt,
      },
    });
  }

  async createAppointmentCanceledNotification(appointment) {
    // Sinh notification khi admin hoặc hệ thống chuyển lịch hẹn sang trạng thái hủy.
    return await this.create({
      type: "APPOINTMENT_CANCELED",
      title: "Khách hủy lịch",
      message: `${appointment.customerName} đã hủy lịch ${appointment.serviceName}`,
      resourceType: "APPOINTMENT",
      resourceId: appointment.id,
      payload: {
        appointmentId: appointment.id.toString(),
        customerName: appointment.customerName,
        serviceName: appointment.serviceName,
        appointmentTime: appointment.appointmentAt,
      },
    });
  }

  async createProductOutOfStockNotification(product) {
    // Chặn tạo trùng notification hết hàng nếu sản phẩm đó vẫn còn 1 thông báo unread.
    const existingUnread = await prisma.notification.findFirst({
      where: {
        type: "PRODUCT_OUT_OF_STOCK",
        isRead: false,
        resourceType: "PRODUCT",
        resourceId: product.id,
      },
    });

    if (existingUnread) {
      return existingUnread;
    }

    // Chỉ tạo notification mới khi chưa có cảnh báo hết hàng nào đang unread.
    return await this.create({
      type: "PRODUCT_OUT_OF_STOCK",
      title: "Sản phẩm hết hàng",
      message: `${product.name} đã hết hàng`,
      resourceType: "PRODUCT",
      resourceId: product.id,
      payload: {
        productId: product.id.toString(),
        productName: product.name,
        stock: product.stock,
      },
    });
  }
}

module.exports = new NotificationService();
