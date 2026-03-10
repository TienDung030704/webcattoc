const prisma = require("@/libs/prisma");
const notificationService = require("@/services/notification.service");

class AdminService {
  getTodayRange() {
    // Dùng chung mốc đầu/ngày để query dashboard theo ngày hiện tại.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    return { startOfToday, endOfToday };
  }

  getAppointmentStatusTransition(currentStatus, nextStatus) {
    // Khóa luồng chuyển trạng thái để admin không update sai vòng đời lịch hẹn.
    const transitions = {
      BOOKED: ["IN_PROGRESS", "CANCELED"],
      IN_PROGRESS: ["COMPLETED", "CANCELED"],
      COMPLETED: [],
      CANCELED: [],
    };

    return transitions[currentStatus]?.includes(nextStatus);
  }

  buildAppointmentWhere(query = {}) {
    // Gom toàn bộ filter list lịch hẹn vào 1 object where cho Prisma.
    const where = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.date) {
      // Nếu có date cụ thể thì lọc toàn bộ lịch trong đúng ngày đó.
      const start = new Date(query.date);
      if (!Number.isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        where.appointmentAt = {
          gte: start,
          lt: end,
        };
      }
    } else if (query.from || query.to) {
      // Hỗ trợ lọc khoảng thời gian khi admin truyền from/to.
      const appointmentAt = {};

      if (query.from) {
        const from = new Date(query.from);
        if (!Number.isNaN(from.getTime())) {
          appointmentAt.gte = from;
        }
      }

      if (query.to) {
        const to = new Date(query.to);
        if (!Number.isNaN(to.getTime())) {
          appointmentAt.lte = to;
        }
      }

      if (Object.keys(appointmentAt).length > 0) {
        where.appointmentAt = appointmentAt;
      }
    }

    if (query.search) {
      // Search theo tên dịch vụ hoặc username của khách hàng.
      where.OR = [
        {
          serviceName: {
            contains: query.search,
          },
        },
        {
          user: {
            username: {
              contains: query.search,
            },
          },
        },
      ];
    }

