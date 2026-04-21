const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");
const prisma = require("@/libs/prisma");
const authConfig = require("@/config/authConfig");

class EmailService {
  getSenderAddress() {
    return process.env.GOOGLE_APP_USER || "no-reply@webcattoc.local";
  }

  getCustomerDisplayName(booking = {}) {
    return String(booking?.customerName || booking?.customerEmail || "Khách hàng").trim();
  }

  formatAppointmentTime(value) {
    const appointmentDate = new Date(value);

    if (Number.isNaN(appointmentDate.getTime())) {
      return String(value || "Không xác định").trim() || "Không xác định";
    }

    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(appointmentDate);
  }

  formatCurrency(amount) {
    const normalizedAmount = Number(amount || 0);

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number.isFinite(normalizedAmount) ? normalizedAmount : 0);
  }

  buildBookingConfirmationContent(booking = {}) {
    const bookingId = String(booking?.id || "").trim() || "N/A";
    const customerName = this.getCustomerDisplayName(booking);
    const serviceName = String(booking?.serviceName || "Dịch vụ").trim() || "Dịch vụ";
    const appointmentTime = this.formatAppointmentTime(booking?.appointmentTime);
    const amount = this.formatCurrency(booking?.amount);
    const branchName = String(booking?.branch?.name || "Chi nhánh").trim() || "Chi nhánh";
    const branchAddress = String(booking?.branch?.address || "Đang cập nhật").trim() || "Đang cập nhật";

    return {
      subject: `Xác nhận đặt lịch cắt tóc thành công #${bookingId}`,
      text: [
        `Xin chào ${customerName},`,
        "",
        "Bạn đã đăng ký lịch cắt tóc thành công tại WEBCATTOC.",
        `Mã lịch hẹn: #${bookingId}`,
        `Dịch vụ: ${serviceName}`,
        `Thời gian: ${appointmentTime}`,
        `Chi nhánh: ${branchName}`,
        `Địa chỉ: ${branchAddress}`,
        `Chi phí dự kiến: ${amount}`,
        "",
        "Cảm ơn bạn đã tin tưởng WEBCATTOC.",
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 640px; margin: 0 auto;">
          <div style="background: #120d08; color: #f9fafb; padding: 22px 24px; border-radius: 14px 14px 0 0;">
            <h1 style="margin: 0; font-size: 22px;">Thông tin đăng ký lịch cắt tóc</h1>
            <p style="margin: 8px 0 0; color: #e5d5b2;">Lịch hẹn của bạn đã được xác nhận thành công.</p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 14px 14px; padding: 24px; background: #ffffff;">
            <p style="margin-top: 0;">Xin chào <strong>${customerName}</strong>,</p>
            <p>WEBCATTOC đã nhận được đăng ký lịch cắt tóc của bạn. Dưới đây là thông tin lịch hẹn:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 18px 0;">
              <tbody>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Mã lịch hẹn</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">#${bookingId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Dịch vụ</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Thời gian</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${appointmentTime}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Chi nhánh</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${branchName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Địa chỉ</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${branchAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 0;"><strong>Chi phí dự kiến</strong></td>
                  <td style="padding: 10px 0 0; text-align: right; color: #b45309; font-weight: 700;">${amount}</td>
                </tr>
              </tbody>
            </table>
            <p style="margin-bottom: 0; color: #4b5563;">Vui lòng đến đúng giờ để được phục vụ nhanh chóng. Nếu cần hỗ trợ, bạn có thể phản hồi email này hoặc liên hệ trực tiếp với shop.</p>
          </div>
        </div>
      `,
    };
  }

  async sendVerifyEmail(email, token, subject) {
    console.log(">>> Email recipient:", email);
    try {
      const info = await transporter.sendMail({
        from: `"WEBCATTOC" <${this.getSenderAddress()}>`,
        to: email,
        subject: subject,
        text: "This is a test email sent via Ethereal!",
        html: `<p><a href="http://localhost:5173?token=${token}">Click here</a>!</p>`,
      });
      return info;
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(verifyToken) {
    try {
      const payload = jwt.verify(verifyToken, authConfig.jwtSecret);

      if (payload?.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw {
          message: "Token hết hạn",
        };
      }

      const userId = payload.sub;
      await prisma.user.update({
        where: { id: BigInt(userId) },
        data: {
          isVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async sendBookingConfirmationEmail(email, booking = {}) {
    const recipientEmail = String(email || "").trim();

    if (!recipientEmail) {
      throw new Error("Không có email người nhận để gửi xác nhận đặt lịch");
    }

    const { subject, text, html } = this.buildBookingConfirmationContent(booking);

    return await transporter.sendMail({
      from: `"WEBCATTOC" <${this.getSenderAddress()}>`,
      to: recipientEmail,
      subject,
      text,
      html,
    });
  }
}
module.exports = new EmailService();
