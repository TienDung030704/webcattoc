const trimEnv = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const pickEnv = (...keys) => {
  // Hỗ trợ cả tên biến env chuẩn của project lẫn tên legacy theo mẫu code MoMo bên ngoài.
  for (const key of keys) {
    const value = trimEnv(process.env[key]);
    if (value) {
      return value;
    }
  }

  return "";
};

const backendUrl = pickEnv("BACKEND_URL") || "http://localhost:3000";
const frontendUrl = pickEnv("FRONTEND_URL") || "http://localhost:5173";

const momoConfig = {
  partnerCode: pickEnv("MOMO_PARTNER_CODE", "PARTNER_CODE", "partnerCode"),
  accessKey: pickEnv("MOMO_ACCESS_KEY", "ACCESS_KEY", "accessKey"),
  secretKey: pickEnv("MOMO_SECRET_KEY", "SECRET_KEY", "secretKey"),
  endpoint:
    pickEnv("MOMO_ENDPOINT", "MOMO_CREATE_ENDPOINT", "endpoint") ||
    "https://test-payment.momo.vn/v2/gateway/api/create",
  requestType: pickEnv("MOMO_REQUEST_TYPE", "REQUEST_TYPE", "requestType") || "payWithMethod",
  partnerName: pickEnv("MOMO_PARTNER_NAME", "PARTNER_NAME", "partnerName") || "WEBCATTOC",
  storeId: pickEnv("MOMO_STORE_ID", "STORE_ID", "storeId") || "WEBCATTOCStore",
  frontendReturnUrl:
    pickEnv("MOMO_FRONTEND_RETURN_URL") || `${frontendUrl}/payment/momo/return`,
  returnUrl:
    pickEnv("MOMO_RETURN_URL", "REDIRECT_URL", "redirectUrl") ||
    `${backendUrl}/api/momo/return`,
  ipnUrl:
    pickEnv("MOMO_IPN_URL", "IPN_URL", "ipnUrl") || `${backendUrl}/api/momo/ipn`,
  orderInfoPrefix:
    pickEnv("MOMO_ORDER_INFO_PREFIX", "ORDER_INFO", "orderInfo") || "Thanh toán đơn hàng",
  requestTimeoutMs: Math.max(Number(pickEnv("MOMO_REQUEST_TIMEOUT_MS")) || 15000, 1000),
  paymentExpireMinutes: Math.max(Number(pickEnv("MOMO_PAYMENT_EXPIRE_MINUTES")) || 15, 1),
};

module.exports = momoConfig;
