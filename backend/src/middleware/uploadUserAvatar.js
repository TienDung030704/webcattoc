const fs = require("fs");
const multer = require("multer");

const avatarUploadDir = "uploads/avatars";
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(avatarUploadDir, { recursive: true });
    cb(null, avatarUploadDir);
  },
  filename: (_req, file, cb) => {
    const originalNameParts = String(file.originalname || "").split(".");
    const rawExtension = originalNameParts.length > 1 ? `.${originalNameParts.pop()}` : ".jpg";
    const safeExtension = rawExtension.toLowerCase();
    const fileName = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`;
    cb(null, fileName);
  },
});

const uploader = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    // Chỉ cho phép upload file ảnh vào avatar để tránh lưu nhầm file không hợp lệ.
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF"));
    }

    cb(null, true);
  },
}).single("avatar");

const uploadUserAvatar = (req, res, next) => {
  uploader(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.error("Kích thước ảnh tối đa là 5MB", 400);
    }

    return res.error(error?.message || "Không thể upload ảnh đại diện", 400);
  });
};

module.exports = uploadUserAvatar;
