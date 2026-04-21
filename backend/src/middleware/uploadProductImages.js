const fs = require("fs");
const multer = require("multer");

const productUploadDir = "uploads/products";
const maxProductImages = 6;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(productUploadDir, { recursive: true });
    cb(null, productUploadDir);
  },
  filename: (_req, file, cb) => {
    const originalNameParts = String(file.originalname || "").split(".");
    const rawExtension = originalNameParts.length > 1 ? `.${originalNameParts.pop()}` : ".jpg";
    const safeExtension = rawExtension.toLowerCase();
    const fileName = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`;
    cb(null, fileName);
  },
});

const uploader = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: maxProductImages,
  },
  fileFilter: (_req, file, cb) => {
    // Chỉ nhận file ảnh để tránh lưu nhầm tài liệu hoặc file không hợp lệ vào gallery sản phẩm.
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF"));
    }

    cb(null, true);
  },
}).array("images", maxProductImages);

const uploadProductImages = (req, res, next) => {
  uploader(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.error("Kích thước mỗi ảnh tối đa là 5MB", 400);
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_COUNT") {
      return res.error(`Tối đa ${maxProductImages} ảnh cho mỗi sản phẩm`, 400);
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.error(`Tối đa ${maxProductImages} ảnh cho mỗi sản phẩm`, 400);
    }

    return res.error(error?.message || "Không thể upload ảnh sản phẩm", 400);
  });
};

module.exports = uploadProductImages;
