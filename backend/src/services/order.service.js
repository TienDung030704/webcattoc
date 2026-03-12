const prisma = require("@/libs/prisma");
const notificationService = require("@/services/notification.service");

const BANK_ACCOUNT_NAME = "NGUYEN TIEN DUNG";
const BANK_ACCOUNT_NUMBER = "9869271243";
const BANK_NAME = "VIETCOMBANK";
const BANK_QR_IMAGE = "/bank.png";

class OrderService {
  normalizeText(value, fieldLabel, { required = false, maxLength } = {}) {
    if (value == null) {
      if (required) {
        throw new Error(`${fieldLabel} không hợp lệ`);
      }

      return null;
    }

    if (typeof value !== "string") {
      throw new Error(`${fieldLabel} không hợp lệ`);
    }

    const normalizedValue = value.trim();
    if (!normalizedValue) {
      if (required) {
        throw new Error(`${fieldLabel} không hợp lệ`);
      }

      return null;
    }

    if (maxLength && normalizedValue.length > maxLength) {
      throw new Error(`${fieldLabel} không hợp lệ`);
    }

    return normalizedValue;
  }

  normalizeEmail(value) {
    const normalizedEmail = this.normalizeText(value, "Email", {
      required: true,
      maxLength: 255,
    });

    if (!normalizedEmail.includes("@")) {
      throw new Error("Email không hợp lệ");
    }

    return normalizedEmail;
  }
  normalizeProductId(productId) {
    if (productId == null || String(productId).trim() === "") {
      throw new Error("Mã sản phẩm không hợp lệ");
    }

    const normalizedProductId = String(productId).trim();
    if (!/^\d+$/.test(normalizedProductId)) {
      throw new Error("Mã sản phẩm không hợp lệ");
    }

    return BigInt(normalizedProductId);
  }

  normalizeQuantity(value) {
    const normalizedQuantity = Number(value);
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
      throw new Error("Số lượng sản phẩm không hợp lệ");
    }

