import http from "@/utils/http";

export const createOrder = async (payload) => {
  // Tách riêng service đặt hàng để PaymentPage không phải gọi http trực tiếp quá nhiều chi tiết.
  const response = await http.post("user/orders", payload);
  return response.data;
};
