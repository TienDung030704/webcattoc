import { createAsyncThunk } from "@reduxjs/toolkit";
import http from "@/utils/http";

export const authUserService = createAsyncThunk(
  "auth/authUserService",
  async () => {
    const response = await http.get("auth/me");
    return response.data;
  }
);
