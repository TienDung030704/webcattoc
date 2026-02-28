function ForgotPassword() {
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

      {/* LEFT - chiếm nửa trái, chỉ thấy ảnh nền */}
      <div className="hidden w-1/2 lg:block" />

      {/* RIGHT - Form quên mật khẩu */}
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
          {/* Icon khoá */}
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="mb-1 text-4xl font-bold text-white drop-shadow">
            Quên Mật Khẩu
          </h1>
          <p className="mb-8 text-sm text-white/60">
            Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu
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

            {/* Nút gửi */}
            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg py-3 text-sm font-bold text-white transition active:scale-[.98]"
              style={{ background: "rgba(20,14,5,0.85)", border: "1px solid rgba(255,255,255,0.12)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(40,28,10,0.95)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(20,14,5,0.85)"; }}
            >
              Gửi Link Đặt Lại
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span className="text-xs text-white/40">hoặc</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>

          {/* Quay lại đăng nhập */}
          <a
            href="/auth/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white/70 transition hover:text-white active:scale-[.98]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại đăng nhập
          </a>

          {/* Đăng ký */}
          <p className="mt-6 text-center text-sm text-white/50">
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

export default ForgotPassword;
