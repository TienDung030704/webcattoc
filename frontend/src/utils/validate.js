import { object, string, ref } from "yup";

export const registerSchema = object({
  username: string()
    .required("Tên người dùng là bắt buộc")
    .min(2, "Tối thiểu là 2 kí tự")
    .max(20, "Username tối đa 20 ký tự"),

  email: string().required("Email là bắt buộc").email("Sai định dạng email"),
  password: string()
    .required("Mật khẩu là bắt buộc")
    .min(8, "Mật khẩu ít nhất 8 kí tự"),
  password_confirmation: string().oneOf([ref("password")], "Mật khẩu kh khớp"),
});
export const loginSchema = object({
  email: string().required("Email là bắt buộc").email("Sai định dạng email"),
  password: string()
    .required("Mật khẩu là bắt buộc")
    .min(8, "Mật khẩu ít nhất 8 kí tự"),
});

export const forgotSchema = object({
  email: string().required("Email là bắt buộc").email("Sai định dạng email"),
});

export const resetSchema = object({
  email: string().required("Email là bắt buộc").email("Sai định dạng email"),
  password: string()
    .required("Mật khẩu là bắt buộc")
    .min(8, "Mật khẩu ít nhất 8 kí tự"),
  password_confirmation: string().oneOf([ref("password")], "Mật khẩu kh khớp"),
});

export const changePasswordSchema = object({
  currentPassword: string()
    .required("Mật khẩu hiện tại là bắt buộc")
    .min(8, "Mật khẩu hiện tại ít nhất 8 kí tự"),
  newPassword: string()
    .required("Mật khẩu mới là bắt buộc")
    .min(8, "Mật khẩu mới ít nhất 8 kí tự"),
  confirmPassword: string().oneOf([ref("newPassword")], "Mật khẩu xác nhận không khớp"),
});
