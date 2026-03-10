const prisma = require("@/libs/prisma");

class AdminNotificationService {
  async getNotifications(query = {}) {
    // Pagination cho feed thông báo admin.
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const where = {};

    // Cho phép lọc nhanh chỉ các thông báo chưa đọc.
    if (query.status === "unread") {
      where.isRead = false;
    }

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getNotificationUnreadCount() {
    // Trả badge unread cho icon chuông bên admin frontend.
    return await prisma.notification.count({
      where: {
        isRead: false,
      },
    });
  }

  async markNotificationAsRead(notificationId) {
    // Lấy notification hiện tại để tránh update mù.
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error("Không tìm thấy thông báo");
    }

    // Nếu đã đọc rồi thì trả lại luôn dữ liệu hiện tại.
    if (notification.isRead) {
      return notification;
    }

    // Đánh dấu 1 notification là đã đọc và lưu thời điểm đọc.
    return await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllNotificationsAsRead() {
    // Bulk update toàn bộ notification unread để reset badge nhanh.
    const result = await prisma.notification.updateMany({
      where: {
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      updatedCount: result.count,
    };
  }
}

module.exports = new AdminNotificationService();
