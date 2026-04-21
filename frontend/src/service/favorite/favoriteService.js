import { createAsyncThunk } from "@reduxjs/toolkit";

import http from "@/utils/http";

export const getFavorites = createAsyncThunk(
  "favorite/getFavorites",
  async (_, { rejectWithValue }) => {
    try {
      // Lấy toàn bộ favorites của user hiện tại để badge header và các màn khác dùng chung một nguồn dữ liệu.
      const response = await http.get("user/favorites");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "Không thể tải danh sách yêu thích.",
      );
    }
  },
);

export const getFavoriteStatus = createAsyncThunk(
  "favorite/getFavoriteStatus",
  async (productId, { rejectWithValue }) => {
    try {
      // Lấy trạng thái favorite cho 1 sản phẩm để ProductDetailPage render heart đúng theo account đang đăng nhập.
      const response = await http.get(`user/favorites/${productId}/status`);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        productId: String(productId || ""),
        message:
          error?.response?.data?.error ||
          "Không thể tải trạng thái yêu thích của sản phẩm.",
      });
    }
  },
);

export const addFavorite = createAsyncThunk(
  "favorite/addFavorite",
  async (productId, { rejectWithValue }) => {
    try {
      // Thêm 1 sản phẩm vào favorites của user hiện tại.
      const response = await http.post(`user/favorites/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "Không thể thêm sản phẩm vào yêu thích.",
      );
    }
  },
);

export const removeFavorite = createAsyncThunk(
  "favorite/removeFavorite",
  async (productId, { rejectWithValue }) => {
    try {
      // Bỏ 1 sản phẩm khỏi favorites của user hiện tại.
      const response = await http.del(`user/favorites/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || "Không thể bỏ sản phẩm khỏi yêu thích.",
      );
    }
  },
);
