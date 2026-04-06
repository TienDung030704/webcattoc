import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";

function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header điều hướng chính của website */}
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
                className="rounded-full bg-[#c8a96e] px-4 py-2 font-semibold text-[#1a130b]"
              >
                Liên hệ
              </Link>
            </nav>

            <HeaderAuthArea />
          </div>
        </header>
      </Header>

      <main className="service-page-fade">
        {/* Hero banner trang liên hệ */}
        <section className="relative h-[280px] overflow-hidden md:h-[340px] lg:h-[390px]">
          <img
            src="/bg-cuthair-2.png"
            alt="Liên hệ MDT BaberShop"
            className="service-hero-zoom h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(4,4,4,0.3),rgba(4,4,4,0.55),rgba(4,4,4,0.9))]" />
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-black tracking-[0.06em] text-[#f6e7c7] uppercase md:text-6xl lg:text-7xl">
                Liên hệ
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/80 md:text-base md:leading-8 lg:text-lg">
                Vui lòng điền thông tin vào form bên dưới, đội ngũ MDT BaberShop
                sẽ liên hệ lại sớm nhất.
              </p>
            </div>
          </div>
        </section>

        {/* Chỉ giữ 1 form điền thông tin theo yêu cầu */}
        <section
          className="service-bg-shimmer relative overflow-hidden px-4 pt-12 pb-20 md:px-8 md:pt-16 md:pb-24"
          style={{
            backgroundImage:
              "linear-gradient(rgba(4,4,4,0.96), rgba(4,4,4,0.985)), radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 32%), url('/bg-cuthair.png')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.06)_45%,transparent_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_55%)]" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/45">
              <Link to="/" className="transition hover:text-white/75">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-[#d8b77a]">Liên hệ</span>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[#17100b]/92 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:p-8 lg:p-10">
              <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                Form liên hệ
              </p>
              <h2 className="mt-3 text-3xl font-black text-[#f6e7c7] md:text-4xl">
                Điền thông tin của bạn
              </h2>

              <form className="mt-8 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-white/75">
                      Họ và tên
                    </span>
                    <input
                      type="text"
                      placeholder="Nhập họ và tên"
                      className="w-full rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#c8a96e]/50 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-white/75">
                      Số điện thoại
                    </span>
                    <input
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      className="w-full rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#c8a96e]/50 focus:outline-none"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-white/75">
                    Email
                  </span>
                  <input
                    type="email"
                    placeholder="Nhập email"
                    className="w-full rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#c8a96e]/50 focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-white/75">
                    Nội dung liên hệ
                  </span>
                  <textarea
                    rows="7"
                    placeholder="Nhập nội dung bạn cần hỗ trợ"
                    className="w-full rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#c8a96e]/50 focus:outline-none"
                  />
                </label>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#c8a96e] px-8 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
                >
                  Gửi thông tin
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer dùng chung toàn site */}
      <Footer />
    </div>
  );
}

export default ContactPage;
