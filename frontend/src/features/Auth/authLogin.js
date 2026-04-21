import { createSlice } from "@reduxjs/toolkit";
import { authLogin } from "@/service/auth/authService";
const initialState = {
  loading: false,
  userInfo: null,
  success: false,
  error: null,
  userToken: null,
};
export const authLoginSlice = createSlice({
  name: "authLogin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(authLogin.pending, (state) => {
        state.error = null;
        state.success = false;
        state.loading = true;
      })
      .addCase(authLogin.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.userToken =
          action.payload?.accessToken || action.payload?.access_token || null;
        state.success = true;
        state.loading = false;
      })
      .addCase(authLogin.rejected, (state, action) => {
        state.success = false;
        state.loading = false;
        state.error = action.error?.message || null;
      });
      
  },
});
export const { reducerPath } = authLoginSlice;
export default authLoginSlice.reducer;
