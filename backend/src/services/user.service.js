const fs = require("fs");
const bcrypt = require("bcrypt");
const prisma = require("@/libs/prisma");
const adminService = require("@/services/admin.service");
const branchService = require("@/services/branch.service");
const emailService = require("@/services/email.service");
const orderService = require("@/services/order.service");
const { Prisma } = require("../../generated/client");

class UserService {
  getLowStockThreshold() {
    return 5;
  }

  normalizeProductId(productId) {
    if (productId == null || String(productId).trim() === "") {
      throw new Error("Mã sản phẩm không hợp lệ");
    }

    const normalizedProductId = String(productId).trim();
    if (!/^\d+$/.test(normalizedProductId)) {
      throw new Error("Mã sản phẩm không hợp lệ");
    }

    return BigInt(normalizedProductId);
  }

  getUserProfileSelect() {
    return {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      role: true,
      isVerified: true,
      emailVerifiedAt: true,
      _count: {
        select: {
          refreshTokens: true,
        },
      },
    };
  }

  normalizeProfileString(value, fieldLabel, { required = false } = {}) {
    if (value == null) {
      if (required) {
        throw new Error(`${fieldLabel} không hợp lệ`);
      }

      return null;
    }

    if (typeof value !== "string") {
      throw new Error(`${fieldLabel} không hợp lệ`);
    }

    const normalizedValue = value.trim();
    if (!normalizedValue) {
      if (required) {
        throw new Error(`${fieldLabel} không hợp lệ`);
      }

      return null;
    }

    return normalizedValue;
  }

  validateMaxLength(value, maxLength, message) {
    if (value != null && value.length > maxLength) {
      throw new Error(message);
    }
  }

  normalizePassword(value, fieldLabel) {
    if (typeof value !== "string") {
      throw new Error(`${fieldLabel} không hợp lệ`);
    }

    const normalizedValue = value.trim();
    if (!normalizedValue) {
      throw new Error(`${fieldLabel} không hợp lệ`);
    }

    return normalizedValue;
  }

  normalizeChangePasswordPayload(payload = {}) {
    const source = payload && typeof payload === "object" ? payload : {};
    const allowedFields = ["currentPassword", "newPassword"];
    const hasAllowedField = allowedFields.some((field) =>
      Object.prototype.hasOwnProperty.call(source, field),
    );

    if (!hasAllowedField) {
      throw new Error("Không có dữ liệu cập nhật");
    }

    const currentPassword = this.normalizePassword(
      source.currentPassword,
      "Mật khẩu hiện tại",
    );
    const newPassword = this.normalizePassword(source.newPassword, "Mật khẩu mới");

    if (newPassword.length < 8) {
      throw new Error("Mật khẩu mới phải có ít nhất 8 ký tự");
    }

    if (newPassword === currentPassword) {
      throw new Error("Mật khẩu mới phải khác mật khẩu hiện tại");
    }

    return {
      currentPassword,
      newPassword,
    };
  }

  normalizeAvatar(value, { required = false } = {}) {
    if (value == null) {
      if (required) {
        throw new Error("Avatar không hợp lệ");
      }

      return null;
    }

    if (typeof value !== "string") {
      throw new Error("Avatar không hợp lệ");
    }

    const normalizedAvatar = value.trim();
    if (!normalizedAvatar) {
      throw new Error("Avatar không hợp lệ");
    }

    this.validateMaxLength(normalizedAvatar, 1000, "Avatar không hợp lệ");

    let avatarUrl;
    try {
      avatarUrl = new URL(normalizedAvatar);
    } catch {
      throw new Error("Avatar không hợp lệ");
    }

    if (!["http:", "https:"].includes(avatarUrl.protocol)) {
      throw new Error("Avatar không hợp lệ");
    }

    return normalizedAvatar;
  }


