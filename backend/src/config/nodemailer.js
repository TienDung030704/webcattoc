const nodemailer = require("nodemailer");

function normalizeMailCredential(value) {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "";
  }

  // Gmail app password thường được Google hiển thị có khoảng trắng giữa các cụm ký tự, nhưng SMTP cần chuỗi liền nhau.
  return normalizedValue.replace(/\s+/g, "");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: normalizeMailCredential(process.env.GOOGLE_APP_USER),
    pass: normalizeMailCredential(process.env.GOOGLE_APP_PASSWORD),
  },
});

module.exports = transporter;
