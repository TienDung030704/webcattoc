const fs = require("fs");
const path = require("path");

const prisma = require("@/libs/prisma");

class NewsService {
  getDefaultLimit() {
    return 10;
  }

  getMaxLimit() {
    return 50;
  }

  normalizePositiveInteger(value, fallback) {
    if (value == null || String(value).trim() === "") {
      return fallback;
    }

    const normalizedValue = String(value).trim();
    if (!/^\d+$/.test(normalizedValue)) {
      throw new Error("Tham số phân trang không hợp lệ");
    }

    const parsedValue = Number(normalizedValue);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      throw new Error("Tham số phân trang không hợp lệ");
    }

    return parsedValue;
  }

  normalizePagination(query = {}) {
    const page = this.normalizePositiveInteger(query.page, 1);
    const requestedLimit = this.normalizePositiveInteger(
      query.limit,
      this.getDefaultLimit(),
    );
    const limit = Math.min(requestedLimit, this.getMaxLimit());

    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  normalizeTitle(value, { required = false } = {}) {
    if (value == null || String(value).trim() === "") {
      if (required) {
        throw new Error("Tiêu đề bài viết là bắt buộc");
      }

      return undefined;
    }

    return String(value).trim();
  }

  normalizeContent(value, { required = false } = {}) {
    if (value == null || String(value).trim() === "") {
      if (required) {
        throw new Error("Nội dung bài viết là bắt buộc");
      }

      return undefined;
    }

    return String(value).trim();
  }

  normalizeSummary(value) {
    if (value == null) {
      return null;
    }

    const normalizedSummary = String(value).trim();
    return normalizedSummary || null;
  }

  normalizeThumbnail(value) {
    if (value == null) {
      return null;
    }

    const normalizedThumbnail = String(value).trim();
    return normalizedThumbnail || null;
  }

  deleteUploadedFile(filePath) {
    if (!filePath) {
      return;
    }

    try {
      fs.unlinkSync(filePath);
    } catch {
      // Nếu file đã bị xóa trước đó thì bỏ qua để không làm hỏng flow chính.
    }
  }

  isLocalNewsUploadUrl(imageUrl) {
    return typeof imageUrl === "string" && imageUrl.includes("/uploads/news/");
  }

  getFilePathFromUploadUrl(imageUrl) {
    if (!this.isLocalNewsUploadUrl(imageUrl)) {
      return null;
    }

    const marker = "/uploads/news/";
    const markerIndex = imageUrl.indexOf(marker);
    if (markerIndex === -1) {
      return null;
    }

    const fileName = imageUrl.slice(markerIndex + marker.length);
    if (!fileName) {
      return null;
    }

    return path.join(process.cwd(), "uploads", "news", fileName);
  }

  buildUploadedThumbnailUrl(req, fileName) {
    const origin = `${req.protocol}://${req.get("host")}`;
    return `${origin}/uploads/news/${fileName}`;
  }

  resolveThumbnail(req, payload = {}, file) {
    const source = payload && typeof payload === "object" ? payload : {};

    if (file) {
      // Khi admin upload file từ desktop thì ưu tiên dùng file vừa nhận để tạo thumbnail URL mới.
      return this.buildUploadedThumbnailUrl(req, file.filename);
    }

    return this.normalizeThumbnail(source.thumbnail);
  }

  slugify(value) {
    const normalizedSource = String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!normalizedSource) {
      throw new Error("Slug bài viết không hợp lệ");
    }

    return normalizedSource;
  }

  normalizeSlug(slug, { required = false } = {}) {
    if (slug == null || String(slug).trim() === "") {
      if (required) {
        throw new Error("Slug bài viết không hợp lệ");
      }

      return undefined;
    }

    return this.slugify(slug);
  }

  normalizeIsPublished(value, { defaultValue } = {}) {
    if (value === undefined) {
      return defaultValue;
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalizedValue = value.trim().toLowerCase();

      if (normalizedValue === "true") {
        return true;
      }

      if (normalizedValue === "false") {
        return false;
      }
    }

    throw new Error("Trạng thái hiển thị bài viết không hợp lệ");
  }

  getPublicNewsSelect() {
    return {
      id: true,
      title: true,
      slug: true,
      summary: true,
      content: true,
      thumbnail: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  getAdminNewsSelect() {
    return {
      ...this.getPublicNewsSelect(),
      isPublished: true,
    };
  }

  mapNewsSummary(item) {
    // Giữ cả field canonical và alias để frontend hiện tại hoặc tương lai dùng linh hoạt hơn.
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      excerpt: item.summary,
      thumbnail: item.thumbnail,
      image: item.thumbnail,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  mapNewsDetail(item) {
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      content: item.content,
      thumbnail: item.thumbnail,
      image: item.thumbnail,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  mapAdminNews(item) {
    // Thêm isPublished cho admin để frontend quản lý trạng thái publish/draft dễ hơn.
    return {
      ...this.mapNewsDetail(item),
      isPublished: Boolean(item.isPublished),
    };
  }

  mapAdminNewsListItem(item) {
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      excerpt: item.summary,
      content: item.content,
      thumbnail: item.thumbnail,
      image: item.thumbnail,
      isPublished: Boolean(item.isPublished),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  buildAdminNewsWhere(query = {}) {
    const where = {};
    const search = String(query.search || "").trim();
    const isPublished = String(query.isPublished || "").trim().toLowerCase();

    if (isPublished === "true") {
      where.isPublished = true;
    }

    if (isPublished === "false") {
      where.isPublished = false;
    }

    if (search) {
      const orConditions = [
        {
          title: {
            contains: search,
          },
        },
        {
          slug: {
            contains: search,
          },
        },
        {
          summary: {
            contains: search,
          },
        },
      ];

      // Cho phép admin tìm nhanh theo id khi nhập chuỗi số ở ô search.
      if (/^\d+$/.test(search)) {
        try {
          orConditions.push({
            id: BigInt(search),
          });
        } catch {
          // Bỏ qua điều kiện id nếu chuỗi số không parse được sang BigInt.
        }
      }

      where.OR = orConditions;
    }

    return where;
  }

  async ensureSlugUnique(slug, excludeId) {
    const existingNews = await prisma["new"].findFirst({
      where: excludeId
        ? {
            slug,
            NOT: {
              id: excludeId,
            },
          }
        : {
            slug,
          },
      select: {
        id: true,
      },
    });

    if (existingNews) {
      throw new Error("Slug bài viết đã tồn tại");
    }
  }

  async getNewsByIdOrThrow(newsId) {
    // Tách truy vấn dùng lại để mọi API cập nhật/xóa cùng thống nhất lỗi không tìm thấy.
    const item = await prisma["new"].findUnique({
      where: {
        id: newsId,
      },
      select: this.getAdminNewsSelect(),
    });

    if (!item) {
      throw new Error("Không tìm thấy bài viết");
    }

    return item;
  }

  buildCreateNewsData(req, payload = {}, file) {
    const source = payload && typeof payload === "object" ? payload : {};
    const title = this.normalizeTitle(source.title, { required: true });

    // Chuẩn hóa payload tạo mới trước khi ghi DB để controller chỉ tập trung điều phối HTTP.
    return {
      title,
      slug: Object.prototype.hasOwnProperty.call(source, "slug")
        ? this.normalizeSlug(source.slug, { required: true })
        : this.slugify(title),
      summary: this.normalizeSummary(source.summary),
      content: this.normalizeContent(source.content, { required: true }),
      thumbnail: this.resolveThumbnail(req, source, file),
      isPublished: this.normalizeIsPublished(source.isPublished, {
        defaultValue: false,
      }),
    };
  }

  buildUpdateNewsData(req, payload = {}, file) {
    const source = payload && typeof payload === "object" ? payload : {};
    const data = {};
    const supportedFields = [
      "title",
      "slug",
      "summary",
      "content",
      "thumbnail",
      "isPublished",
    ];
    const hasSupportedField = supportedFields.some((field) =>
      Object.prototype.hasOwnProperty.call(source, field),
    );
    const hasUploadedThumbnail = Boolean(file);

    if (!hasSupportedField && !hasUploadedThumbnail) {
      throw new Error("Không có dữ liệu cập nhật");
    }

    // Chỉ nhận các field backend cho phép cập nhật để tránh ghi nhầm payload thừa.
    if (Object.prototype.hasOwnProperty.call(source, "title")) {
      data.title = this.normalizeTitle(source.title, { required: true });
    }

    if (Object.prototype.hasOwnProperty.call(source, "slug")) {
      data.slug = this.normalizeSlug(source.slug, { required: true });
    }

    if (Object.prototype.hasOwnProperty.call(source, "summary")) {
      data.summary = this.normalizeSummary(source.summary);
    }

    if (Object.prototype.hasOwnProperty.call(source, "content")) {
      data.content = this.normalizeContent(source.content, { required: true });
    }

    if (Object.prototype.hasOwnProperty.call(source, "thumbnail") || hasUploadedThumbnail) {
      data.thumbnail = this.resolveThumbnail(req, source, file);
    }

    if (Object.prototype.hasOwnProperty.call(source, "isPublished")) {
      data.isPublished = this.normalizeIsPublished(source.isPublished);
    }

    return data;
  }

  async getNews(query = {}) {
    const { page, limit, skip } = this.normalizePagination(query);
    const where = {
      isPublished: true,
    };

    const [items, total] = await Promise.all([
      prisma["new"].findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: this.getPublicNewsSelect(),
      }),
      prisma["new"].count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapNewsSummary(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getNewsDetail(slug) {
    const normalizedSlug = this.normalizeSlug(slug, { required: true });
    const item = await prisma["new"].findFirst({
      where: {
        slug: normalizedSlug,
        isPublished: true,
      },
      select: this.getPublicNewsSelect(),
    });

    if (!item) {
      throw new Error("Không tìm thấy bài viết");
    }

    return this.mapNewsDetail(item);
  }

  async getAdminNews(query = {}) {
    const { page, limit, skip } = this.normalizePagination(query);
    const where = this.buildAdminNewsWhere(query);

    const [items, total, totalNews, publishedNews] = await Promise.all([
      prisma["new"].findMany({
        where,
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: limit,
        select: this.getAdminNewsSelect(),
      }),
      prisma["new"].count({ where }),
      prisma["new"].count(),
      prisma["new"].count({
        where: {
          isPublished: true,
        },
      }),
    ]);

    return {
      items: items.map((item) => this.mapAdminNewsListItem(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalNews,
        publishedNews,
        draftNews: Math.max(totalNews - publishedNews, 0),
      },
    };
  }

  async getAdminNewsById(newsId) {
    const item = await this.getNewsByIdOrThrow(newsId);
    return this.mapAdminNews(item);
  }

  async createNews(req, payload, file) {
    const data = this.buildCreateNewsData(req, payload, file);
    await this.ensureSlugUnique(data.slug);

    try {
      const item = await prisma["new"].create({
        data,
        select: this.getAdminNewsSelect(),
      });

      return this.mapAdminNews(item);
    } catch (error) {
      this.deleteUploadedFile(file?.path);
      throw error;
    }
  }

  async updateNews(req, newsId, payload, file) {
    const currentNews = await this.getNewsByIdOrThrow(newsId);
    const data = this.buildUpdateNewsData(req, payload, file);

    if (Object.prototype.hasOwnProperty.call(data, "slug")) {
      await this.ensureSlugUnique(data.slug, newsId);
    }

    try {
      const item = await prisma["new"].update({
        where: {
          id: newsId,
        },
        data,
        select: this.getAdminNewsSelect(),
      });

      if (
        file &&
        data.thumbnail &&
        currentNews.thumbnail &&
        currentNews.thumbnail !== data.thumbnail
      ) {
        this.deleteUploadedFile(this.getFilePathFromUploadUrl(currentNews.thumbnail));
      }

      return this.mapAdminNews(item);
    } catch (error) {
      this.deleteUploadedFile(file?.path);
      throw error;
    }
  }

  async deleteNews(newsId) {
    const item = await this.getNewsByIdOrThrow(newsId);

    // Xóa cứng để khớp với yêu cầu CRUD quản trị hiện tại cho bài viết.
    await prisma["new"].delete({
      where: {
        id: newsId,
      },
    });

    this.deleteUploadedFile(this.getFilePathFromUploadUrl(item.thumbnail));

    return {
      id: item.id,
      message: "Xóa bài viết thành công",
    };
  }
}

module.exports = new NewsService();
