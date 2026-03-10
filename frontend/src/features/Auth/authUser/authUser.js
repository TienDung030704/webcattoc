import { createSlice } from "@reduxjs/toolkit";
import { authUserService } from "@/service/auth/authUser/authUserService";

const initialState = {
  loading: false,
  userInfo: {},
  error: null,
};

export const authUserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.userInfo = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(authUserService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authUserService.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.loading = false;
      })
      .addCase(authUserService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { logoutUser } = authUserSlice.actions;

export const { reducerPath } = authUserSlice;
export default authUserSlice.reducer;
