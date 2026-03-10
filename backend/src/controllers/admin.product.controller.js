const adminProductService = require("@/services/admin.product.service");

const parseProductId = (value) => {
  try {
    // Parse id sang BigInt để khớp kiểu id trong Prisma schema.
    return BigInt(value);
  } catch {
    throw new Error("Id sản phẩm không hợp lệ");
  }
};

const getProductErrorStatus = (message) => {
  return message === "Không tìm thấy sản phẩm" ? 404 : 400;
};

const getProducts = async (req, res) => {
  const data = await adminProductService.getProducts(req.query);
  res.success(data);
};

const createProduct = async (req, res) => {
  try {
    const data = await adminProductService.createProduct(req, req.body, req.files);
    res.success(data, 201);
  } catch (error) {
    // Chuẩn hóa message/status để frontend dễ xử lý lỗi tạo sản phẩm.
    const message = error?.message || "Không thể tạo sản phẩm";
    res.error(message, getProductErrorStatus(message));
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = parseProductId(req.params.id);
    const data = await adminProductService.updateProduct(req, productId, req.body, req.files);
    res.success(data);
  } catch (error) {
    // Chuẩn hóa message/status để frontend dễ xử lý lỗi cập nhật sản phẩm.
    const message = error?.message || "Không thể cập nhật sản phẩm";
    res.error(message, getProductErrorStatus(message));
  }
};

const updateStock = async (req, res) => {
  try {
    const productId = parseProductId(req.params.id);
    const data = await adminProductService.updateStock(productId, req.body?.stock);
    res.success(data);
  } catch (error) {
    // Chuẩn hóa message/status để frontend dễ xử lý lỗi cập nhật tồn kho.
    const message = error?.message || "Không thể cập nhật tồn kho";
    res.error(message, getProductErrorStatus(message));
  }
};

const updateVisibility = async (req, res) => {
  try {
    const productId = parseProductId(req.params.id);
    const data = await adminProductService.updateVisibility(
      productId,
      req.body?.isActive,
    );
    res.success(data);
  } catch (error) {
    // Chuẩn hóa message/status để frontend dễ xử lý lỗi ẩn/hiện sản phẩm.
    const message = error?.message || "Không thể cập nhật trạng thái hiển thị sản phẩm";
    res.error(message, getProductErrorStatus(message));
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  updateStock,
  updateVisibility,
};
