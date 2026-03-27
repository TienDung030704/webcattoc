import http from "@/utils/http";

export const createOrder = async (payload) => {
  // Tách riêng service đặt hàng để PaymentPage không phải gọi http trực tiếp quá nhiều chi tiết.
  const response = await http.post("user/orders", payload);
  return response.data;
};

export const createMomoOrderPayment = async (payload) => {
  // Checkout MoMo đi qua API riêng để backend tách hẳn flow provider khỏi user order thường.
  const response = await http.post("momo/orders", payload);
  return response.data;
};

export const getMomoOrderStatus = async (orderId) => {
  const response = await http.get(`momo/orders/${orderId}/status`);
  return response.data;
};

export const recreateMomoOrderPayment = async (orderId) => {
  const response = await http.post(`momo/orders/${orderId}/recreate`);
  return response.data;
};

export const cancelMomoOrderPayment = async (orderId) => {
  const response = await http.post(`momo/orders/${orderId}/cancel`);
  return response.data;
};
