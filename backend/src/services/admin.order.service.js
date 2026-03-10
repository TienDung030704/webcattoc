const prisma = require("@/libs/prisma");

const ORDER_STATUSES = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "COMPLETED",
  "CANCELED",
];

const ORDER_STATUS_TRANSITIONS = {
  PENDING_CONFIRMATION: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["COMPLETED", "CANCELED"],
  COMPLETED: [],
  CANCELED: [],
};

class AdminOrderService {
  mapOrderListItem(order) {
    // Chuẩn hóa dữ liệu danh sách để frontend admin render bảng trực tiếp.
    return {
      id: order.id.toString(),
      orderCode: order.orderCode,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      total: Number(order.total || 0),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      itemsCount: Number(order._count?.items || 0),
    };
  }

  mapOrderDetail(order) {
    return {
      id: order.id.toString(),
      userId: order.userId.toString(),
      orderCode: order.orderCode,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference,
      subtotal: Number(order.subtotal || 0),
      shippingFee: Number(order.shippingFee || 0),
      total: Number(order.total || 0),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      note: order.note,
      customer: {
        fullName: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
      },
      shippingAddress: {
        city: order.shippingCity,
        district: order.shippingDistrict,
        ward: order.shippingWard,
        address: order.shippingAddress,
      },
      items: (order.items || []).map((item) => ({
        id: item.id.toString(),
        productId: item.productId.toString(),
        name: item.productName,
        imageUrl: item.productImageUrl,
        unitPrice: Number(item.unitPrice || 0),
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal || 0),
        createdAt: item.createdAt,
      })),
    };
  }

  buildOrderWhere(query = {}) {
    const where = {};
    const search = String(query.search || "").trim();
    const status = String(query.status || "").trim().toUpperCase();

    if (status) {
      if (!ORDER_STATUSES.includes(status)) {
        throw new Error("Trạng thái đơn hàng không hợp lệ");
      }

      where.status = status;
    }

    if (search) {
      const orConditions = [
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

      // Cho phép admin tìm nhanh theo id khi nhập chuỗi số.
      if (/^\d+$/.test(search)) {
        orConditions.push({
          id: BigInt(search),
        });
      }

      where.OR = orConditions;
    }

    return where;
  }

  normalizeStatus(status) {
    const normalizedStatus = String(status || "")
      .trim()
      .toUpperCase();

    if (!ORDER_STATUSES.includes(normalizedStatus)) {
      throw new Error("Trạng thái đơn hàng không hợp lệ");
    }

    return normalizedStatus;
  }

  async getOrderByIdOrThrow(orderId, executor = prisma) {
    const order = await executor.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    return order;
  }

  async getOrders(query = {}) {
    // Chuẩn hóa phân trang để table admin luôn có dữ liệu hợp lệ.
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 8, 1), 100);
    const skip = (page - 1) * limit;
    const where = this.buildOrderWhere(query);

    const [items, total, totalOrders, pendingOrders, confirmedOrders, completedOrders, canceledOrders] =
      await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            _count: {
              select: {
                items: true,
              },
            },
          },
          orderBy: [
            {
              createdAt: "desc",
            },
            {
              id: "desc",
            },
          ],
          skip,
          take: limit,
        }),
        prisma.order.count({ where }),
        prisma.order.count(),
        prisma.order.count({
          where: {
            status: "PENDING_CONFIRMATION",
          },
        }),
        prisma.order.count({
          where: {
            status: "CONFIRMED",
          },
        }),
        prisma.order.count({
          where: {
            status: "COMPLETED",
          },
        }),
        prisma.order.count({
          where: {
            status: "CANCELED",
          },
        }),
      ]);

    return {
      items: items.map((item) => this.mapOrderListItem(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalOrders,
        pendingConfirmationOrders: pendingOrders,
        confirmedOrders: confirmedOrders,
        completedOrders: completedOrders,
        canceledOrders: canceledOrders,
      },
    };
  }

  async getOrderDetail(orderId) {
    const order = await this.getOrderByIdOrThrow(orderId);
    return this.mapOrderDetail(order);
  }

  async updateOrderStatus(orderId, nextStatus) {
    const normalizedStatus = this.normalizeStatus(nextStatus);

    // Gói cập nhật trạng thái và hoàn stock trong cùng transaction để tránh lệch tồn kho.
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const currentOrder = await this.getOrderByIdOrThrow(orderId, tx);

      if (currentOrder.status === normalizedStatus) {
        return currentOrder;
      }

      const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[currentOrder.status] || [];
      if (!allowedNextStatuses.includes(normalizedStatus)) {
        throw new Error("Không thể cập nhật trạng thái đơn hàng theo luồng hiện tại");
      }

      if (normalizedStatus === "CANCELED") {
        const sortedItems = [...currentOrder.items].sort((firstItem, secondItem) =>
          firstItem.productId.toString().localeCompare(secondItem.productId.toString()),
        );

        for (const item of sortedItems) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: normalizedStatus,
        },
        include: {
          items: {
            orderBy: {
              id: "asc",
            },
          },
        },
      });
    });

    return this.mapOrderDetail(updatedOrder);
  }
}

module.exports = new AdminOrderService();
