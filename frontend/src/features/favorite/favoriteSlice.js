import { createSlice } from "@reduxjs/toolkit";

import {
  addFavorite,
  getFavoriteStatus,
  getFavorites,
  removeFavorite,
} from "@/service/favorite/favoriteService";

const initialState = {
  items: [],
  total: 0,
  statusByProductId: {},
  loading: false,
  statusLoadingByProductId: {},
  toggleLoadingByProductId: {},
  error: null,
};

function normalizeProductId(productId) {
  return String(productId || "").trim();
}

function removeFavoriteItem(items = [], productId) {
  const normalizedProductId = normalizeProductId(productId);

  return (Array.isArray(items) ? items : []).filter(
    (item) => normalizeProductId(item?.id) !== normalizedProductId,
  );
}

export const favoriteSlice = createSlice({
  name: "favorite",
  initialState,
  reducers: {
    resetFavoritesState: (state) => {
      // Reset favorites khi logout để badge và trạng thái heart không bị giữ lại giữa 2 user khác nhau.
      state.items = [];
      state.total = 0;
      state.statusByProductId = {};
      state.loading = false;
      state.statusLoadingByProductId = {};
      state.toggleLoadingByProductId = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        const items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        const nextStatusByProductId = {};

        state.loading = false;
        state.items = items;
        state.total = Number(action.payload?.total ?? items.length) || 0;
        state.error = null;

        items.forEach((item) => {
          const normalizedProductId = normalizeProductId(item?.id);
          if (normalizedProductId) {
            nextStatusByProductId[normalizedProductId] = true;
          }
        });

        // Đồng bộ lại toàn bộ map status theo danh sách favorites mới nhất từ backend.
        state.statusByProductId = {
          ...state.statusByProductId,
          ...nextStatusByProductId,
        };
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || null;
      })
      .addCase(getFavoriteStatus.pending, (state, action) => {
        const normalizedProductId = normalizeProductId(action.meta.arg);
        if (normalizedProductId) {
          state.statusLoadingByProductId[normalizedProductId] = true;
        }
      })
      .addCase(getFavoriteStatus.fulfilled, (state, action) => {
        const normalizedProductId = normalizeProductId(action.payload?.productId);
        if (normalizedProductId) {
          state.statusLoadingByProductId[normalizedProductId] = false;
          state.statusByProductId[normalizedProductId] = Boolean(action.payload?.isFavorite);
        }
      })
      .addCase(getFavoriteStatus.rejected, (state, action) => {
        const normalizedProductId = normalizeProductId(
          action.payload?.productId || action.meta.arg,
        );
        if (normalizedProductId) {
          state.statusLoadingByProductId[normalizedProductId] = false;
          state.statusByProductId[normalizedProductId] = false;
        }
      })
      .addCase(addFavorite.pending, (state, action) => {
        const normalizedProductId = normalizeProductId(action.meta.arg);
        if (normalizedProductId) {
          state.toggleLoadingByProductId[normalizedProductId] = true;
        }
        state.error = null;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        const normalizedProductId = normalizeProductId(action.payload?.productId);
        if (normalizedProductId) {
          state.toggleLoadingByProductId[normalizedProductId] = false;
          state.statusByProductId[normalizedProductId] = true;
        }
        state.total = Number(action.payload?.total ?? state.total) || 0;
      })
      .addCase(addFavorite.rejected, (state, action) => {
        const normalizedProductId = normalizeProductId(action.meta.arg);
        if (normalizedProductId) {
          state.toggleLoadingByProductId[normalizedProductId] = false;
        }
        state.error = action.payload || action.error?.message || null;
      })
      .addCase(removeFavorite.pending, (state, action) => {
        const normalizedProductId = normalizeProductId(action.meta.arg);
        if (normalizedProductId) {
          state.toggleLoadingByProductId[normalizedProductId] = true;
        }
        state.error = null;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        const normalizedProductId = normalizeProductId(action.payload?.productId);
        if (normalizedProductId) {
          state.toggleLoadingByProductId[normalizedProductId] = false;
          state.statusByProductId[normalizedProductId] = false;
          state.items = removeFavoriteItem(state.items, normalizedProductId);
        }
        state.total = Number(action.payload?.total ?? state.total) || 0;
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        const normalizedProductId = normalizeProductId(action.meta.arg);
        if (normalizedProductId) {
          state.toggleLoadingByProductId[normalizedProductId] = false;
        }
        state.error = action.payload || action.error?.message || null;
      });
  },
});

export const { resetFavoritesState } = favoriteSlice.actions;
export const { reducerPath } = favoriteSlice;
export default favoriteSlice.reducer;
