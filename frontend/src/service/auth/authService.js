import { createAsyncThunk } from "@reduxjs/toolkit";
import http from "@/utils/http";

export const authRegister = createAsyncThunk(
  "auth/authRegister",
  async (data) => {
    const response = await http.post("auth/register", data);
    return response.data;
  },
);

export const authLogin = createAsyncThunk("auth/authLogin", async (data) => {
  const response = await http.post("auth/login", data);
  return response.data;
});
export const authRefreshToken = createAsyncThunk(
  "auth/authRefreshToken",
  async (refreshToken) => {
    const response = await http.post("auth/refresh-token", { refreshToken });
    return response.data;
  },
);

// Ham API goi Logout
export const authLogout = createAsyncThunk("auth/authLogout", async (data) => {
  const response = await http.post("auth/logout", data);
  return response.data;
});
