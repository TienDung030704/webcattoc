import { createSlice } from "@reduxjs/toolkit";

const CART_STORAGE_KEY = "shopping_cart";

function readCartItemsFromStorage() {
  try {
    const rawValue = localStorage.getItem(CART_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map((item) => ({
        productId: String(item?.productId || item?.id || "").trim(),
        name: String(item?.name || "").trim(),
        price: Number(item?.price || 0),
        imageUrl: typeof item?.imageUrl === "string" ? item.imageUrl.trim() : "",
        stock: Number(item?.stock || 0),
        stockStatus: String(item?.stockStatus || "").trim(),
        quantity: Math.max(Number(item?.quantity || 1), 1),
      }))
      .filter((item) => item.productId && item.name);
  } catch {
    return [];
  }
}

function writeCartItemsToStorage(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function normalizeCartItem(payload = {}) {
  return {
    productId: String(payload?.productId || payload?.id || "").trim(),
    name: String(payload?.name || "").trim(),
    price: Number(payload?.price || 0),
    imageUrl: typeof payload?.imageUrl === "string" ? payload.imageUrl.trim() : "",
    stock: Number(payload?.stock || 0),
    stockStatus: String(payload?.stockStatus || "").trim(),
    quantity: Math.max(Number(payload?.quantity || 1), 1),
  };
}

function getNextQuantity(currentQuantity, addedQuantity, stock) {
  const nextQuantity = currentQuantity + addedQuantity;

  if (stock > 0) {
    return Math.min(nextQuantity, stock);
  }

  return nextQuantity;
}

const initialState = {
  items: readCartItemsFromStorage(),
};

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
  },
});

export const {
  addToCart,
  updateCartItemQuantity,
  incrementCartItem,
  decrementCartItem,
  removeFromCart,
  clearCart,
} = cartSlice.actions;
export const { reducerPath } = cartSlice;
export default cartSlice.reducer;
