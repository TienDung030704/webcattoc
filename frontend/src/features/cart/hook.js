import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addToCart,
  clearCart,
  decrementCartItem,
  incrementCartItem,
  removeFromCart,
  syncCartStorageByCurrentUser,
  updateCartItemQuantity,
} from "@/features/cart/cartSlice";

export const useCartItems = () => {
  return useSelector((state) => state.cart?.items || []);
};

export const useCartCount = () => {
  return useSelector((state) =>
    (state.cart?.items || []).reduce(
      (total, item) => total + Math.max(Number(item?.quantity || 0), 0),
      0,
    ),
  );
};

export const useCartSummary = () => {
  const items = useCartItems();

  return useMemo(() => {
    const totalItems = items.reduce(
      (total, item) => total + Math.max(Number(item?.quantity || 0), 0),
      0,
    );
    const subtotal = items.reduce(
      (total, item) => total + Number(item?.price || 0) * Math.max(Number(item?.quantity || 0), 0),
      0,
    );

    return {
      totalItems,
      subtotal,
    };
  }, [items]);
};

export const useCartActions = () => {
  const dispatch = useDispatch();

  return useMemo(
    () => ({
      addToCart: (payload) => dispatch(addToCart(payload)),
      updateCartItemQuantity: (payload) => dispatch(updateCartItemQuantity(payload)),
      incrementCartItem: (productId) => dispatch(incrementCartItem(productId)),
      decrementCartItem: (productId) => dispatch(decrementCartItem(productId)),
      removeFromCart: (productId) => dispatch(removeFromCart(productId)),
      clearCart: () => dispatch(clearCart()),
      syncCartStorageByCurrentUser: () => dispatch(syncCartStorageByCurrentUser()),
    }),
    [dispatch],
  );
};
