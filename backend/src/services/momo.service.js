const crypto = require("crypto");
const https = require("https");

const prisma = require("@/libs/prisma");
const momoConfig = require("@/config/momo");
const orderService = require("@/services/order.service");

class MomoService {
  getProviderName() {
    return "MOMO";
  }

  ensureConfigReady() {
    const requiredFields = [
      ["MOMO_PARTNER_CODE", momoConfig.partnerCode],
      ["MOMO_ACCESS_KEY", momoConfig.accessKey],
      ["MOMO_SECRET_KEY", momoConfig.secretKey],
      ["MOMO_ENDPOINT", momoConfig.endpoint],
      ["MOMO_FRONTEND_RETURN_URL", momoConfig.frontendReturnUrl],
      ["MOMO_RETURN_URL", momoConfig.returnUrl],
      ["MOMO_IPN_URL", momoConfig.ipnUrl],
    ];

    const missingFields = requiredFields
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new Error(`Thiếu cấu hình MoMo: ${missingFields.join(", ")}`);
    }
  }

  normalizeOrderId(value) {
    if (value == null || String(value).trim() === "") {
      throw new Error("Id đơn hàng không hợp lệ");
    }

    const normalizedValue = String(value).trim();
    if (!/^\d+$/.test(normalizedValue)) {
      throw new Error("Id đơn hàng không hợp lệ");
    }

    return BigInt(normalizedValue);
  }

  parseProviderResultCode(value) {
    if (value == null || value === "") {
      return null;
    }

    const normalizedValue = Number(value);
    if (!Number.isInteger(normalizedValue)) {
      return null;
    }

    return normalizedValue;
  }

  toAmountNumber(value) {
    const normalizedValue = Number(value);

    if (!Number.isFinite(normalizedValue) || normalizedValue < 0) {
      throw new Error("Số tiền không hợp lệ");
    }

    return normalizedValue;
  }

  toMomoAmount(value) {
    const amount = this.toAmountNumber(value);
    // MoMo API yêu cầu amount là integer (Long), không phải string.
    return Math.round(amount);
  }

  buildExpiryDate() {
    return new Date(Date.now() + momoConfig.paymentExpireMinutes * 60 * 1000);
  }

  buildRequestId(orderCode) {
    return `${this.getProviderName()}_${orderCode}_${Date.now()}`;
  }

  buildOrderInfo(order) {
    return `${momoConfig.orderInfoPrefix} ${order.orderCode}`;
  }

  buildCreateSignatureData(payload) {
    return [
      `accessKey=${momoConfig.accessKey}`,
      `amount=${payload.amount}`,
      `extraData=${payload.extraData}`,
      `ipnUrl=${payload.ipnUrl}`,
      `orderId=${payload.orderId}`,
      `orderInfo=${payload.orderInfo}`,
      `partnerCode=${payload.partnerCode}`,
      `redirectUrl=${payload.redirectUrl}`,
      `requestId=${payload.requestId}`,
      `requestType=${payload.requestType}`,
    ].join("&");
  }

  buildResultSignatureData(payload) {
    return [
      `accessKey=${momoConfig.accessKey}`,
      `amount=${payload.amount ?? ""}`,
      `extraData=${payload.extraData ?? ""}`,
      `message=${payload.message ?? ""}`,
      `orderId=${payload.orderId ?? ""}`,
      `orderInfo=${payload.orderInfo ?? ""}`,
      `orderType=${payload.orderType ?? ""}`,
      `partnerCode=${payload.partnerCode ?? ""}`,
      `payType=${payload.payType ?? ""}`,
      `requestId=${payload.requestId ?? ""}`,
      `responseTime=${payload.responseTime ?? ""}`,
      `resultCode=${payload.resultCode ?? ""}`,
      `transId=${payload.transId ?? ""}`,
    ].join("&");
  }

  signData(rawSignature) {
    return crypto
      .createHmac("sha256", momoConfig.secretKey)
      .update(rawSignature)
      .digest("hex");
  }

  verifyResultSignature(payload) {
    const signature = String(payload?.signature || "").trim();
    if (!signature) {
      throw new Error("Thiếu chữ ký MoMo");
    }

    const rawSignature = this.buildResultSignatureData(payload);
    const expectedSignature = this.signData(rawSignature);

    if (signature !== expectedSignature) {
      throw new Error("Chữ ký MoMo không hợp lệ");
    }
  }

  async sendCreatePaymentRequest(requestBody) {
    const endpointUrl = new URL(momoConfig.endpoint);

    return await new Promise((resolve, reject) => {
      const req = https.request(
        {
          protocol: endpointUrl.protocol,
          hostname: endpointUrl.hostname,
          port: endpointUrl.port || 443,
          path: `${endpointUrl.pathname}${endpointUrl.search}`,
          method: "POST",
          timeout: momoConfig.requestTimeoutMs,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(requestBody),
          },
        },
        (res) => {
          let rawBody = "";

          res.setEncoding("utf8");
          res.on("data", (chunk) => {
            rawBody += chunk;
          });
          res.on("end", () => {
            try {
              const parsedBody = rawBody ? JSON.parse(rawBody) : {};

              if (res.statusCode && res.statusCode >= 400) {
                const message =
                  parsedBody?.message || "Không thể tạo phiên thanh toán MoMo";
                const error = new Error(message);
                error.response = parsedBody;
                error.statusCode = res.statusCode;
                reject(error);
                return;
              }

              resolve(parsedBody);
            } catch {
              reject(new Error("Phản hồi MoMo không hợp lệ"));
            }
          });
        },
      );

      req.on("timeout", () => {
        req.destroy(new Error("Yêu cầu MoMo quá thời gian chờ"));
      });
      req.on("error", reject);
      req.write(requestBody);
      req.end();
    });
  }

  async getUserOrderOrThrow(userId, orderId, options = {}) {
    const normalizedOrderId = this.normalizeOrderId(orderId);
    const order = await orderService.getOrderByIdOrThrow(normalizedOrderId, {
      paymentTransactions: true,
      ...options,
    });

    if (order.userId.toString() !== userId.toString()) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    return order;
  }

  async getLatestMomoTransaction(orderId, executor = prisma) {
    return await executor.paymentTransaction.findFirst({
      where: {
        orderId,
        provider: this.getProviderName(),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  buildPaymentSessionFromResponse(response, expiresAt) {
    return {
      status: "PENDING",
      resultCode: this.parseProviderResultCode(response?.resultCode),
      message: response?.message || null,
      payUrl: response?.payUrl || null,
      deeplink: response?.deeplink || response?.deeplinkMiniApp || null,
      qrCodeUrl: response?.qrCodeUrl || null,
      expiresAt,
      confirmedAt: null,
      rawCreateResponse: response,
    };
  }

  ensureCreatePaymentSessionReady(response) {
    const resultCode = this.parseProviderResultCode(response?.resultCode);
    const hasPaymentLink = Boolean(response?.payUrl || response?.qrCodeUrl);

    // Nếu MoMo không trả về payUrl/qrCodeUrl hợp lệ thì không được coi là đã tạo session thành công.
    if (resultCode !== 0 || !hasPaymentLink) {
      throw new Error(
        response?.message || "MoMo không trả về phiên thanh toán hợp lệ",
      );
    }
  }

  async createOrderPayment(userId, payload = {}) {
    this.ensureConfigReady();

    const expiresAt = this.buildExpiryDate();
    const orderSnapshot = await orderService.createOrder(userId, payload, {
      allowedPaymentMethods: [this.getProviderName()],
      paymentExpiresAt: expiresAt,
    });

    const amount = this.toMomoAmount(orderSnapshot.total);
    const requestId = this.buildRequestId(orderSnapshot.orderCode);
    // MoMo yêu cầu orderId phải unique tuyệt đối mỗi request - dùng requestId (đã có timestamp) để đảm bảo.
    const createPayload = {
      partnerCode: momoConfig.partnerCode,
      partnerName: momoConfig.partnerName,
      storeId: momoConfig.storeId,
      requestId,
      amount,
      orderId: requestId,
      orderInfo: this.buildOrderInfo(orderSnapshot),
      redirectUrl: momoConfig.returnUrl,
      ipnUrl: momoConfig.ipnUrl,
      lang: "vi",
      requestType: momoConfig.requestType,
      autoCapture: true,
      extraData: "",
      orderGroupId: "",
    };

    const rawSignature = this.buildCreateSignatureData(createPayload);
    const signature = this.signData(rawSignature);
    const requestBody = JSON.stringify({
      ...createPayload,
      signature,
    });

    try {
      const response = await this.sendCreatePaymentRequest(requestBody);
      this.ensureCreatePaymentSessionReady(response);
      const paymentSession = this.buildPaymentSessionFromResponse(
        response,
        expiresAt,
      );

      const updatedOrder = await prisma.order.update({
        where: {
          id: BigInt(orderSnapshot.id),
        },
        data: {
          paymentTransactions: {
            create: {
              provider: this.getProviderName(),
              requestId,
              providerOrderId: createPayload.orderId,
              status: paymentSession.status,
              resultCode: paymentSession.resultCode,
              message: paymentSession.message,
              payUrl: paymentSession.payUrl,
              deeplink: paymentSession.deeplink,
              qrCodeUrl: paymentSession.qrCodeUrl,
              expiresAt: paymentSession.expiresAt,
              rawCreateResponse: paymentSession.rawCreateResponse,
            },
          },
        },
        include: orderService.getOrderInclude({
          paymentTransactions: true,
        }),
      });

      return orderService.mapOrder(updatedOrder);
    } catch (error) {
      await orderService.cancelPendingOrder(BigInt(orderSnapshot.id), {
        paymentStatus: "FAILED",
      });
      throw error;
    }
  }

  async expireOrderIfNeeded(order) {
    if (
      order.paymentStatus !== "PENDING" ||
      !order.paymentExpiresAt ||
      order.status === "CANCELED"
    ) {
      return order;
    }

    if (new Date(order.paymentExpiresAt).getTime() > Date.now()) {
      return order;
    }

    const expiredOrder = await orderService.expirePendingOrder(order.id);
    return await orderService.getOrderByIdOrThrow(expiredOrder.id, {
      paymentTransactions: true,
    });
  }

  async getOrderPaymentStatus(userId, orderId) {
    const order = await this.getUserOrderOrThrow(userId, orderId);
    const refreshedOrder = await this.expireOrderIfNeeded(order);
    return orderService.mapOrder(refreshedOrder);
  }

  async recreateOrderPayment(userId, orderId) {
    this.ensureConfigReady();

    const currentOrder = await this.getUserOrderOrThrow(userId, orderId);
    const refreshedOrder = await this.expireOrderIfNeeded(currentOrder);

    if (refreshedOrder.paymentMethod !== this.getProviderName()) {
      throw new Error("Đơn hàng này không sử dụng thanh toán MoMo");
    }

    if (refreshedOrder.paymentStatus === "PAID") {
      throw new Error("Đơn hàng này đã được thanh toán");
    }

    if (refreshedOrder.status === "CANCELED") {
      throw new Error("Không thể tạo lại phiên thanh toán cho đơn đã hủy");
    }

    const expiresAt = this.buildExpiryDate();
    const requestId = this.buildRequestId(refreshedOrder.orderCode);
    // MoMo yêu cầu orderId unique tuyệt đối - KHÔNG được tái dùng orderCode cũ đã từng gửi.
    const createPayload = {
      partnerCode: momoConfig.partnerCode,
      partnerName: momoConfig.partnerName,
      storeId: momoConfig.storeId,
      requestId,
      amount: this.toMomoAmount(refreshedOrder.total),
      orderId: requestId,
      orderInfo: this.buildOrderInfo(refreshedOrder),
      redirectUrl: momoConfig.returnUrl,
      ipnUrl: momoConfig.ipnUrl,
      lang: "vi",
      requestType: momoConfig.requestType,
      autoCapture: true,
      extraData: "",
      orderGroupId: "",
    };

    const rawSignature = this.buildCreateSignatureData(createPayload);
    const requestBody = JSON.stringify({
      ...createPayload,
      signature: this.signData(rawSignature),
    });
    const response = await this.sendCreatePaymentRequest(requestBody);
    this.ensureCreatePaymentSessionReady(response);
    const paymentSession = this.buildPaymentSessionFromResponse(
      response,
      expiresAt,
    );

    const updatedOrder = await prisma.order.update({
      where: {
        id: refreshedOrder.id,
      },
      data: {
        paymentStatus: "PENDING",
        paymentConfirmedAt: null,
        paymentExpiresAt: expiresAt,
        paymentTransactions: {
          create: {
            provider: this.getProviderName(),
            requestId,
            providerOrderId: createPayload.orderId,
            status: paymentSession.status,
            resultCode: paymentSession.resultCode,
            message: paymentSession.message,
            payUrl: paymentSession.payUrl,
            deeplink: paymentSession.deeplink,
            qrCodeUrl: paymentSession.qrCodeUrl,
            expiresAt: paymentSession.expiresAt,
            rawCreateResponse: paymentSession.rawCreateResponse,
          },
        },
      },
      include: orderService.getOrderInclude({
        paymentTransactions: true,
      }),
    });

    return orderService.mapOrder(updatedOrder);
  }

  async cancelPendingOrder(userId, orderId) {
    const order = await this.getUserOrderOrThrow(userId, orderId);

    if (order.paymentMethod !== this.getProviderName()) {
      throw new Error("Đơn hàng này không sử dụng thanh toán MoMo");
    }

    const canceledOrder = await orderService.cancelPendingOrder(order.id, {
      paymentStatus: "FAILED",
    });

    return orderService.mapOrder(canceledOrder);
  }

  async handleReturn(query = {}) {
    this.ensureConfigReady();
    this.verifyResultSignature(query);

    const providerOrderId = String(query.orderId || "").trim();
    if (!providerOrderId) {
      throw new Error("Thiếu mã đơn hàng MoMo");
    }

    // orderId MoMo nhận về là requestId (unique per session), tìm order qua paymentTransaction.
    const returnTxn = await prisma.paymentTransaction.findFirst({
      where: {
        providerOrderId,
        provider: this.getProviderName(),
      },
    });

    if (!returnTxn) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    const order = await prisma.order.findUnique({
      where: { id: returnTxn.orderId },
      include: orderService.getOrderInclude({
        paymentTransactions: true,
      }),
    });

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    const refreshedOrder = await this.expireOrderIfNeeded(order);

    const resultCode = this.parseProviderResultCode(query.resultCode);

    return {
      redirectUrl: `${momoConfig.frontendReturnUrl}?orderId=${encodeURIComponent(
        refreshedOrder.id.toString(),
      )}&resultCode=${encodeURIComponent(String(resultCode ?? ""))}`,
      order: orderService.mapOrder(refreshedOrder),
      resultCode,
      message: query.message || null,
      requestId: query.requestId || null,
      orderId: providerOrderId,
      transId: query.transId || null,
    };
  }

  buildIpnAck(resultCode = 0, message = "Success") {
    return {
      resultCode,
      message,
    };
  }

  async handleIpn(payload = {}) {
    this.ensureConfigReady();
    this.verifyResultSignature(payload);

    if (String(payload.partnerCode || "").trim() !== momoConfig.partnerCode) {
      throw new Error("PartnerCode MoMo không hợp lệ");
    }

    const providerOrderId = String(payload.orderId || "").trim();
    const requestId = String(payload.requestId || "").trim();

    if (!providerOrderId || !requestId) {
      throw new Error("Thiếu dữ liệu xác nhận MoMo");
    }

    // orderId MoMo echo về là requestId - tìm transaction trực tiếp, rồi lấy order từ đó.
    const latestTransaction = await prisma.paymentTransaction.findUnique({
      where: { requestId },
    });

    if (
      !latestTransaction ||
      latestTransaction.providerOrderId !== providerOrderId
    ) {
      throw new Error("Không tìm thấy phiên thanh toán MoMo");
    }

    const order = await prisma.order.findUnique({
      where: { id: latestTransaction.orderId },
      include: orderService.getOrderInclude({
        paymentTransactions: true,
      }),
    });

    if (!order || order.paymentMethod !== this.getProviderName()) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    const amount = this.toAmountNumber(payload.amount);
    if (Math.round(amount) !== Math.round(Number(order.total || 0))) {
      throw new Error("Số tiền MoMo không khớp với đơn hàng");
    }

    const resultCode = this.parseProviderResultCode(payload.resultCode);
    const isPaid = resultCode === 0;

    await prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.update({
        where: {
          id: latestTransaction.id,
        },
        data: {
          transId: payload.transId ? String(payload.transId) : null,
          status: isPaid ? "PAID" : "FAILED",
          resultCode,
          message: payload.message || null,
          confirmedAt: isPaid ? new Date() : null,
          rawIpnPayload: payload,
        },
      });

      if (isPaid) {
        await orderService.markOrderPaid(order.id, {
          executor: tx,
          paymentMethod: this.getProviderName(),
          paymentConfirmedAt: new Date(),
        });
        return;
      }

      const currentOrder = await orderService.getOrderByIdOrThrow(order.id, {
        executor: tx,
        paymentTransactions: true,
      });

      if (currentOrder.paymentStatus === "PAID") {
        return;
      }

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: "FAILED",
        },
      });
    });

    const updatedOrder = await orderService.getOrderByIdOrThrow(order.id, {
      paymentTransactions: true,
    });

    return {
      ack: this.buildIpnAck(),
      order: orderService.mapOrder(updatedOrder),
    };
  }
}

module.exports = new MomoService();
