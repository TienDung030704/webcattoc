import { createSlice } from "@reduxjs/toolkit";

import {
  getNextQuantity,
  normalizeCartItem,
  readCartItemsFromStorage,
  writeCartItemsToStorage,
} from "@/features/cart/cartStorage";

const initialState = {
  items: readCartItemsFromStorage(),
};

function syncCartItemsForCurrentUser(state) {
  state.items = readCartItemsFromStorage();
}

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      // Gộp cùng productId để cart không sinh ra nhiều dòng trùng của cùng một sản phẩm.
      const nextItem = normalizeCartItem(action.payload);

      if (!nextItem.productId || !nextItem.name) {
        return;
      }

      const existedItem = state.items.find(
        (item) => item.productId === nextItem.productId,
      );

      if (existedItem) {
        existedItem.quantity = getNextQuantity(
          existedItem.quantity,
          nextItem.quantity,
          nextItem.stock,
        );
        existedItem.stock = nextItem.stock;
        existedItem.stockStatus = nextItem.stockStatus;
        existedItem.price = nextItem.price;
        existedItem.imageUrl = nextItem.imageUrl;
        existedItem.name = nextItem.name;
      } else {
        state.items.push(nextItem);
      }

      writeCartItemsToStorage(state.items);
    },
    updateCartItemQuantity: (state, action) => {
      const productId = String(action.payload?.productId || "").trim();
      const quantity = Number(action.payload?.quantity || 0);
      const item = state.items.find((cartItem) => cartItem.productId === productId);

      if (!item) {
        return;
      }

      if (quantity <= 0) {
        state.items = state.items.filter((cartItem) => cartItem.productId !== productId);
        writeCartItemsToStorage(state.items);
        return;
      }

      item.quantity = item.stock > 0 ? Math.min(quantity, item.stock) : quantity;
      writeCartItemsToStorage(state.items);
    },
    incrementCartItem: (state, action) => {
      const productId = String(action.payload || "").trim();
      const item = state.items.find((cartItem) => cartItem.productId === productId);

      if (!item) {
        return;
      }

      item.quantity = item.stock > 0 ? Math.min(item.quantity + 1, item.stock) : item.quantity + 1;
      writeCartItemsToStorage(state.items);
    },
    decrementCartItem: (state, action) => {
      const productId = String(action.payload || "").trim();
      const item = state.items.find((cartItem) => cartItem.productId === productId);

      if (!item) {
        return;
      }

      if (item.quantity <= 1) {
        state.items = state.items.filter((cartItem) => cartItem.productId !== productId);
        writeCartItemsToStorage(state.items);
        return;
      }

      item.quantity -= 1;
      writeCartItemsToStorage(state.items);
    },
    removeFromCart: (state, action) => {
      const productId = String(action.payload || "").trim();
      state.items = state.items.filter((cartItem) => cartItem.productId !== productId);
      writeCartItemsToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      writeCartItemsToStorage(state.items);
    },
    syncCartStorageByCurrentUser: (state) => {
      // Mỗi khi login/logout/đổi user thì nạp lại đúng giỏ hàng theo user hiện tại thay vì giữ state của account trước.
      syncCartItemsForCurrentUser(state);
    },
  },
});

export const {
  addToCart,
  updateCartItemQuantity,
  incrementCartItem,
  decrementCartItem,
  removeFromCart,
  clearCart,
  syncCartStorageByCurrentUser,
} = cartSlice.actions;
export const { reducerPath } = cartSlice;
export default cartSlice.reducer;
