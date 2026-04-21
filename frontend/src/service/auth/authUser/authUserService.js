import { createAsyncThunk } from "@reduxjs/toolkit";
import http from "@/utils/http";

export const authUserService = createAsyncThunk(
  "auth/authUserService",
  async (_, { rejectWithValue }) => {
    try {
      const response = await http.get("auth/me");
      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: error?.response?.status || null,
        message: error?.response?.data?.error || error?.message || "Không thể lấy thông tin người dùng",
      });
    }
  }
);