    return where;
  }

  mapAppointmentSummary(appointment) {
    // Chuẩn hóa shape dữ liệu lịch hẹn trả về cho frontend admin.
    return {
      id: appointment.id,
      customerName: appointment.user?.username || "Khách lẻ",
      customerEmail: appointment.user?.email || null,
      serviceName: appointment.serviceName,
      appointmentTime: appointment.appointmentAt,
      amount: Number(appointment.amount || 0),
      status: appointment.status,
    };
  }

  getCustomerDisplayName(user) {
    // Ưu tiên tên thật, fallback về username/email để frontend luôn có tên hiển thị.
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return fullName || user.username || user.email;
  }

  buildCustomerWhere(query = {}) {
    // Chỉ lấy user đóng vai trò khách hàng cho trang Customer Manager.
    const where = {
      role: "USER",
    };

    if (query.isVerified === "true") {
      where.isVerified = true;
    }

    if (query.isVerified === "false") {
      where.isVerified = false;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        {
          username: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
          },
        },
        {
          firstName: {
            contains: search,
          },
        },
        {
          lastName: {
            contains: search,
          },
        },
      ];

      // Nếu admin nhập id số thì cho phép tìm trực tiếp theo mã khách hàng.
      if (/^\d+$/.test(search)) {
        where.OR.push({
          id: BigInt(search),
        });
      }
    }

    return where;
  }

  mapCustomerSummary(user) {
    // Chuẩn hóa dữ liệu khách hàng để frontend không phụ thuộc Prisma shape.
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: this.getCustomerDisplayName(user),
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      totalAppointments: user._count?.appointments || 0,
    };
  }

  async getTotalAppointmentsToday() {
    const { startOfToday, endOfToday } = this.getTodayRange();

    // Đếm tổng số lịch hẹn nằm trong ngày hiện tại.
    return await prisma.appointment.count({
      where: {
        appointmentAt: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
    });
  }

  async getNewCustomersToday() {
    // Hiện tại endpoint này đang trả tổng user không phải ADMIN.
    return await prisma.user.count({
      where: {
        role: {
          not: "ADMIN",
        },
      },
    });
  }

  async getTodayRevenue() {
    const { startOfToday, endOfToday } = this.getTodayRange();

    // Chỉ cộng doanh thu của các lịch đã hoàn thành trong hôm nay.
    const revenueResult = await prisma.appointment.aggregate({
      where: {
        appointmentAt: {
          gte: startOfToday,
          lt: endOfToday,
        },
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    });

    return Number(revenueResult._sum.amount || 0);
  }

  async getMostPopularService() {
    // Tìm dịch vụ được đặt nhiều nhất, bỏ qua các lịch đã bị hủy.
    const mostPopularServiceResult = await prisma.appointment.groupBy({
      by: ["serviceName"],
      where: {
        status: {
          not: "CANCELED",
        },
      },
      _count: {
        serviceName: true,
      },
      orderBy: {
        _count: {
          serviceName: "desc",
        },
      },
      take: 1,
    });

    return mostPopularServiceResult[0]?.serviceName || null;
  }

  async getTodayAppointmentsList() {
    const { startOfToday, endOfToday } = this.getTodayRange();

    // Lấy danh sách lịch hẹn của hôm nay để render bảng dashboard chính.
    return await prisma.appointment.findMany({
      where: {
        appointmentAt: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
      orderBy: {
        appointmentAt: "asc",
      },
      select: {
        id: true,
        serviceName: true,
        appointmentAt: true,
        status: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  async getAppointments(query = {}) {
    // Chuẩn hóa pagination để tránh page/limit âm hoặc quá lớn.
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const where = this.buildAppointmentWhere(query);

    // Query song song list item và total để tối ưu response cho admin table.
    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          appointmentAt: "desc",
        },
        select: {
          id: true,
          serviceName: true,
          appointmentAt: true,
          amount: true,
          status: true,
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapAppointmentSummary(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getUsers(query = {}) {
    // Chuẩn hóa pagination cho danh sách khách hàng của admin.
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const where = this.buildCustomerWhere(query);

    // Tách riêng summary tổng quan và danh sách đã lọc để frontend render dashboard + table.
    const [items, total, totalCustomers, verifiedCustomers, unverifiedCustomers] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              appointments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
      prisma.user.count({
        where: {
          role: "USER",
        },
      }),
      prisma.user.count({
        where: {
          role: "USER",
          isVerified: true,
        },
      }),
      prisma.user.count({
        where: {
          role: "USER",
          isVerified: false,
        },
      }),
    ]);

    return {
      items: items.map((item) => this.mapCustomerSummary(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalCustomers,
        verifiedCustomers,
        unverifiedCustomers,
      },
    };
  }

  async getAppointmentById(appointmentId) {
    // Lấy chi tiết 1 lịch hẹn để admin xem sâu hơn nếu cần.
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        serviceName: true,
        appointmentAt: true,
        amount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!appointment) {
      return null;
    }

    // Chuẩn hóa payload chi tiết để frontend không phụ thuộc structure Prisma.
    return {
      id: appointment.id,
      customer: appointment.user
        ? {
            id: appointment.user.id,
            username: appointment.user.username,
            email: appointment.user.email,
            firstName: appointment.user.firstName,
            lastName: appointment.user.lastName,
          }
        : null,
      serviceName: appointment.serviceName,
      appointmentTime: appointment.appointmentAt,
      amount: Number(appointment.amount || 0),
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }

  async createAppointment(payload = {}) {
    const { userId, serviceName, appointmentAt, amount } = payload;

    // Validate các field bắt buộc trước khi tạo lịch hẹn từ admin.
    if (!userId || !serviceName || !appointmentAt || amount == null) {
      throw new Error("Thiếu dữ liệu tạo lịch hẹn");
    }

    const appointmentDate = new Date(appointmentAt);
    if (Number.isNaN(appointmentDate.getTime())) {
      throw new Error("Thời gian lịch hẹn không hợp lệ");
    }

    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount < 0) {
      throw new Error("Số tiền không hợp lệ");
    }

    // Kiểm tra khách hàng tồn tại trước khi gắn userId vào lịch hẹn.
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      throw new Error("Không tìm thấy khách hàng");
    }

    // Tạo lịch hẹn mới trong DB.
    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        serviceName,
        appointmentAt: appointmentDate,
        amount: normalizedAmount,
      },
      select: {
        id: true,
        serviceName: true,
        appointmentAt: true,
        amount: true,
        status: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    // Sinh notification cho admin khi có lịch hẹn mới.
    await notificationService.createAppointmentBookedNotification({
      id: appointment.id,
      customerName: appointment.user?.username || "Khách lẻ",
      serviceName: appointment.serviceName,
      appointmentAt: appointment.appointmentAt,
    });

    return this.mapAppointmentSummary(appointment);
  }

  async updateAppointmentStatus(appointmentId, nextStatus) {
    // Chỉ cho phép update sang các trạng thái đã khai báo trong hệ thống.
    const allowedStatuses = ["BOOKED", "IN_PROGRESS", "COMPLETED", "CANCELED"];
    if (!allowedStatuses.includes(nextStatus)) {
      throw new Error("Trạng thái lịch hẹn không hợp lệ");
    }

    // Lấy lịch hiện tại để kiểm tra tồn tại và validate trạng thái chuyển tiếp.
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        serviceName: true,
        appointmentAt: true,
        amount: true,
        status: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new Error("Không tìm thấy lịch hẹn");
    }

    // Nếu trạng thái không đổi thì trả dữ liệu cũ luôn, không cần update DB.
    if (appointment.status === nextStatus) {
      return this.mapAppointmentSummary(appointment);
    }

    if (!this.getAppointmentStatusTransition(appointment.status, nextStatus)) {
      throw new Error("Không thể chuyển trạng thái lịch hẹn");
    }

    // Update trạng thái lịch hẹn sau khi đã qua validate.
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: nextStatus },
      select: {
        id: true,
        serviceName: true,
        appointmentAt: true,
        amount: true,
        status: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    // Nếu lịch bị hủy thì sinh thêm notification để admin thấy biến động.
    if (nextStatus === "CANCELED") {
      await notificationService.createAppointmentCanceledNotification({
        id: updatedAppointment.id,
        customerName: updatedAppointment.user?.username || "Khách lẻ",
        serviceName: updatedAppointment.serviceName,
        appointmentAt: updatedAppointment.appointmentAt,
      });
    }

    return this.mapAppointmentSummary(updatedAppointment);
  }

}

module.exports = new AdminService();
