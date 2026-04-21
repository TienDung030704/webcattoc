import { useEffect, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Camera, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import { useGetCurrentUser } from "@/features/Auth/hook";
import http from "@/utils/http";
import { changePasswordSchema } from "@/utils/validate";

const PROFILE_TAB = "profile";
const PASSWORD_TAB = "password";

const getInitialFormValues = (user) => ({
  username: user?.username || "",
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  avatar: user?.avatar || "",
});

function InformationIndividualPage() {
  const currentUser = useGetCurrentUser();
  const navigate = useNavigate();
  const avatarFileInputRef = useRef(null);
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));
  const [activeTab, setActiveTab] = useState(PROFILE_TAB);
  const [formValues, setFormValues] = useState(() =>
    getInitialFormValues(currentUser),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvatarSubmitting, setIsAvatarSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const {
    register: registerPasswordField,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: yupResolver(changePasswordSchema),
  });

  useEffect(() => {
    setFormValues(getInitialFormValues(currentUser));
  }, [currentUser]);

  useEffect(() => {
    // Mỗi lần đổi tab hoặc đổi user thì reset form mật khẩu để không giữ lại dữ liệu nhạy cảm.
    resetPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [activeTab, currentUser, resetPasswordForm]);

  const displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    currentUser?.username ||
    "Khách hàng";
  const avatarLetter = (displayName?.trim()?.[0] || "K").toUpperCase();

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const syncUpdatedUser = (updatedUser) => {
    if (!updatedUser) return;

    localStorage.setItem("user_data", JSON.stringify(updatedUser));

    // Báo cho các component đang đọc user từ hook cập nhật lại ngay.
    window.dispatchEvent(new Event("user-data-updated"));
    setFormValues(getInitialFormValues(updatedUser));
  };

  const clearAuthStorage = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    window.dispatchEvent(new Event("user-data-updated"));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Form thông tin cá nhân chỉ gọi API profile chung, không cập nhật avatar ở đây nữa.
      const response = await http.patch("user/profile", {
        username: formValues.username,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
      });

      syncUpdatedUser(response?.data);

      toast.success("Cập nhật thông tin thành công", {
        position: "top-right",
      });
    } catch (error) {
      const message =
        error?.response?.data?.error || "Không thể cập nhật thông tin";
      toast.error(message, {
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = handlePasswordSubmit(async (values) => {
    if (isPasswordSubmitting) return;

    try {
      setIsPasswordSubmitting(true);

      await http.patch("user/profile/password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      // Đổi mật khẩu xong thì logout local luôn để user đăng nhập lại bằng mật khẩu mới.
      clearAuthStorage();
      resetPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Đổi mật khẩu thành công, vui lòng đăng nhập lại", {
        position: "top-right",
      });
      navigate("/auth/login", { replace: true });
    } catch (error) {
      const message = error?.response?.data?.error || "Không thể đổi mật khẩu";
      toast.error(message, {
        position: "top-right",
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  });

  const handleUpdateAvatar = async (file) => {
    if (!file || isAvatarSubmitting) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsAvatarSubmitting(true);

      // Khi người dùng chọn ảnh từ desktop thì gửi multipart lên API avatar riêng.
      const response = await http.patch("user/profile/avatar", formData);

      syncUpdatedUser(response?.data);

      toast.success("Cập nhật ảnh đại diện thành công", {
        position: "top-right",
      });
    } catch (error) {
      const message =
        error?.response?.data?.error || "Không thể cập nhật ảnh đại diện";
      toast.error(message, {
        position: "top-right",
      });
    } finally {
      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = "";
      }
      setIsAvatarSubmitting(false);
    }
  };

  const handleOpenAvatarPicker = () => {
    avatarFileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event) => {
    const file = event.target.files?.[0];
    await handleUpdateAvatar(file);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Header>
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#120d08]/90 backdrop-blur-md">
          <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-6 lg:px-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/logo-web.png"
                alt="WEBCATTOC"
                className="h-14 w-auto object-contain"
              />
              <span className="text-base font-bold tracking-wide text-[#e8cf9d]">
                MDT BaberShop
              </span>
            </Link>

            <nav className="mx-auto hidden min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden text-sm text-white/70 md:flex">
              <Link
                to="/"
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Trang chủ
              </Link>
              <Link
                to="/service"
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Dịch vụ
              </Link>
              <Link
                to="/product"
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Sản phẩm
              </Link>
              <Link
                to="/news"
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Tin tức
              </Link>
              <Link
                to="/stores"
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Hệ thống cửa hàng
              </Link>
              <Link
                to="/contact"
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Liên hệ
              </Link>
            </nav>

            <HeaderAuthArea />
          </div>
        </header>
      </Header>

      <main>
        <section className="relative h-[260px] overflow-hidden md:h-[320px] lg:h-[360px]">
          <img
            src="/bg-cuthair-2.png"
            alt="Thông tin cá nhân"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(4,4,4,0.35),rgba(4,4,4,0.6),rgba(4,4,4,0.92))]" />
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <div className="max-w-4xl">
              <h1 className="profile-hero-reveal text-4xl font-black tracking-[0.06em] text-[#f6e7c7] uppercase md:text-6xl lg:text-7xl">
                Thông tin cá nhân
              </h1>
              <p className="profile-hero-reveal profile-hero-delay-1 mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/80 md:text-base md:leading-8 lg:text-lg">
                Quản lý hồ sơ tài khoản của bạn tại MDT BaberShop.
              </p>
            </div>
          </div>
        </section>

        <section
          className="relative overflow-hidden px-4 pt-10 pb-20 md:px-8 md:pt-14 md:pb-24"
          style={{
            backgroundImage:
              "linear-gradient(rgba(4,4,4,0.96), rgba(4,4,4,0.985)), radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 32%), url('/bg-cuthair.png')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/45">
              <Link to="/" className="transition hover:text-white/75">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-[#d8b77a]">Thông tin cá nhân</span>
            </div>

            {!isLoggedIn ? (
              <div className="profile-panel-reveal rounded-[26px] border border-white/10 bg-[#17100b]/92 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:p-10">
                <h2 className="text-2xl font-black text-[#f6e7c7] md:text-3xl">
                  Bạn chưa đăng nhập
                </h2>
                <p className="mt-3 text-white/70">
                  Vui lòng đăng nhập để xem và cập nhật thông tin cá nhân.
                </p>
                <Link
                  to="/auth/login"
                  className="mt-6 inline-flex rounded-2xl bg-[#c8a96e] px-7 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
                >
                  Đi đến trang đăng nhập
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <aside className="profile-panel-reveal rounded-[26px] border border-white/10 bg-[#17100b]/92 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:p-8">
                  <div className="mx-auto w-fit">
                    <div className="relative h-24 w-24">
                      {currentUser?.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={displayName}
                          className="h-full w-full rounded-full border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#c8a96e] text-3xl font-black text-[#1a130b]">
                          {avatarLetter}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleOpenAvatarPicker}
                        disabled={isAvatarSubmitting}
                        className="absolute bottom-0 left-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#1a130b] bg-[#c8a96e] text-[#1a130b] shadow-lg transition hover:bg-[#d9bb82] disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Chọn ảnh đại diện từ máy"
                      >
                        {isAvatarSubmitting ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h2 className="mt-5 text-center text-2xl font-black text-[#f6e7c7]">
                    {displayName}
                  </h2>
                  <p className="mt-1 text-center text-sm text-white/60">
                    {currentUser?.email || "Chưa cập nhật email"}
                  </p>

                  <div className="mt-7 space-y-3 text-sm">
                    <div className="rounded-xl border border-white/10 bg-[#120d08] px-4 py-3">
                      <p className="text-white/50">Vai trò</p>
                      <p className="mt-1 font-semibold text-white">
                        {currentUser?.role || "Khách hàng"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#120d08] px-4 py-3">
                      <p className="text-white/50">Trạng thái tài khoản</p>
                      <p className="mt-1 font-semibold text-[#e8cf9d]">
                        {currentUser?.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                      </p>
                    </div>
                  </div>
                </aside>

                <section
                  className="profile-panel-reveal rounded-[26px] border border-white/10 bg-[#17100b]/92 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:p-8 lg:p-10"
                  style={{ animationDelay: "0.12s" }}
                >
                  <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                    Hồ sơ người dùng
                  </p>
                  <h2 className="mt-3 text-3xl font-black text-[#f6e7c7] md:text-4xl">
                    {activeTab === PROFILE_TAB
                      ? "Thông tin cá nhân"
                      : "Đổi mật khẩu"}
                  </h2>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab(PROFILE_TAB)}
                      className={`rounded-2xl border px-5 py-2.5 text-sm font-semibold transition ${
                        activeTab === PROFILE_TAB
                          ? "border-[#c8a96e] bg-[#c8a96e] text-[#1a130b]"
                          : "border-white/10 bg-[#120d08] text-white/70 hover:border-[#c8a96e]/50 hover:text-white"
                      }`}
                    >
                      Thông tin cá nhân
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab(PASSWORD_TAB)}
                      className={`rounded-2xl border px-5 py-2.5 text-sm font-semibold transition ${
                        activeTab === PASSWORD_TAB
                          ? "border-[#c8a96e] bg-[#c8a96e] text-[#1a130b]"
                          : "border-white/10 bg-[#120d08] text-white/70 hover:border-[#c8a96e]/50 hover:text-white"
                      }`}
                    >
                      Đổi mật khẩu
                    </button>
                  </div>

                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />

                  {activeTab === PROFILE_TAB ? (
                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                      <div className="profile-form-reveal grid gap-5 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-white/75">
                            Họ
                          </span>
                          <input
                            type="text"
                            value={formValues.firstName}
                            onChange={(event) =>
                              handleFormChange("firstName", event.target.value)
                            }
                            placeholder="Nhập họ"
                            className="w-full rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#c8a96e]/50 focus:outline-none"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-white/75">
                            Tên
                          </span>
                          <input
                            type="text"
                            value={formValues.lastName}
                            onChange={(event) =>
                              handleFormChange("lastName", event.target.value)
                            }
                            placeholder="Nhập tên"
                            className="w-full rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#c8a96e]/50 focus:outline-none"
                          />
                        </label>
                      </div>
                      <div
                        className="profile-form-reveal grid gap-5 md:grid-cols-2"
                        style={{ animationDelay: "0.08s" }}
                      >
                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-white/75">
                            Tên đăng nhập
                          </span>
                          <input
                            type="text"
                            value={formValues.username}
                            onChange={(event) =>
                              handleFormChange("username", event.target.value)
                            }
                            placeholder="Nhập tên đăng nhập"
                            className="w-full rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#c8a96e]/50 focus:outline-none"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-white/75">
                            Email
                          </span>
                          <input
                            type="email"
                            value={currentUser?.email || ""}
                            disabled
                            className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-[#120d08]/70 px-4 py-3 text-sm text-white/65 placeholder:text-white/35 focus:outline-none"
                          />
                        </label>
                      </div>

                      <p
                        className="profile-form-reveal text-sm text-white/50"
                        style={{ animationDelay: "0.2s" }}
                      >
                        Email, số điện thoại và địa chỉ hiện chưa được backend hỗ
                        trợ cập nhật.
                      </p>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center rounded-2xl bg-[#c8a96e] px-8 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? "Đang cập nhật..." : "Cập nhật thông tin"}
                      </button>
                    </form>
                  ) : (
                    <form className="mt-8 space-y-5" onSubmit={handleChangePassword}>
                      <div className="profile-form-reveal grid gap-5">
                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-white/75">
                            Mật khẩu hiện tại
                          </span>
                          <div className="relative">
                            <input
                              type={showPasswords.currentPassword ? "text" : "password"}
                              {...registerPasswordField("currentPassword")}
                              placeholder="Nhập mật khẩu hiện tại"
                              className="w-full rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 pr-12 text-sm text-white placeholder:text-white/35 focus:border-[#c8a96e]/50 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility("currentPassword")}
                              className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-white/45 transition hover:text-white/80"
                              aria-label={
                                showPasswords.currentPassword
                                  ? "Ẩn mật khẩu hiện tại"
                                  : "Hiện mật khẩu hiện tại"
                              }
                            >
                              {showPasswords.currentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {passwordErrors.currentPassword ? (
                            <p className="mt-2 text-xs text-red-300">
                              {passwordErrors.currentPassword.message}
                            </p>
                          ) : null}
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-white/75">
                            Mật khẩu mới
                          </span>
                          <div className="relative">
                            <input
                              type={showPasswords.newPassword ? "text" : "password"}
                              {...registerPasswordField("newPassword")}
                              placeholder="Nhập mật khẩu mới"
                              className="w-full rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 pr-12 text-sm text-white placeholder:text-white/35 focus:border-[#c8a96e]/50 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility("newPassword")}
                              className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-white/45 transition hover:text-white/80"
                              aria-label={
                                showPasswords.newPassword
                                  ? "Ẩn mật khẩu mới"
                                  : "Hiện mật khẩu mới"
                              }
                            >
                              {showPasswords.newPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {passwordErrors.newPassword ? (
                            <p className="mt-2 text-xs text-red-300">
                              {passwordErrors.newPassword.message}
                            </p>
                          ) : null}
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-white/75">
                            Xác nhận mật khẩu mới
                          </span>
                          <div className="relative">
                            <input
                              type={showPasswords.confirmPassword ? "text" : "password"}
                              {...registerPasswordField("confirmPassword")}
                              placeholder="Nhập lại mật khẩu mới"
                              className="w-full rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 pr-12 text-sm text-white placeholder:text-white/35 focus:border-[#c8a96e]/50 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility("confirmPassword")}
                              className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-white/45 transition hover:text-white/80"
                              aria-label={
                                showPasswords.confirmPassword
                                  ? "Ẩn xác nhận mật khẩu mới"
                                  : "Hiện xác nhận mật khẩu mới"
                              }
                            >
                              {showPasswords.confirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {passwordErrors.confirmPassword ? (
                            <p className="mt-2 text-xs text-red-300">
                              {passwordErrors.confirmPassword.message}
                            </p>
                          ) : null}
                        </label>
                      </div>

                      <p className="text-sm text-white/50">
                        Sau khi đổi mật khẩu thành công, bạn sẽ được đăng xuất để
                        đăng nhập lại bằng mật khẩu mới.
                      </p>

                      <button
                        type="submit"
                        disabled={isPasswordSubmitting}
                        className="inline-flex items-center justify-center rounded-2xl bg-[#c8a96e] px-8 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPasswordSubmitting ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                      </button>
                    </form>
                  )}
                </section>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default InformationIndividualPage;
