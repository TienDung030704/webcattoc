function Login() {
  return (
    <div
      className="relative flex h-screen w-full overflow-hidden"
      style={{
        backgroundImage: "url('/bg-cuthair.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay tối nhẹ toàn màn hình */}
      <div className="absolute inset-0 bg-black/30" />

      {/* LEFT - chiếm nửa trái, không có gì thêm (chỉ thấy ảnh nền) */}
      <div className="hidden w-1/2 lg:block" />

      {/* RIGHT - Form đăng nhập dạng kính mờ */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div
          className="w-full max-w-md rounded-2xl px-10 py-10"
          style={{
            background: "rgba(255, 255, 255, 0.10)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Title */}
          <h1 className="mb-1 text-4xl font-bold text-white drop-shadow">Đăng Nhập</h1>
          <p className="mb-8 text-sm text-white/60">
            Chào mừng đến với dịch vụ đặt lịch cắt tóc
          </p>

          {/* Form */}
          <form className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white/90">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/50">
                  {/* Mail icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full rounded-lg py-3 pr-4 pl-10 text-sm text-white outline-none transition placeholder:text-white/35"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  onFocus={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.45)"; }}
                  onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.15)"; }}
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white/90">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/50">
                  {/* Lock icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className="w-full rounded-lg py-3 pr-4 pl-10 text-sm text-white outline-none transition placeholder:text-white/35"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  onFocus={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.45)"; }}
                  onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.15)"; }}
                />
              </div>
            </div>

            {/* Quên mật khẩu */}
            <div className="flex justify-end">
              <a
                href="/auth/forgot-password"
                className="text-xs text-white/50 transition hover:text-white"
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg py-3 text-sm font-bold text-white transition active:scale-[.98]"
              style={{ background: "rgba(20,14,5,0.85)", border: "1px solid rgba(255,255,255,0.12)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(40,28,10,0.95)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(20,14,5,0.85)"; }}
            >
              Đăng Nhập
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span className="text-xs text-white/40">Hoặc đăng nhập với</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>

          {/* Social login */}
          <div className="flex justify-center gap-4">
            {/* Facebook */}
            <button className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition hover:scale-110" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="#1877F2"
              >
                <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
              </svg>
            </button>

            {/* Google */}
            <button className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition hover:scale-110" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>

            {/* Apple */}
            <button className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition hover:scale-110" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </button>
          </div>

          {/* Đăng ký */}
          <p className="mt-8 text-center text-sm text-white/50">
            Chưa có tài khoản?{" "}
            <a
              href="/auth/register"
              className="font-semibold text-[#c8a96e] transition hover:underline"
            >
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>

      {/* Nút mũi tên xuống góc phải dưới */}
      <a
        href="#"
        className="absolute right-6 bottom-6 z-20 flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-110"
        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </a>
    </div>
  );
}

export default Login;
