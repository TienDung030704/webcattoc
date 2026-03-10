import { createSlice } from "@reduxjs/toolkit";

import { getProductDetail, getProducts } from "@/service/product/productService";

const initialPagination = {
  page: 1,
  limit: 6,
  total: 0,
  totalPages: 1,
};

const initialState = {
  list: {
    items: [],
    pagination: initialPagination,
    loading: false,
    error: null,
  },
  detail: {
    item: null,
    loading: false,
    error: null,
  },
};

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    resetProductDetail: (state) => {
      // Reset detail khi user rời trang hoặc mở sản phẩm khác để tránh giữ dữ liệu cũ trong UI.
      state.detail.item = null;
      state.detail.loading = false;
      state.detail.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.items = Array.isArray(action.payload?.items)
          ? action.payload.items
          : [];
        state.list.pagination = action.payload?.pagination || initialPagination;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.list.loading = false;
        state.list.items = [];
        state.list.error = action.payload || action.error?.message || null;
      })
      .addCase(getProductDetail.pending, (state) => {
        state.detail.loading = true;
        state.detail.error = null;
        state.detail.item = null;
      })
      .addCase(getProductDetail.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.item = action.payload || null;
      })
      .addCase(getProductDetail.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.item = null;
        state.detail.error = action.payload || action.error?.message || null;
      });
  },
});

export const { resetProductDetail } = productSlice.actions;
export const { reducerPath } = productSlice;
export default productSlice.reducer;
