const prisma = require("@/libs/prisma");
const { Prisma } = require("../../generated/client");

class AdminServiceService {
  mapService(service) {
    // Chuẩn hóa dữ liệu dịch vụ để frontend/admin không phụ thuộc trực tiếp vào kiểu raw query.
    return {
      id: service.id,
      name: service.name,
      category: service.category,
      price: Number(service.price || 0),
      description: service.description,
      isActive: Boolean(service.isActive),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }

  normalizeName(value, { required = false } = {}) {
    if (value == null || String(value).trim() === "") {
      if (required) {
        throw new Error("Tên dịch vụ là bắt buộc");
      }

      return undefined;
    }

    return String(value).trim();
  }

  normalizeCategory(value, { required = false } = {}) {
    if (value == null || String(value).trim() === "") {
      if (required) {
        throw new Error("Danh mục dịch vụ là bắt buộc");
      }

      return undefined;
    }
    return String(value).trim();
  }

  normalizePrice(value, { required = false } = {}) {
    if (value == null || value === "") {
      if (required) {
        throw new Error("Giá dịch vụ là bắt buộc");
      }

      return undefined;
    }
    const normalizedPrice = Number(value);
    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      throw new Error("Giá dịch vụ không hợp lệ");
    }

    return normalizedPrice;
  }

  normalizeDescription(value) {
    if (value == null) {
      return null;
    }

    const normalizedDescription = String(value).trim();
    return normalizedDescription || null;
  }

  buildServiceWhere(query = {}) {
    // Gom toàn bộ điều kiện filter/search thành 1 SQL fragment để tái sử dụng cho list và count.
    const conditions = [];
    const search = String(query.search || "").trim();
    const isActive = String(query.isActive || "").trim().toLowerCase();
    const category = String(query.category || "").trim();

    if (isActive === "true") {
      conditions.push(Prisma.sql`isActive = ${true}`);
    }

    if (isActive === "false") {
      conditions.push(Prisma.sql`isActive = ${false}`);
    }

    if (category) {
      conditions.push(Prisma.sql`category = ${category}`);
    }

    if (search) {
      const likeSearch = `%${search}%`;
      const searchConditions = [
        Prisma.sql`name LIKE ${likeSearch}`,
        Prisma.sql`category LIKE ${likeSearch}`,
        Prisma.sql`description LIKE ${likeSearch}`,
      ];

      // Cho phép admin tìm nhanh theo id khi nhập chuỗi số ở ô search.
      if (/^\d+$/.test(search)) {
        searchConditions.push(Prisma.sql`id = ${BigInt(search)}`);
      }

      conditions.push(
        Prisma.sql`(${Prisma.join(searchConditions, Prisma.sql` OR `)})`,
      );
    }

    if (conditions.length === 0) {
      return Prisma.empty;
    }

    return Prisma.sql`WHERE ${Prisma.join(conditions, Prisma.sql` AND `)}`;
  }

  buildCreateServiceData(payload = {}) {
    const source = payload && typeof payload === "object" ? payload : {};

    // Chuẩn hóa payload tạo mới trước khi ghi DB để controller chỉ làm nhiệm vụ điều phối HTTP.
    return {
      name: this.normalizeName(source.name, { required: true }),
      category: this.normalizeCategory(source.category, { required: true }),
      price: this.normalizePrice(source.price, { required: true }),
      description: this.normalizeDescription(source.description),
    };
  }

  buildUpdateServiceData(payload = {}) {
    const source = payload && typeof payload === "object" ? payload : {};
    const data = {};
    const supportedFields = ["name", "category", "price", "description"];
    const hasSupportedField = supportedFields.some((field) =>
      Object.prototype.hasOwnProperty.call(source, field),
    );

    if (!hasSupportedField) {
      throw new Error("Không có dữ liệu cập nhật");
    }

    // Chỉ lấy các field backend cho phép cập nhật để tránh ghi nhầm payload thừa.
    if (Object.prototype.hasOwnProperty.call(source, "name")) {
      data.name = this.normalizeName(source.name, { required: true });
    }

    if (Object.prototype.hasOwnProperty.call(source, "category")) {
      data.category = this.normalizeCategory(source.category, { required: true });
    }

    if (Object.prototype.hasOwnProperty.call(source, "price")) {
      data.price = this.normalizePrice(source.price, { required: true });
    }

    if (Object.prototype.hasOwnProperty.call(source, "description")) {
      data.description = this.normalizeDescription(source.description);
    }

    return data;
  }

