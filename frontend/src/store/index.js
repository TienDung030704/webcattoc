import { configureStore } from "@reduxjs/toolkit";
import { authLoginSlice } from "@/features/Auth/authLogin";
import { authRegisterSlice } from "@/features/Auth/authRegister";
import { authLogoutSlice } from "@/features/Auth/authLogout";
import { authUserSlice } from "@/features/Auth/authUser/authUser";
import { cartSlice } from "@/features/cart/cartSlice";
import { favoriteSlice } from "@/features/favorite/favoriteSlice";
import { productSlice } from "@/features/product/productSlice";

export const store = configureStore({
  reducer: {
    [authRegisterSlice.reducerPath]: authRegisterSlice.reducer,
    [authLoginSlice.reducerPath]: authLoginSlice.reducer,
    [authLogoutSlice.reducerPath]: authLogoutSlice.reducer,
    [authUserSlice.reducerPath]: authUserSlice.reducer,
    [productSlice.reducerPath]: productSlice.reducer,
    [favoriteSlice.reducerPath]: favoriteSlice.reducer,
    [cartSlice.reducerPath]: cartSlice.reducer,
  },
});

window.store = store;
