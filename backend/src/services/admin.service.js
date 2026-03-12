const prisma = require("@/libs/prisma");
const branchService = require("@/services/branch.service");
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

  buildDateKey(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  buildRevenueRecord({
    id,
    source,
    customerName,
    customerEmail,
    branch,
    serviceName,
    appointmentTime,
    paymentConfirmedAt,
    paymentMethod,
    amount,
  }) {
    return {
      id: String(id),
      source,
      customerName,
      customerEmail,
      branch,
      serviceName,
      appointmentTime,
      paymentConfirmedAt,
      paymentMethod,
      amount: Number(amount || 0),
    };
  }

  getRecentDaysRange(days = 7) {
    // Dùng cho biểu đồ doanh thu tuần để luôn lấy đủ N ngày gần nhất tính đến hôm nay.
    const { startOfToday, endOfToday } = this.getTodayRange();
    const startOfRange = new Date(startOfToday);
    startOfRange.setDate(startOfRange.getDate() - (days - 1));

    return { startOfRange, startOfToday, endOfToday };
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
      // Search theo tên dịch vụ, username khách hàng hoặc thông tin chi nhánh.
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
        {
          branch: {
            name: {
              contains: query.search,
            },
          },
        },
        {
          branch: {
            district: {
              contains: query.search,
            },
          },
        },
        {
          branch: {
            city: {
              contains: query.search,
            },
          },
        },
      ];
    }

    return where;
  }

  buildRevenueWhere(query = {}) {
    // Revenue page chỉ lấy các lịch đã hoàn thành và đã được xác nhận thu tiền.
    const where = {
      status: "COMPLETED",
      paymentStatus: "PAID",
      paymentConfirmedAt: {
        not: null,
      },
    };
    const search = String(query.search || "").trim();
    const branchId = String(query.branchId || "").trim();

    if (query.from) {
      const from = new Date(query.from);
      if (!Number.isNaN(from.getTime())) {
        from.setHours(0, 0, 0, 0);
        where.paymentConfirmedAt.gte = from;
      }
    }

    if (query.to) {
      const to = new Date(query.to);
      if (!Number.isNaN(to.getTime())) {
        to.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() + 1);
        where.paymentConfirmedAt.lt = to;
      }
    }

    if (branchId) {
      where.branchId = branchService.normalizeBranchId(branchId);
    }

    if (search) {
      // Cho phép admin tìm theo khách hàng, dịch vụ hoặc thông tin chi nhánh trong báo cáo doanh thu.
      where.OR = [
        {
          serviceName: {
            contains: search,
          },
        },
        {
          user: {
            username: {
              contains: search,
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
            },
          },
        },
        {
          branch: {
            name: {
              contains: search,
            },
          },
        },
        {
          branch: {
            district: {
              contains: search,
            },
          },
        },
        {
          branch: {
            city: {
              contains: search,
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
      paymentMethod: appointment.paymentMethod,
      paymentStatus: appointment.paymentStatus,
      paymentConfirmedAt: appointment.paymentConfirmedAt,
      branch: appointment.branch
        ? {
            id: appointment.branch.id,
            name: appointment.branch.name,
            city: appointment.branch.city,
            district: appointment.branch.district,
            address: appointment.branch.address,
          }
        : null,
    };
  }

  normalizeAppointmentPaymentMethod(paymentMethod) {
    const normalizedPaymentMethod = String(paymentMethod || "COD")
      .trim()
      .toUpperCase();

    if (!["COD", "BANK_TRANSFER"].includes(normalizedPaymentMethod)) {
      throw new Error("Phương thức thanh toán không hợp lệ");
    }

    return normalizedPaymentMethod;
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

    // Dashboard hôm nay cộng cả lịch hẹn và đơn hàng đã được xác nhận thu tiền trong ngày.
    const [appointmentRevenueResult, orderRevenueResult] = await Promise.all([
      prisma.appointment.aggregate({
        where: {
          paymentConfirmedAt: {
            gte: startOfToday,
            lt: endOfToday,
          },
          status: "COMPLETED",
          paymentStatus: "PAID",
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          paymentConfirmedAt: {
            gte: startOfToday,
            lt: endOfToday,
          },
          paymentStatus: "PAID",
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    return (
      Number(appointmentRevenueResult._sum.amount || 0) +
      Number(orderRevenueResult._sum.total || 0)
    );
  }

  async getWeeklyRevenue() {
    const { startOfRange } = this.getRecentDaysRange(7);

    // Biểu đồ dashboard gộp doanh thu đã thu thật từ lịch hẹn và đơn hàng trong 7 ngày gần nhất.
    const [paidAppointments, paidOrders] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          status: "COMPLETED",
          paymentStatus: "PAID",
          paymentConfirmedAt: {
            not: null,
            gte: startOfRange,
          },
        },
        select: {
          amount: true,
          paymentConfirmedAt: true,
        },
        orderBy: {
          paymentConfirmedAt: "asc",
        },
      }),
      prisma.order.findMany({
        where: {
          paymentStatus: "PAID",
          paymentConfirmedAt: {
            not: null,
            gte: startOfRange,
          },
        },
        select: {
          total: true,
          paymentConfirmedAt: true,
        },
        orderBy: {
          paymentConfirmedAt: "asc",
        },
      }),
    ]);

    const dailyRevenueMap = new Map();

    for (let index = 0; index < 7; index += 1) {
      const currentDate = new Date(startOfRange);
      currentDate.setDate(startOfRange.getDate() + index);
      const key = this.buildDateKey(currentDate);

      dailyRevenueMap.set(key, {
        date: key,
        label: currentDate.toLocaleDateString("vi-VN", {
          weekday: "short",
        }),
        fullLabel: currentDate.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        revenue: 0,
      });
    }

    [...paidAppointments, ...paidOrders].forEach((item) => {
      if (!item.paymentConfirmedAt) {
        return;
      }

      const key = this.buildDateKey(item.paymentConfirmedAt);
      const currentDay = dailyRevenueMap.get(key);
      if (!currentDay) {
        return;
      }

      currentDay.revenue += Number(item.amount || item.total || 0);
    });

    const items = Array.from(dailyRevenueMap.values());
    const maxRevenue = items.reduce(
      (highestRevenue, item) => Math.max(highestRevenue, item.revenue),
      0,
    );

    return {
      items,
      summary: {
        totalRevenue: items.reduce((total, item) => total + item.revenue, 0),
        maxRevenue,
      },
    };
  }

  async getRevenue(query = {}) {
    // Revenue manager dùng filter theo ngày xác nhận thanh toán để phản ánh toàn bộ tiền đã thu thật.
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 8, 1), 100);
    const skip = (page - 1) * limit;
    const where = this.buildRevenueWhere(query);
    const orderWhere = {
      paymentStatus: "PAID",
      paymentConfirmedAt: {
        not: null,
      },
    };
    const search = String(query.search || "").trim();
    const branchId = String(query.branchId || "").trim();
    const includeOrders = !branchId;

    if (where.paymentConfirmedAt?.gte) {
      orderWhere.paymentConfirmedAt.gte = where.paymentConfirmedAt.gte;
    }

    if (where.paymentConfirmedAt?.lt) {
      orderWhere.paymentConfirmedAt.lt = where.paymentConfirmedAt.lt;
    }

    if (includeOrders && search) {
      orderWhere.OR = [
        {
          orderCode: {
            contains: search,
          },
        },
        {
          customerName: {
            contains: search,
          },
        },
        {
          customerEmail: {
            contains: search,
          },
        },
        {
          customerPhone: {
            contains: search,
          },
        },
      ];
    }

    const [appointments, appointmentsCount, appointmentsSummary, paidOrders, ordersCount, ordersSummary] =
      await Promise.all([
        prisma.appointment.findMany({
          where,
          orderBy: [
            {
              paymentConfirmedAt: "desc",
            },
            {
              id: "desc",
            },
          ],
          select: {
            id: true,
            serviceName: true,
            appointmentAt: true,
            amount: true,
            status: true,
            paymentMethod: true,
            paymentStatus: true,
            paymentConfirmedAt: true,
            user: {
              select: {
                username: true,
                email: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
                city: true,
                district: true,
                address: true,
              },
            },
          },
        }),
        prisma.appointment.count({ where }),
        prisma.appointment.aggregate({
          where,
          _count: {
            id: true,
          },
          _sum: {
            amount: true,
          },
        }),
        includeOrders
          ? prisma.order.findMany({
              where: orderWhere,
              orderBy: [
                {
                  paymentConfirmedAt: "desc",
                },
                {
                  id: "desc",
                },
              ],
              select: {
                id: true,
                orderCode: true,
                customerName: true,
                customerEmail: true,
                paymentMethod: true,
                paymentConfirmedAt: true,
                total: true,
                createdAt: true,
              },
            })
          : Promise.resolve([]),
        includeOrders
          ? prisma.order.count({ where: orderWhere })
          : Promise.resolve(0),
        includeOrders
          ? prisma.order.aggregate({
              where: orderWhere,
              _count: {
                id: true,
              },
              _sum: {
                total: true,
              },
            })
          : Promise.resolve({ _count: { id: 0 }, _sum: { total: 0 } }),
      ]);

    const [cashAggregate, bankTransferAggregate, orderCashAggregate, orderBankTransferAggregate] =
      await Promise.all([
        prisma.appointment.aggregate({
          where: {
            ...where,
            paymentMethod: "COD",
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.appointment.aggregate({
          where: {
            ...where,
            paymentMethod: "BANK_TRANSFER",
          },
          _sum: {
            amount: true,
          },
        }),
        includeOrders
          ? prisma.order.aggregate({
              where: {
                ...orderWhere,
                paymentMethod: "COD",
              },
              _sum: {
                total: true,
              },
            })
          : Promise.resolve({ _sum: { total: 0 } }),
        includeOrders
          ? prisma.order.aggregate({
              where: {
                ...orderWhere,
                paymentMethod: "BANK_TRANSFER",
              },
              _sum: {
                total: true,
              },
            })
          : Promise.resolve({ _sum: { total: 0 } }),
      ]);

    const appointmentItems = appointments.map((item) =>
      this.buildRevenueRecord({
        id: item.id,
        source: "APPOINTMENT",
        customerName: item.user?.username || "Khách lẻ",
        customerEmail: item.user?.email || null,
        branch: item.branch
          ? {
              id: item.branch.id,
              name: item.branch.name,
              city: item.branch.city,
              district: item.branch.district,
              address: item.branch.address,
            }
          : null,
        serviceName: item.serviceName,
        appointmentTime: item.appointmentAt,
        paymentConfirmedAt: item.paymentConfirmedAt,
        paymentMethod: item.paymentMethod,
        amount: item.amount,
      }),
    );
    const orderItems = paidOrders.map((item) =>
      this.buildRevenueRecord({
        id: item.orderCode,
        source: "ORDER",
        customerName: item.customerName,
        customerEmail: item.customerEmail,
        branch: null,
        serviceName: `Đơn hàng ${item.orderCode}`,
        appointmentTime: item.createdAt,
        paymentConfirmedAt: item.paymentConfirmedAt,
        paymentMethod: item.paymentMethod,
        amount: item.total,
      }),
    );
    const combinedItems = [...appointmentItems, ...orderItems]
      .sort((firstItem, secondItem) => {
        const firstTime = new Date(firstItem.paymentConfirmedAt || 0).getTime();
        const secondTime = new Date(secondItem.paymentConfirmedAt || 0).getTime();

        if (firstTime !== secondTime) {
          return secondTime - firstTime;
        }

        return String(secondItem.id).localeCompare(String(firstItem.id));
      })
      .slice(skip, skip + limit);

    const totalRevenue =
      Number(appointmentsSummary._sum.amount || 0) +
      Number(ordersSummary._sum.total || 0);
    const totalRevenueItems =
      Number(appointmentsSummary._count.id || 0) + Number(ordersSummary._count.id || 0);

    return {
      items: combinedItems,
      pagination: {
        page,
        limit,
        total: appointmentsCount + ordersCount,
        totalPages: Math.ceil((appointmentsCount + ordersCount) / limit) || 1,
      },
      summary: {
        totalRevenue,
        totalPaidAppointments: totalRevenueItems,
        averageRevenuePerAppointment:
          totalRevenueItems > 0 ? totalRevenue / totalRevenueItems : 0,
        cashRevenue:
          Number(cashAggregate._sum.amount || 0) +
          Number(orderCashAggregate._sum.total || 0),
        bankTransferRevenue:
          Number(bankTransferAggregate._sum.amount || 0) +
          Number(orderBankTransferAggregate._sum.total || 0),
      },
    };
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
        paymentMethod: true,
        paymentStatus: true,
        paymentConfirmedAt: true,
        user: {
          select: {
            username: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true,
            address: true,
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
          paymentMethod: true,
          paymentStatus: true,
          paymentConfirmedAt: true,
          user: {
            select: {
              username: true,
              email: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              city: true,
              district: true,
              address: true,
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
        paymentMethod: true,
        paymentStatus: true,
        paymentConfirmedAt: true,
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
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true,
            address: true,
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
      branch: appointment.branch
        ? {
            id: appointment.branch.id,
            name: appointment.branch.name,
            city: appointment.branch.city,
            district: appointment.branch.district,
            address: appointment.branch.address,
          }
        : null,
      serviceName: appointment.serviceName,
      appointmentTime: appointment.appointmentAt,
      amount: Number(appointment.amount || 0),
      status: appointment.status,
      paymentMethod: appointment.paymentMethod,
      paymentStatus: appointment.paymentStatus,
      paymentConfirmedAt: appointment.paymentConfirmedAt,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }

  async createAppointment(payload = {}) {
    const { userId, branchId, serviceName, appointmentAt, amount } = payload;

    // Validate các field bắt buộc trước khi tạo lịch hẹn từ admin.
    if (!userId || !branchId || !serviceName || !appointmentAt || amount == null) {
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

    const branch = await branchService.getActiveBranchByIdOrThrow(branchId);

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
        branchId: branch.id,
        serviceName,
        appointmentAt: appointmentDate,
        amount: normalizedAmount,
        // Lịch hẹn mới mặc định chờ thu tiền tại quầy cho đến khi admin/cashier xác nhận.
        paymentMethod: "COD",
        paymentStatus: "PENDING",
      },
      select: {
        id: true,
        serviceName: true,
        appointmentAt: true,
        amount: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        paymentConfirmedAt: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true,
            address: true,
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
      branchName: appointment.branch?.name || null,
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
        paymentMethod: true,
        paymentStatus: true,
        paymentConfirmedAt: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true,
            address: true,
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
        paymentMethod: true,
        paymentStatus: true,
        paymentConfirmedAt: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true,
            address: true,
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

  async confirmAppointmentPayment(appointmentId, payload = {}) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        serviceName: true,
        appointmentAt: true,
        amount: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        paymentConfirmedAt: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true,
            address: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new Error("Không tìm thấy lịch hẹn");
    }

    if (appointment.status === "CANCELED") {
      throw new Error("Không thể xác nhận thanh toán cho lịch đã hủy");
    }

    // Chỉ ghi nhận đã thu tiền sau khi dịch vụ đã hoàn tất để doanh thu không bị cộng sớm.
    if (appointment.status !== "COMPLETED") {
      throw new Error("Chỉ có thể xác nhận thanh toán khi lịch hẹn đã hoàn thành");
    }

    if (appointment.paymentStatus === "PAID") {
      throw new Error("Lịch hẹn này đã được thanh toán trước đó");
    }

    // Cashier/admin xác nhận tiền mặt hoặc chuyển khoản tại quầy bằng thao tác thủ công.
    const paymentMethod = this.normalizeAppointmentPaymentMethod(
      payload.paymentMethod || appointment.paymentMethod,
    );

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentMethod,
        paymentStatus: "PAID",
        paymentConfirmedAt: new Date(),
      },
      select: {
        id: true,
        serviceName: true,
        appointmentAt: true,
        amount: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        paymentConfirmedAt: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true,
            address: true,
          },
        },
      },
    });

    return this.mapAppointmentSummary(updatedAppointment);
  }

}

module.exports = new AdminService();
