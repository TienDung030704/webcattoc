import { createAsyncThunk } from "@reduxjs/toolkit";

import http from "@/utils/http";

export const getProducts = createAsyncThunk(
  "product/getProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Gọi API public danh sách sản phẩm để ProductPage và các nơi khác dùng chung cùng một flow Redux.
      const response = await http.get("user/products", {
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "Không thể tải danh sách sản phẩm lúc này.",
      );
    }
  },
);

export const getProductDetail = createAsyncThunk(
  "product/getProductDetail",
  async (productId, { rejectWithValue }) => {
    try {
      // Lấy chi tiết 1 sản phẩm public theo productId để ProductDetailPage chỉ đọc state từ Redux.
      const response = await http.get(`user/products/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "Không thể tải chi tiết sản phẩm lúc này.",
      );
    }
  },
);
