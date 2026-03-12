const CART_STORAGE_KEY = "shopping_cart";
const CART_GUEST_STORAGE_KEY = `${CART_STORAGE_KEY}:guest`;

function readCurrentCartOwnerKey() {
  try {
    const rawUser = localStorage.getItem("user_data");

    if (!rawUser) {
      return "guest";
    }

    const parsedUser = JSON.parse(rawUser);
    const stableUserKey = String(
      parsedUser?.id ||
        parsedUser?.userId ||
        parsedUser?.email ||
        parsedUser?.username ||
        "",
    )
      .trim()
      .toLowerCase();

    return stableUserKey || "guest";
  } catch {
    return "guest";
  }
}

function getCartStorageKey() {
  const ownerKey = readCurrentCartOwnerKey();

  if (ownerKey === "guest") {
    return CART_GUEST_STORAGE_KEY;
  }

  return `${CART_STORAGE_KEY}:${ownerKey}`;
}
 
function clearLegacyCartStorage() {
  // Xóa key cart cũ dùng chung cho mọi account để không còn hiện tượng tài khoản sau nhìn thấy cart của tài khoản trước.
  localStorage.removeItem(CART_STORAGE_KEY);
}

export function readCartItemsFromStorage() {
  try {
    clearLegacyCartStorage();

    const rawValue = localStorage.getItem(getCartStorageKey());
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

export function writeCartItemsToStorage(items) {
  clearLegacyCartStorage();
  localStorage.setItem(getCartStorageKey(), JSON.stringify(items));
}

export function normalizeCartItem(payload = {}) {
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

export function getNextQuantity(currentQuantity, addedQuantity, stock) {
  const nextQuantity = currentQuantity + addedQuantity;

  if (stock > 0) {
    return Math.min(nextQuantity, stock);
  }

  return nextQuantity;
}
