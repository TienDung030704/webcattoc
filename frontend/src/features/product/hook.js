import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { resetProductDetail } from "@/features/product/productSlice";
import { getProductDetail, getProducts } from "@/service/product/productService";

export const useProductList = () => {
  return useSelector((state) => state.product?.list);
};

export const useProductDetailState = () => {
  return useSelector((state) => state.product?.detail);
};

export const useProductActions = () => {
  const dispatch = useDispatch();

  return useMemo(
    () => ({
      getProducts: (params) => dispatch(getProducts(params)),
      getProductDetail: (productId) => dispatch(getProductDetail(productId)),
      resetProductDetail: () => dispatch(resetProductDetail()),
    }),
    [dispatch],
  );
};