  buildUpdateProfileData(payload = {}) {
    const source = payload && typeof payload === "object" ? payload : {};
    const allowedFields = ["username", "firstName", "lastName", "avatar"];
    const forbiddenFields = [
      "id",
      "email",
      "password",
      "role",
      "isVerified",
      "emailVerifiedAt",
      "createdAt",
      "updatedAt",
    ];
    // Chặn các field nhạy cảm/hệ thống không được phép sửa từ API profile user.
    const hasForbiddenField = forbiddenFields.some((field) =>
      Object.prototype.hasOwnProperty.call(source, field),
    ); 
    
    if (hasForbiddenField) {
      throw new Error("Trường cập nhật không hợp lệ");
    }
    const hasAllowedField = allowedFields.some((field) =>
      Object.prototype.hasOwnProperty.call(source, field),
    );
    if (!hasAllowedField) {
      throw new Error("Không có dữ liệu cập nhật");
    }

    const data = {};

    if (Object.prototype.hasOwnProperty.call(source, "username")) {
      const username = this.normalizeProfileString(
        source.username,
        "Tên đăng nhập",
        {
          required: true,
        },
      );
      this.validateMaxLength(username, 50, "Tên đăng nhập không hợp lệ");
      data.username = username;
    }

    if (Object.prototype.hasOwnProperty.call(source, "firstName")) {
      const firstName = this.normalizeProfileString(source.firstName, "Họ");
      this.validateMaxLength(firstName, 100, "Họ không hợp lệ");
      data.firstName = firstName;
    }

    if (Object.prototype.hasOwnProperty.call(source, "lastName")) {
      const lastName = this.normalizeProfileString(source.lastName, "Tên");
      this.validateMaxLength(lastName, 100, "Tên không hợp lệ");
      data.lastName = lastName;
    }

    if (Object.prototype.hasOwnProperty.call(source, "avatar")) {
      data.avatar = this.normalizeAvatar(source.avatar);
    }

    return data;
  }

  getStockStatus(stock) {
    if (stock === 0) return "OUT_OF_STOCK";
    if (stock <= this.getLowStockThreshold()) return "LOW_STOCK";
    return "IN_STOCK";
  }

  getImageUrlsFromProduct(product) {
    const rawImageUrls = product?.imageUrls;
    const normalizedLegacyImageUrl =
      typeof product?.imageUrl === "string" ? product.imageUrl.trim() : "";

    if (Array.isArray(rawImageUrls)) {
      const nextImageUrls = rawImageUrls
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);

      if (nextImageUrls.length > 0) {
        return nextImageUrls;
      }
    }

