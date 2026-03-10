import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { resetFavoritesState } from "@/features/favorite/favoriteSlice";
import {
  addFavorite,
  getFavoriteStatus,
  getFavorites,
  removeFavorite,
} from "@/service/favorite/favoriteService";

function normalizeProductId(productId) {
  return String(productId || "").trim();
}

export const useFavoriteState = () => {
  return useSelector((state) => state.favorite);
};

export const useFavoriteCount = () => {
  return useSelector((state) => Number(state.favorite?.total || 0));
};

export const useFavoriteStatus = (productId) => {
  const normalizedProductId = normalizeProductId(productId);

  return useSelector((state) => {
    if (!normalizedProductId) {
      return {
        isFavorite: false,
        isLoading: false,
      };
    }

    return {
      isFavorite: Boolean(state.favorite?.statusByProductId?.[normalizedProductId]),
      isLoading: Boolean(
        state.favorite?.statusLoadingByProductId?.[normalizedProductId] ||
          state.favorite?.toggleLoadingByProductId?.[normalizedProductId],
      ),
    };
  });
};

export const useFavoriteActions = () => {
  const dispatch = useDispatch();

  return useMemo(
    () => ({
      getFavorites: () => dispatch(getFavorites()),
      getFavoriteStatus: (productId) => dispatch(getFavoriteStatus(productId)),
      addFavorite: (productId) => dispatch(addFavorite(productId)),
      removeFavorite: (productId) => dispatch(removeFavorite(productId)),
      resetFavoritesState: () => dispatch(resetFavoritesState()),
    }),
    [dispatch],
  );
};
