const fs = require("fs");
const path = require("path");

const prisma = require("@/libs/prisma");
const notificationService = require("@/services/notification.service");

class AdminProductService {
  getLowStockThreshold() {
    return 5;
  }

  getMaxProductImages() {
    return 6;
  }

  getStockStatus(stock) {
    if (stock === 0) return "OUT_OF_STOCK";
    if (stock <= this.getLowStockThreshold()) return "LOW_STOCK";
    return "IN_STOCK";
  }

  getImageUrlsFromProduct(product) {
    const rawImageUrls = product?.imageUrls;
    const normalizedLegacyImageUrl = this.normalizeImageUrl(product?.imageUrl);

    if (Array.isArray(rawImageUrls)) {
      const nextImageUrls = rawImageUrls
        .map((item) => this.normalizeImageUrl(item))
        .filter(Boolean);

      if (nextImageUrls.length > 0) {
        return nextImageUrls;
      }
    }

    return normalizedLegacyImageUrl ? [normalizedLegacyImageUrl] : [];
  }

  mapProduct(product) {
    const imageUrls = this.getImageUrlsFromProduct(product);

    // Chuẩn hóa dữ liệu sản phẩm để frontend không phụ thuộc trực tiếp vào kiểu Prisma.
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price || 0),
      imageUrl: imageUrls[0] || null,
      imageUrls,
      stock: product.stock,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      stockStatus: this.getStockStatus(product.stock),
    };
  }

  normalizeName(value, { required = false } = {}) {
    if (value == null || String(value).trim() === "") {
      if (required) {
        throw new Error("Tên sản phẩm là bắt buộc");
      }

      return undefined;
    }

    return String(value).trim();
  }

  normalizeDescription(value) {
    if (value == null) {
      return null;
    }

    const normalizedDescription = String(value).trim();
    return normalizedDescription || null;
  }

  normalizePrice(value, { required = false } = {}) {
    if (value == null || value === "") {
      if (required) {
        throw new Error("Giá sản phẩm là bắt buộc");
      }

      return undefined;
    }

    const normalizedPrice = Number(value);
    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      throw new Error("Giá sản phẩm không hợp lệ");
    }

    return normalizedPrice;
  }

  normalizeImageUrl(value) {
    if (value == null) {
      return null;
    }

    const normalizedImageUrl = String(value).trim();
    return normalizedImageUrl || null;
  }

  normalizeImageUrls(value, { required = false } = {}) {
    if (value == null) {
      if (required) {
        throw new Error("Ảnh sản phẩm là bắt buộc");
      }

      return [];
    }

    if (!Array.isArray(value)) {
      throw new Error("Danh sách ảnh sản phẩm không hợp lệ");
    }

    const imageUrls = value.map((item) => this.normalizeImageUrl(item)).filter(Boolean);

    if (required && imageUrls.length === 0) {
      throw new Error("Ảnh sản phẩm là bắt buộc");
    }

    if (imageUrls.length > this.getMaxProductImages()) {
      throw new Error(`Tối đa ${this.getMaxProductImages()} ảnh cho mỗi sản phẩm`);
    }

    return imageUrls;
  }

  normalizeExistingImageUrls(value, fallbackImageUrls = []) {
    if (value == null || value === "") {
      return [...fallbackImageUrls];
    }

    let parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      throw new Error("Danh sách ảnh đang giữ lại không hợp lệ");
    }

    const normalizedImageUrls = this.normalizeImageUrls(parsedValue);
    const fallbackSet = new Set(fallbackImageUrls);

    return normalizedImageUrls.filter((imageUrl) => fallbackSet.has(imageUrl));
  }

  normalizeStock(value, { required = false } = {}) {
    if (value == null || value === "") {
      if (required) {
        throw new Error("Tồn kho sản phẩm là bắt buộc");
      }

      return undefined;
    }

    const normalizedStock = Number(value);
    if (!Number.isInteger(normalizedStock) || normalizedStock < 0) {
      throw new Error("Stock không hợp lệ");
    }

    return normalizedStock;
  }

  normalizeIsActive(value, { required = false } = {}) {
    if (value == null || value === "") {
      if (required) {
        throw new Error("Trạng thái hiển thị sản phẩm là bắt buộc");
      }

      return undefined;
    }

    if (typeof value !== "boolean") {
      throw new Error("isActive không hợp lệ");
    }

    return value;
  }

  getProductBaseData(payload = {}) {
    const source = payload && typeof payload === "object" ? payload : {};

    return {
      name: this.normalizeName(source.name, { required: true }),
      description: this.normalizeDescription(source.description),
      price: this.normalizePrice(source.price, { required: true }),
      stock: this.normalizeStock(source.stock, { required: true }),
      isActive: this.normalizeIsActive(source.isActive) ?? true,
    };
  }

  buildCreateProductData(payload = {}, imageUrls = []) {
    const data = this.getProductBaseData(payload);
    const normalizedImageUrls = this.normalizeImageUrls(imageUrls);

    // Chuẩn hóa payload tạo mới trước khi ghi DB để tránh controller phải validate lặp lại.
    return {
      ...data,
      imageUrl: normalizedImageUrls[0] || null,
      imageUrls: normalizedImageUrls,
    };
  }

  buildUpdateProductData(payload = {}, imageUrls) {
    const source = payload && typeof payload === "object" ? payload : {};
    const data = {};
    const supportedFields = ["name", "description", "price", "stock"];
    const hasSupportedField = supportedFields.some((field) =>
      Object.prototype.hasOwnProperty.call(source, field),
    );
    const hasImageUpdate = Array.isArray(imageUrls);

    if (!hasSupportedField && !hasImageUpdate) {
      throw new Error("Không có dữ liệu cập nhật");
    }

    // Chỉ lấy những field backend cho phép sửa để tránh ghi nhầm dữ liệu ngoài ý muốn.
    if (Object.prototype.hasOwnProperty.call(source, "name")) {
      data.name = this.normalizeName(source.name, { required: true });
    }

    if (Object.prototype.hasOwnProperty.call(source, "description")) {
      data.description = this.normalizeDescription(source.description);
    }

    if (Object.prototype.hasOwnProperty.call(source, "price")) {
      data.price = this.normalizePrice(source.price, { required: true });
    }

    if (Object.prototype.hasOwnProperty.call(source, "stock")) {
      data.stock = this.normalizeStock(source.stock, { required: true });
    }

    if (hasImageUpdate) {
      const normalizedImageUrls = this.normalizeImageUrls(imageUrls);
      data.imageUrl = normalizedImageUrls[0] || null;
      data.imageUrls = normalizedImageUrls;
    }

    return data;
  }

  isLocalProductUploadUrl(imageUrl) {
    return typeof imageUrl === "string" && imageUrl.includes("/uploads/products/");
  }

  getFilePathFromUploadUrl(imageUrl) {
    if (!this.isLocalProductUploadUrl(imageUrl)) {
      return null;
    }

    const marker = "/uploads/products/";
    const markerIndex = imageUrl.indexOf(marker);
    if (markerIndex === -1) {
      return null;
    }

    const fileName = imageUrl.slice(markerIndex + marker.length);
    if (!fileName) {
      return null;
    }

    return path.join(process.cwd(), "uploads", "products", fileName);
  }

  deleteFileIfExists(filePath) {
    if (!filePath) {
      return;
    }

    try {
      fs.unlinkSync(filePath);
    } catch {
      // Nếu file đã không còn tồn tại thì bỏ qua để không làm hỏng flow chính.
    }
  }

  deleteUploadedFiles(files = []) {
    files.forEach((file) => {
      this.deleteFileIfExists(file?.path);
    });
  }

  deleteRemovedLocalImages(previousImageUrls = [], nextImageUrls = []) {
    const nextSet = new Set(nextImageUrls);

    previousImageUrls.forEach((imageUrl) => {
      if (nextSet.has(imageUrl)) {
        return;
      }

      const filePath = this.getFilePathFromUploadUrl(imageUrl);
      this.deleteFileIfExists(filePath);
    });
  }

  buildUploadedImageUrl(req, fileName) {
    const origin = `${req.protocol}://${req.get("host")}`;
    return `${origin}/uploads/products/${fileName}`;
  }

  getUploadedImageUrls(req, files = []) {
    if (!Array.isArray(files) || files.length === 0) {
      return [];
    }

    return files.map((file) => this.buildUploadedImageUrl(req, file.filename));
  }

  async getProductByIdOrThrow(productId) {
    // Tách truy vấn dùng lại để mọi API cập nhật cùng thống nhất lỗi không tìm thấy.
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    return product;
  }

  buildProductWhere(query = {}) {
    // Gom toàn bộ filter của trang quản lý sản phẩm thành 1 where cho Prisma.
    const where = {};
    const search = String(query.search || "").trim();
    const stockStatus = String(query.stockStatus || "").trim().toUpperCase();
    const isActive = String(query.isActive || "").trim().toLowerCase();

    if (isActive === "true") {
      where.isActive = true;
    }

    if (isActive === "false") {
      where.isActive = false;
    }

    if (stockStatus === "OUT_OF_STOCK") {
      where.stock = 0;
    } else if (stockStatus === "LOW_STOCK") {
      where.stock = {
        gt: 0,
        lte: this.getLowStockThreshold(),
      };
    } else if (stockStatus === "IN_STOCK") {
      where.stock = {
        gt: this.getLowStockThreshold(),
      };
    }

    if (search) {
      const searchConditions = [
        {
          name: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ];

      // Cho phép tìm theo id khi người dùng nhập số ở ô tìm kiếm.
      if (/^\d+$/.test(search)) {
        searchConditions.push({
          id: BigInt(search),
        });
      }

      where.OR = searchConditions;
    }

    return where;
  }

  async getProducts(query = {}) {
    // Chuẩn hóa phân trang để admin table luôn nhận dữ liệu hợp lệ.
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 8, 1), 100);
    const skip = (page - 1) * limit;
    const where = this.buildProductWhere(query);

    const [items, total, totalProducts, lowStockProducts, outOfStockProducts] =
      await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.product.count({ where }),
        prisma.product.count(),
        prisma.product.count({
          where: {
            stock: {
              gt: 0,
              lte: this.getLowStockThreshold(),
            },
          },
        }),
        prisma.product.count({
          where: {
            stock: 0,
          },
        }),
      ]);

    return {
      items: items.map((item) => this.mapProduct(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
      },
    };
  }

  async createProduct(req, payload = {}, files = []) {
    const uploadedFiles = Array.isArray(files) ? files : [];

    try {
      const uploadedImageUrls = this.getUploadedImageUrls(req, uploadedFiles);

      // Tạo sản phẩm mới bằng payload đã được normalize để đảm bảo đúng schema hiện tại.
      const data = this.buildCreateProductData(payload, uploadedImageUrls);
      const createdProduct = await prisma.product.create({ data });
      return this.mapProduct(createdProduct);
    } catch (error) {
      this.deleteUploadedFiles(uploadedFiles);
      throw error;
    }
  }

  async updateProduct(req, productId, payload = {}, files = []) {
    const uploadedFiles = Array.isArray(files) ? files : [];
    const product = await this.getProductByIdOrThrow(productId);
    const previousImageUrls = this.getImageUrlsFromProduct(product);

    try {
      const keptImageUrls = this.normalizeExistingImageUrls(
        payload?.existingImageUrls,
        previousImageUrls,
      );
      const uploadedImageUrls = this.getUploadedImageUrls(req, uploadedFiles);
      const nextImageUrls = [...keptImageUrls, ...uploadedImageUrls];
      const data = this.buildUpdateProductData(payload, nextImageUrls);
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data,
      });

      // Nếu admin sửa trực tiếp stock về 0 thì vẫn giữ nguyên rule bắn cảnh báo hết hàng.
      if (
        Object.prototype.hasOwnProperty.call(data, "stock") &&
        product.stock > 0 &&
        updatedProduct.stock === 0
      ) {
        await notificationService.createProductOutOfStockNotification(
          updatedProduct,
        );
      }

      this.deleteRemovedLocalImages(previousImageUrls, nextImageUrls);
      return this.mapProduct(updatedProduct);
    } catch (error) {
      this.deleteUploadedFiles(uploadedFiles);
      throw error;
    }
  }

  async updateVisibility(productId, isActive) {
    await this.getProductByIdOrThrow(productId);

    // Tách API ẩn/hiện riêng để frontend chỉ cần truyền đúng trạng thái hiển thị.
    const normalizedIsActive = this.normalizeIsActive(isActive, {
      required: true,
    });
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive: normalizedIsActive },
    });

    return this.mapProduct(updatedProduct);
  }

  async updateStock(productId, stock) {
    // Chuẩn hóa stock về number để validate trước khi ghi DB.
    const normalizedStock = this.normalizeStock(stock, { required: true });

    // Lấy sản phẩm hiện tại để kiểm tra tồn tại và so sánh stock cũ/mới.
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    // Cập nhật tồn kho theo số lượng admin gửi lên.
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: normalizedStock },
    });

    // Chỉ bắn cảnh báo khi sản phẩm vừa chuyển từ còn hàng sang hết hàng.
    if (product.stock > 0 && updatedProduct.stock === 0) {
      await notificationService.createProductOutOfStockNotification(
        updatedProduct,
      );
    }

    return this.mapProduct(updatedProduct);
  }
}

module.exports = new AdminProductService();
