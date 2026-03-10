const fs = require("fs");
const multer = require("multer");

const newsUploadDir = "uploads/news";
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(newsUploadDir, { recursive: true });
    cb(null, newsUploadDir);
  },
  filename: (_req, file, cb) => {
    const originalNameParts = String(file.originalname || "").split(".");
    const rawExtension = originalNameParts.length > 1 ? `.${originalNameParts.pop()}` : ".jpg";
    const safeExtension = rawExtension.toLowerCase();
    const fileName = `news-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`;
    cb(null, fileName);
  },
});

const uploader = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    // Chỉ cho phép upload file ảnh để tránh lưu nhầm tài liệu hoặc file không hợp lệ cho bài viết.
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF"));
    }

    cb(null, true);
  },
}).single("thumbnailFile");

const uploadNewsThumbnail = (req, res, next) => {
  uploader(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.error("Kích thước ảnh bài viết tối đa là 5MB", 400);
    }

    return res.error(error?.message || "Không thể upload ảnh bài viết", 400);
  });
};

module.exports = uploadNewsThumbnail;
