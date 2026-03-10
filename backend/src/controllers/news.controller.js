const newsService = require("@/services/news.service");

const parseNewsId = (value) => {
  try {
    // Parse id sang BigInt để khớp kiểu id bigint hiện dùng ở bảng news.
    return BigInt(value);
  } catch {
    throw new Error("Id bài viết không hợp lệ");
  }
};

const getNewsErrorStatus = (message) => {
  return message === "Không tìm thấy bài viết" ? 404 : 400;
};

const getNews = async (req, res) => {
  try {
    // Forward query pagination từ public news page xuống service để chuẩn hóa tại một chỗ.
    const data = await newsService.getNews(req.query);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể tải danh sách bài viết";
    res.error(message, getNewsErrorStatus(message));
  }
};

const getNewsDetail = async (req, res) => {
  try {
    // Trả chi tiết 1 bài viết public theo slug để frontend có thể dùng URL thân thiện.
    const data = await newsService.getNewsDetail(req.params.slug);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể tải chi tiết bài viết";
    res.error(message, getNewsErrorStatus(message));
  }
};

const getAdminNews = async (req, res) => {
  try {
    // Admin cần list cả draft lẫn published để quản lý bài viết thật trong dashboard.
    const data = await newsService.getAdminNews(req.query);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể tải danh sách bài viết quản trị";
    res.error(message, getNewsErrorStatus(message));
  }
};

const getAdminNewsById = async (req, res) => {
  try {
    // Admin đọc chi tiết theo id để xem được cả các bài chưa publish.
    const newsId = parseNewsId(req.params.id);
    const data = await newsService.getAdminNewsById(newsId);
    res.success(data);
  } catch (error) {
    const message = error?.message || "Không thể tải chi tiết bài viết";
    res.error(message, getNewsErrorStatus(message));
  }
};

const createNews = async (req, res) => {
  try {
    const data = await newsService.createNews(req, req.body, req.file);
    res.success(data, 201);
  } catch (error) {
    // Chuẩn hóa message/status để frontend admin dễ xử lý lỗi tạo bài viết.
    const message = error?.message || "Không thể tạo bài viết";
    res.error(message, getNewsErrorStatus(message));
  }
};

const updateNews = async (req, res) => {
  try {
    const newsId = parseNewsId(req.params.id);
    const data = await newsService.updateNews(req, newsId, req.body, req.file);
    res.success(data);
  } catch (error) {
    // Chuẩn hóa message/status để frontend admin dễ xử lý lỗi cập nhật bài viết.
    const message = error?.message || "Không thể cập nhật bài viết";
    res.error(message, getNewsErrorStatus(message));
  }
};

const deleteNews = async (req, res) => {
  try {
    const newsId = parseNewsId(req.params.id);
    const data = await newsService.deleteNews(newsId);
    res.success(data);
  } catch (error) {
    // Chuẩn hóa message/status để frontend admin dễ xử lý lỗi xóa bài viết.
    const message = error?.message || "Không thể xóa bài viết";
    res.error(message, getNewsErrorStatus(message));
  }
};

module.exports = {
  getNews,
  getNewsDetail,
  getAdminNews,
  getAdminNewsById,
  createNews,
  updateNews,
  deleteNews,
};