    return normalizedLegacyImageUrl ? [normalizedLegacyImageUrl] : [];
  }

  mapProduct(product) {
    const imageUrls = this.getImageUrlsFromProduct(product);

    // Chuẩn hóa dữ liệu sản phẩm public để trang storefront có thể render trực tiếp.
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price || 0),
      imageUrl: imageUrls[0] || null,
      imageUrls,
      stock: product.stock,
      isActive: product.isActive,
      stockStatus: this.getStockStatus(product.stock),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  mapService(service) {
    // Chuẩn hóa dữ liệu dịch vụ public để booking page dùng trực tiếp cho quick-select cards.
    return {
      id: service.id,
      name: service.name,
      category: service.category,
      price: Number(service.price || 0),
      description: service.description,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }

  buildServiceWhere(query = {}) {
    // Chỉ trả các dịch vụ đang bật để user public không nhìn thấy service đã bị admin ẩn.
    const conditions = [Prisma.sql`isActive = ${true}`];
    const search = String(query.search || "").trim();
    const category = String(query.category || "").trim();

    if (category) {
      conditions.push(Prisma.sql`category = ${category}`);
    }

    if (search) {
      const likeSearch = `%${search}%`;
      conditions.push(
        Prisma.sql`(
          name LIKE ${likeSearch}
          OR category LIKE ${likeSearch}
          OR description LIKE ${likeSearch}
        )`,
      );
    }

    return Prisma.sql`WHERE ${Prisma.join(conditions, Prisma.sql` AND `)}`;
  }

  buildProductWhere(query = {}) {
    // Chỉ trả các sản phẩm đang được publish ra storefront.
    const where = {
      isActive: true,
    };
    const search = String(query.search || "").trim();
    const availability = String(query.availability || "")
      .trim()
      .toUpperCase();

    if (availability === "IN_STOCK") {
      where.stock = {
        gt: 0,
      };
    }

    if (availability === "OUT_OF_STOCK") {
      where.stock = 0;
    }

    if (search) {
      where.OR = [
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
    }

    return where;
  }

  getProductOrderBy(query = {}) {
    // Whitelist sort để storefront chỉ dùng các kiểu sắp xếp đã hỗ trợ.
    const sort = String(query.sort || "newest")
      .trim()
      .toLowerCase();

    if (sort === "price_asc") {
      return {
        price: "asc",
      };
    }

    if (sort === "price_desc") {
      return {
        price: "desc",
      };
    }

    return {
      createdAt: "desc",
    };
  }

  async getProducts(query = {}) {
    // Chuẩn hóa phân trang để trang sản phẩm public luôn nhận dữ liệu hợp lệ.
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 6, 1), 100);
    const skip = (page - 1) * limit;
    const where = this.buildProductWhere(query);
    const orderBy = this.getProductOrderBy(query);

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapProduct(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getProductDetail(productId) {
    const product = await this.getActiveProductByIdOrThrow(productId);

    // Reuse mapper hiện tại để payload detail và list luôn cùng shape cho frontend.
    return this.mapProduct(product);
  }

  async getActiveProductByIdOrThrow(productId) {
    const normalizedProductId = this.normalizeProductId(productId);
    const product = await prisma.product.findFirst({
      where: {
        id: normalizedProductId,
        isActive: true,
      },
    });

    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    return product;
  }

  mapFavorite(product, favorite) {
    return {
      ...this.mapProduct(product),
      favoritedAt: favorite.createdAt,
      isFavorite: true,
    };
  }

  async getFavorites(userId) {
    await this.getUserByIdOrThrow(userId);

    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId,
        product: {
          isActive: true,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: true,
      },
    });

    return {
      items: favorites.map((favorite) => this.mapFavorite(favorite.product, favorite)),
      total: favorites.length,
    };
  }

  async getFavoriteStatus(userId, productId) {
    await this.getUserByIdOrThrow(userId);
    const product = await this.getActiveProductByIdOrThrow(productId);
    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: product.id,
        },
      },
    });

    return {
      productId: product.id,
      isFavorite: Boolean(favorite),
    };
  }

  async addFavorite(userId, productId) {
    await this.getUserByIdOrThrow(userId);
    const product = await this.getActiveProductByIdOrThrow(productId);

    // Dùng upsert để API thêm yêu thích an toàn khi user bấm lặp lại nhiều lần.
    await prisma.userFavorite.upsert({
      where: {
        userId_productId: {
          userId,
          productId: product.id,
        },
      },
      update: {},
      create: {
        userId,
        productId: product.id,
      },
    });

    const favorites = await prisma.userFavorite.count({
      where: {
        userId,
        product: {
          isActive: true,
        },
      },
    });

    return {
      productId: product.id,
      isFavorite: true,
      total: favorites,
    };
  }

  async removeFavorite(userId, productId) {
    await this.getUserByIdOrThrow(userId);
    const normalizedProductId = this.normalizeProductId(productId);

    await prisma.userFavorite.deleteMany({
      where: {
        userId,
        productId: normalizedProductId,
      },
    });

    const favorites = await prisma.userFavorite.count({
      where: {
        userId,
        product: {
          isActive: true,
        },
      },
    });

    return {
      productId: normalizedProductId,
      isFavorite: false,
      total: favorites,
    };
  }

  async getServices(query = {}) {
    // Public booking page chỉ cần list nhẹ các dịch vụ đang bật, không cần summary/pagination admin.
    const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 100);
    const whereClause = this.buildServiceWhere(query);
    const items = await prisma.$queryRaw`
      SELECT id, name, category, price, description, createdAt, updatedAt
      FROM services
      ${whereClause}
      ORDER BY updatedAt DESC, id DESC
      LIMIT ${limit}
    `;

    return {
      items: items.map((item) => this.mapService(item)),
    };
  }

  async getBranches(query = {}) {
    // Tái dùng branch service để user namespace trả cùng nguồn dữ liệu với stores page.
    return await branchService.getBranches(query);
  }

  async getUserByIdOrThrow(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    return user;
  }

  buildCreateAppointmentData(payload = {}) {
    const source = payload && typeof payload === "object" ? payload : {};
    const allowedFields = ["serviceName", "appointmentAt", "amount", "branchId"];
    const forbiddenFields = [
      "id",
      "userId",
      "status",
      "createdAt",
      "updatedAt",
    ];

    // Chặn user tự truyền các field hệ thống hoặc cố đặt lịch cho tài khoản khác.
    const hasForbiddenField = forbiddenFields.some((field) =>
      Object.prototype.hasOwnProperty.call(source, field),
    );
    if (hasForbiddenField) {
      throw new Error("Trường đặt lịch không hợp lệ");
    }

    const hasAllowedField = allowedFields.some((field) =>
      Object.prototype.hasOwnProperty.call(source, field),
    );
    if (!hasAllowedField) {
      throw new Error("Thiếu dữ liệu đặt lịch");
    }

    const serviceName = this.normalizeProfileString(
      source.serviceName,
      "Dịch vụ",
      {
        required: true,
      },
    );
    this.validateMaxLength(serviceName, 255, "Dịch vụ không hợp lệ");

    const appointmentDate = new Date(source.appointmentAt);
    if (Number.isNaN(appointmentDate.getTime())) {
      throw new Error("Thời gian lịch hẹn không hợp lệ");
    }

    if (appointmentDate.getTime() <= Date.now()) {
      throw new Error("Thời gian lịch hẹn phải ở tương lai");
    }

    const normalizedAmount = Number(source.amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount < 0) {
      throw new Error("Số tiền không hợp lệ");
    }

    const normalizedBranchId = branchService.normalizeBranchId(source.branchId);

    return {
      serviceName,
      appointmentAt: appointmentDate,
      amount: normalizedAmount,
      branchId: normalizedBranchId,
    };
  }

  mapUserAppointment(appointment) {
    return {
      id: appointment.id,
      serviceName: appointment.serviceName,
      appointmentTime: appointment.appointmentTime || appointment.appointmentAt,
      createdAt: appointment.createdAt || null,
      amount: Number(appointment.amount || 0),
      status: appointment.status,
      paymentMethod: appointment.paymentMethod || null,
      paymentStatus: appointment.paymentStatus || null,
      paymentConfirmedAt: appointment.paymentConfirmedAt || null,
      branch: appointment.branch
        ? {
            id: appointment.branch.id,
            name: appointment.branch.name,
            city: appointment.branch.city,
            district: appointment.branch.district,
            address: appointment.branch.address,
          }
        : null,
    };
  }

  async getAppointments(userId, query = {}) {
    await this.getUserByIdOrThrow(userId);

    // Chuẩn hóa pagination để user history page luôn nhận số trang hợp lệ kể cả khi query bị thiếu.
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          userId,
        },
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              city: true,
              district: true,
              address: true,
            },
          },
        },
        orderBy: [{ appointmentAt: "desc" }, { id: "desc" }],
        skip,
        take: limit,
      }),
      prisma.appointment.count({
        where: {
          userId,
        },
      }),
    ]);

    return {
      items: items.map((item) => this.mapUserAppointment(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async createAppointment(userId, payload = {}) {
    const currentUser = await this.getUserByIdOrThrow(userId);

    // Validate payload booking trước khi tái dùng luồng tạo lịch hẹn hiện có của admin service.
    const data = this.buildCreateAppointmentData(payload);
    await branchService.getActiveBranchByIdOrThrow(data.branchId);

    const appointment = await adminService.createAppointment({
      userId,
      ...data,
    });

    const bookingRecipientEmail = String(currentUser?.email || appointment?.customerEmail || "").trim();
    const bookingCustomerName =
      [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ").trim() ||
      currentUser?.username ||
      appointment?.customerName ||
      bookingRecipientEmail ||
      "Khách hàng";

    // Luôn ưu tiên gửi về đúng email của user đang đăng nhập đặt lịch.
    Promise.resolve(
      emailService.sendBookingConfirmationEmail(bookingRecipientEmail, {
        ...appointment,
        customerEmail: bookingRecipientEmail,
        customerName: bookingCustomerName,
      }),
    ).catch((error) => {
      console.error("Send booking confirmation email failed:", {
        appointmentId: String(appointment.id || ""),
        email: bookingRecipientEmail || null,
        message: error?.message || String(error),
      });
    });

    return this.mapUserAppointment(appointment);
  }

  async createOrder(userId, payload = {}) {
    await this.getUserByIdOrThrow(userId);

    // Giữ /api/user/orders chỉ cho COD/chuyển khoản, còn MoMo đi qua module riêng /api/momo.
    return await orderService.createOrder(userId, payload, {
      allowedPaymentMethods: ["BANK_TRANSFER", "COD"],
    });
  }

  async updateProfile(userId, payload = {}) {
    const data = this.buildUpdateProfileData(payload);

    // Kiểm tra user hiện tại còn tồn tại trước khi cập nhật profile.
    await this.getUserByIdOrThrow(userId);

    if (Object.prototype.hasOwnProperty.call(data, "username")) {
      // Chặn trùng username với tài khoản khác để dữ liệu hiển thị luôn nhất quán.
      const existedUser = await prisma.user.findFirst({
        where: {
          username: data.username,
          id: {
            not: userId,
          },
        },
        select: {
          id: true,
        },
      });

      if (existedUser) {
        throw new Error("Tên đăng nhập đã tồn tại");
      }
    }

    return await prisma.user.update({
      where: { id: userId },
      data,
      select: this.getUserProfileSelect(),
    });
  }

  async changePassword(userId, payload = {}) {
    const { currentPassword, newPassword } = this.normalizeChangePasswordPayload(payload);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new Error("Mật khẩu hiện tại không đúng");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Đổi mật khẩu và revoke toàn bộ refresh token cũ để buộc đăng nhập lại bằng mật khẩu mới.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
      }),
      prisma.refreshToken.updateMany({
        where: {
          userId,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      }),
    ]);

    return {
      changed: true,
    };
  }

  deleteUploadedFile(filePath) {
    if (!filePath) {
      return;
    }

    try {
      fs.unlinkSync(filePath);
    } catch {
      // Nếu file đã bị xóa trước đó thì bỏ qua để không làm hỏng flow cập nhật avatar.
    }
  }

  buildAvatarUrl(req, fileName) {
    const origin = `${req.protocol}://${req.get("host")}`;
    return `${origin}/uploads/avatars/${fileName}`;
  }

  async updateAvatar(req, userId, payload = {}) {
    const source = payload && typeof payload === "object" ? payload : {};
    const hasAvatarField = Object.prototype.hasOwnProperty.call(
      source,
      "avatar",
    );
    const hasUploadedFile = Boolean(req.file);
    const onlyAvatarField = Object.keys(source).every(
      (field) => field === "avatar",
    );

    if (!hasUploadedFile && !hasAvatarField) {
      throw new Error("Không có dữ liệu cập nhật");
    }

    if (!onlyAvatarField) {
      this.deleteUploadedFile(req.file?.path);
      throw new Error("Trường cập nhật không hợp lệ");
    }

    await this.getUserByIdOrThrow(userId);

    let nextAvatar;

    if (hasUploadedFile) {
      // Khi frontend upload file từ desktop thì ưu tiên dùng file vừa nhận để tạo avatar URL mới.
      nextAvatar = this.buildAvatarUrl(req, req.file.filename);
    } else {
      nextAvatar = this.normalizeAvatar(source.avatar);
    }

    try {
      return await prisma.user.update({
        where: { id: userId },
        data: {
          avatar: nextAvatar,
        },
        select: this.getUserProfileSelect(),
      });
    } catch (error) {
      this.deleteUploadedFile(req.file?.path);
      throw error;
    }
  }
}

module.exports = new UserService();
