import { createSlice } from "@reduxjs/toolkit";
import { authLogout } from "@/service/auth/authService";

const initialState = {
  loading: false,
  success: false,
  error: null,
  data: null,
};
export const authLogoutSlice = createSlice({
  name: "authLogout",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(authLogout.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(authLogout.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.success = true;
      })
      .addCase(authLogout.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.error?.message || null;
      });
  },
});

export const { reducerPath } = authLogoutSlice;
export default authLogoutSlice.reducer;