  async getServiceByIdOrThrow(serviceId, executor = prisma) {
    // Tách truy vấn dùng lại để mọi API cập nhật/xóa cùng thống nhất lỗi không tìm thấy.
    const rows = await executor.$queryRaw`
      SELECT id, name, category, price, description, isActive, createdAt, updatedAt
      FROM services
      WHERE id = ${serviceId}
      LIMIT 1
    `;

    const service = rows[0];
    if (!service) {
      throw new Error("Không tìm thấy dịch vụ");
    }

    return service;
  }

  async getServices(query = {}) {
    // Chuẩn hóa phân trang để admin table luôn nhận dữ liệu hợp lệ.
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 8, 1), 100);
    const skip = (page - 1) * limit;
    const whereClause = this.buildServiceWhere(query);

    const [items, totalRows, summaryRows] = await Promise.all([
      prisma.$queryRaw`
        SELECT id, name, category, price, description, isActive, createdAt, updatedAt
        FROM services
        ${whereClause}
        ORDER BY updatedAt DESC, id DESC
        LIMIT ${limit} OFFSET ${skip}
      `,
      prisma.$queryRaw`
        SELECT COUNT(*) AS total
        FROM services
        ${whereClause}
      `,
      prisma.$queryRaw`
        SELECT
          COUNT(*) AS totalServices,
          SUM(CASE WHEN isActive = true THEN 1 ELSE 0 END) AS activeServices,
          SUM(CASE WHEN isActive = false THEN 1 ELSE 0 END) AS inactiveServices,
          COUNT(DISTINCT category) AS categoriesCount
        FROM services
      `,
    ]);

    const total = Number(totalRows?.[0]?.total || 0);
    const summary = summaryRows?.[0] || {};

    return {
      items: items.map((item) => this.mapService(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalServices: Number(summary.totalServices || 0),
        activeServices: Number(summary.activeServices || 0),
        inactiveServices: Number(summary.inactiveServices || 0),
        categoriesCount: Number(summary.categoriesCount || 0),
      },
    };
  }

  async createService(payload) {
    const data = this.buildCreateServiceData(payload);

    // Dùng transaction để insert và đọc lại đúng bản ghi vừa tạo trên cùng kết nối DB.
    const createdService = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO services (
          name,
          category,
          price,
          description,
          isActive,
          createdAt,
          updatedAt
        )
        VALUES (
          ${data.name},
          ${data.category},
          ${data.price},
          ${data.description},
          ${true},
          NOW(3),
          NOW(3)
        )
      `;

      const rows = await tx.$queryRaw`
        SELECT id, name, category, price, description, isActive, createdAt, updatedAt
        FROM services
        WHERE id = LAST_INSERT_ID()
        LIMIT 1
      `;

      return rows[0];
    });

    return this.mapService(createdService);
  }

  async updateService(serviceId, payload) {
    await this.getServiceByIdOrThrow(serviceId);
    const data = this.buildUpdateServiceData(payload);
    const assignments = [];
    const values = [];

    // Build danh sách field cập nhật động để PATCH chỉ ghi đúng những gì admin gửi lên.
    if (Object.prototype.hasOwnProperty.call(data, "name")) {
      assignments.push("name = ?");
      values.push(data.name);
    }

    if (Object.prototype.hasOwnProperty.call(data, "category")) {
      assignments.push("category = ?");
      values.push(data.category);
    }

    if (Object.prototype.hasOwnProperty.call(data, "price")) {
      assignments.push("price = ?");
      values.push(data.price);
    }

    if (Object.prototype.hasOwnProperty.call(data, "description")) {
      assignments.push("description = ?");
      values.push(data.description);
    }

    assignments.push("updatedAt = NOW(3)");
    values.push(serviceId);

    await prisma.$executeRawUnsafe(
      `UPDATE services SET ${assignments.join(", ")} WHERE id = ?`,
      ...values,
    );

    const updatedService = await this.getServiceByIdOrThrow(serviceId);
    return this.mapService(updatedService);
  }

  async deleteService(serviceId) {
    const deletedService = await this.getServiceByIdOrThrow(serviceId);

    // Xóa cứng theo đúng yêu cầu quản lý dịch vụ hiện tại; appointment cũ vẫn an toàn vì chỉ lưu serviceName.
    await prisma.$executeRaw`
      DELETE FROM services
      WHERE id = ${serviceId}
    `;

    return {
      id: deletedService.id,
      message: "Xóa dịch vụ thành công",
    };
  }
}

module.exports = new AdminServiceService();
