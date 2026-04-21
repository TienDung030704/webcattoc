const FAVORITE_PRODUCTS_STORAGE_KEY = "favorite_products";
const FAVORITES_UPDATED_EVENT = "favorites-updated";

function normalizeFavoriteProductId(productId) {
  const normalizedProductId = String(productId || "").trim();
  return normalizedProductId;
}

export function getFavoriteProducts() {
  try {
    const rawValue = localStorage.getItem(FAVORITE_PRODUCTS_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map((productId) => normalizeFavoriteProductId(productId))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function isFavoriteProduct(productId) {
  const normalizedProductId = normalizeFavoriteProductId(productId);
  if (!normalizedProductId) {
    return false;
  }

  return getFavoriteProducts().includes(normalizedProductId);
}

export function setFavoriteProducts(productIds = []) {
  const normalizedProductIds = [...new Set(productIds.map((productId) => normalizeFavoriteProductId(productId)).filter(Boolean))];
  localStorage.setItem(
    FAVORITE_PRODUCTS_STORAGE_KEY,
    JSON.stringify(normalizedProductIds),
  );
  window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT));
  return normalizedProductIds;
}

export function toggleFavoriteProduct(productId) {
  const normalizedProductId = normalizeFavoriteProductId(productId);
  const favoriteProducts = getFavoriteProducts();
  const isActive = favoriteProducts.includes(normalizedProductId);
  const nextFavoriteProducts = isActive
    ? favoriteProducts.filter((item) => item !== normalizedProductId)
    : [...favoriteProducts, normalizedProductId];

  setFavoriteProducts(nextFavoriteProducts);

  return {
    isFavorite: !isActive,
    items: nextFavoriteProducts,
  };
}

export function getFavoriteProductsCount() {
  return getFavoriteProducts().length;
}

export function getFavoritesUpdatedEventName() {
  return FAVORITES_UPDATED_EVENT;
}