    return normalizedQuantity;
  }

  normalizePaymentMethod(value) {
    const normalizedValue = String(value || "")
      .trim()
      .toUpperCase();

    if (!["BANK_TRANSFER", "COD"].includes(normalizedValue)) {
      throw new Error("Phương thức thanh toán không hợp lệ");
    }

    return normalizedValue;
  }

  normalizeItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Danh sách sản phẩm không hợp lệ");
    }

    const itemsMap = new Map();

    for (const item of items) {
      const productId = this.normalizeProductId(item?.productId);
      const quantity = this.normalizeQuantity(item?.quantity);
      const itemKey = productId.toString();
      const currentQuantity = itemsMap.get(itemKey)?.quantity || 0;

      // Gộp sản phẩm trùng nhau để backend chỉ cần xử lý một dòng tồn kho cho mỗi product.
      itemsMap.set(itemKey, {
        productId,
        quantity: currentQuantity + quantity,
      });
    }

    return [...itemsMap.values()];
  }

  normalizeCustomer(customer = {}) {
    const source = customer && typeof customer === "object" ? customer : {};

    return {
      fullName: this.normalizeText(source.fullName, "Họ và tên", {
        required: true,
        maxLength: 255,
      }),
      phone: this.normalizeText(source.phone, "Số điện thoại", {
        required: true,
        maxLength: 30,
      }),
      email: this.normalizeEmail(source.email),
    };
  }

  normalizeShippingAddress(shippingAddress = {}) {
    const source =
      shippingAddress && typeof shippingAddress === "object"
        ? shippingAddress
        : {};

    return {
      city: this.normalizeText(source.city, "Tỉnh/thành phố", {
        required: true,
        maxLength: 255,
      }),
      district: this.normalizeText(source.district, "Quận/huyện", {
        required: true,
        maxLength: 255,
      }),
      ward: this.normalizeText(source.ward, "Xã/phường/thị trấn", {
        required: true,
        maxLength: 255,
      }),
      address: this.normalizeText(source.address, "Địa chỉ", {
        required: true,
        maxLength: 1000,
      }),
    };
  }

  buildCreateOrderPayload(payload = {}) {
    const source = payload && typeof payload === "object" ? payload : {};

    return {
      paymentMethod: this.normalizePaymentMethod(source.paymentMethod),
      items: this.normalizeItems(source.items),
      customer: this.normalizeCustomer(source.customer),
      shippingAddress: this.normalizeShippingAddress(source.shippingAddress),
      note: this.normalizeText(source.note, "Ghi chú", {
        maxLength: 1000,
      }),
    };
  }

  buildOrderCode() {
    return `MDT${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
  }

  getPaymentMethodLabel(paymentMethod) {
    return paymentMethod === "BANK_TRANSFER"
      ? "Chuyển khoản ngân hàng"
      : "Thanh toán khi nhận hàng";
  }

  buildBankInfo(order) {
    if (order.paymentMethod !== "BANK_TRANSFER") {
      return null;
    }

    return {
      accountName: BANK_ACCOUNT_NAME,
      accountNumber: BANK_ACCOUNT_NUMBER,
      bankName: BANK_NAME,
      transferContent: order.paymentReference,
      qrImage: BANK_QR_IMAGE,
    };
  }

  mapOrder(order) {
    return {
      id: order.id.toString(),
      orderCode: order.orderCode,
      createdAt: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentMethodLabel: this.getPaymentMethodLabel(order.paymentMethod),
      paymentConfirmedAt: order.paymentConfirmedAt,
      paymentReference: order.paymentReference,
      subtotal: Number(order.subtotal || 0),
      shippingFee: Number(order.shippingFee || 0),
      total: Number(order.total || 0),
      items: (order.items || []).map((item) => ({
        productId: item.productId.toString(),
        name: item.productName,
        imageUrl: item.productImageUrl,
        quantity: item.quantity,
        price: Number(item.unitPrice || 0),
        lineTotal: Number(item.lineTotal || 0),
      })),
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
      note: order.note,
      bankInfo: this.buildBankInfo(order),
    };
  }

  async createOrder(userId, payload = {}) {
    const normalizedPayload = this.buildCreateOrderPayload(payload);
    const touchedProductIds = normalizedPayload.items.map(
      (item) => item.productId,
    );
    let updatedOrder = null;

    // Dùng transaction để việc trừ tồn kho và tạo order luôn thành công hoặc rollback cùng nhau.
    updatedOrder = await prisma.$transaction(async (transaction) => {
      const products = await transaction.product.findMany({
        where: {
          id: {
            in: touchedProductIds,
          },
        },
      });

      if (products.length !== touchedProductIds.length) {
        throw new Error("Không tìm thấy sản phẩm");
      }

      const productsMap = new Map(
        products.map((product) => [product.id.toString(), product]),
      );

      const normalizedOrderItems = normalizedPayload.items.map((item) => {
        const product = productsMap.get(item.productId.toString());

        if (!product) {
          throw new Error("Không tìm thấy sản phẩm");
        }

        if (!product.isActive) {
          throw new Error("Sản phẩm hiện không khả dụng");
        }

        if (product.stock < item.quantity) {
          throw new Error(`Sản phẩm ${product.name} không đủ tồn kho`);
        }

        const unitPrice = Number(product.price || 0);
        return {
          productId: product.id,
          productName: product.name,
          productImageUrl: product.imageUrl,
          unitPrice,
          quantity: item.quantity,
          lineTotal: unitPrice * item.quantity,
        };
      });

      const sortedOrderItems = [...normalizedOrderItems].sort(
        (firstItem, secondItem) =>
          firstItem.productId
            .toString()
            .localeCompare(secondItem.productId.toString()),
      );

      for (const item of sortedOrderItems) {
        const updateResult = await transaction.product.updateMany({
          where: {
            id: item.productId,
            isActive: true,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updateResult.count === 0) {
          throw new Error(`Sản phẩm ${item.productName} không đủ tồn kho`);
        }
      }

      const subtotal = normalizedOrderItems.reduce(
        (currentTotal, item) => currentTotal + item.lineTotal,
        0,
      );
      const shippingFee = 0;
      const total = subtotal + shippingFee;
      const orderCode = this.buildOrderCode();
      const paymentReference =
        normalizedPayload.paymentMethod === "BANK_TRANSFER"
          ? `${orderCode} + ${normalizedPayload.customer.phone}`
          : null;

      return await transaction.order.create({
        data: {
          userId,
          orderCode,
          paymentMethod: normalizedPayload.paymentMethod,
          paymentStatus: "PENDING",
          status: "PENDING_CONFIRMATION",
          paymentReference,
          subtotal,
          shippingFee,
          total,
          customerName: normalizedPayload.customer.fullName,
          customerPhone: normalizedPayload.customer.phone,
          customerEmail: normalizedPayload.customer.email,
          shippingCity: normalizedPayload.shippingAddress.city,
          shippingDistrict: normalizedPayload.shippingAddress.district,
          shippingWard: normalizedPayload.shippingAddress.ward,
          shippingAddress: normalizedPayload.shippingAddress.address,
          note: normalizedPayload.note,
          items: {
            create: normalizedOrderItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productImageUrl: item.productImageUrl,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              lineTotal: item.lineTotal,
            })),
          },
        },
        include: {
          items: true,
        },
      });
    });

    // Sau khi transaction commit xong mới kiểm tra sản phẩm nào vừa về 0 để phát notification an toàn.
    const productsAtZero = await prisma.product.findMany({
      where: {
        id: {
          in: touchedProductIds,
        },
        stock: 0,
      },
    });

    await Promise.all(
      productsAtZero.map((product) =>
        notificationService.createProductOutOfStockNotification(product),
      ),
    );

    return this.mapOrder(updatedOrder);
  }
}

module.exports = new OrderService();
