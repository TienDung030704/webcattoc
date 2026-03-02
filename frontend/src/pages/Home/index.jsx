import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

const introductionParagraphs = [
  "Với những HOMIES tìm kiếm một kiểu tóc thời thượng phù hợp khuôn mặt, MTD BaberSHop là chuỗi cắt tóc nam phong cách thời trang cập nhật xu hướng ( TRENDY FASHION BARBERSHOP), luôn mang đến những kiểu tóc ĐẸP ĐÚNG Ý, đúng mong đợi nhờ đội ngũ thợ cắt tóc khéo tay nghề, vui vẻ, thân thiện, biết chiều khách và tư vấn có nghề.",
  "Thành lập từ năm 2022, MTD BaberSHop không chỉ là thương hiệu tiên phong sản xuất sáp vuốt tóc cho nam tại Việt Nam, mà còn là chuỗi barbershop hàng đầu mang đến phong cách thời trang thời thượng và trải nghiệm dịch vụ thân thiện, gần gũi như homie. Với hơn 14 chi nhánh tại Hà Nội và TP. Hồ Chí Minh, IRONCAP không ngừng nâng cao chất lượng dịch vụ để phục vụ khách hàng đúng ý nhất.",
];

const bookingSteps = [
  "Chọn dịch vụ phù hợp với nhu cầu.",
  "Chọn barber, ngày và khung giờ còn trống.",
  "Xác nhận lịch hẹn và đến trải nghiệm.",
];

const highlights = [
  "Không gian sang trọng, hiện đại",
  "Barber nhiều kinh nghiệm, tư vấn tận tâm",
  "Đặt lịch nhanh, hạn chế chờ đợi",
  "Phù hợp đi làm, đi chơi, sự kiện",
];

function Home() {
  return (
    <div className="min-h-screen bg-[#120d08] text-white">
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

            <nav className="mx-auto hidden w-full max-w-[900px] items-center justify-center gap-2 text-sm text-white/70 md:flex">
              <Link
                to="/"
                className="rounded-full bg-[#c8a96e] px-4 py-2 font-semibold text-[#1a130b]"
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

            <div className="flex items-center gap-3">
              <Link
                to="/auth/login"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Đăng nhập
              </Link>
              <Link
                to="/auth/register"
                className="rounded-lg bg-[#c8a96e] px-4 py-2 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </header>
      </Header>

      <section
        id="home"
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(8, 6, 4, 0.72), rgba(8, 6, 4, 0.88)), url('/bg-cuthair.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 pt-24 pb-14 lg:px-10">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center pt-6 text-center md:pt-10">
            <p className="hero-fade-up hero-fade-up-delay-1 text-3xl font-light text-[#f4e4c6] md:text-5xl">
              Chào mừng đến với
            </p>

            <h1 className="hero-fade-up hero-fade-up-delay-2 mt-3 text-5xl leading-tight font-bold text-[#f3dfb8] md:text-7xl">
              MDT BaberShop
            </h1>

            <p className="hero-fade-up hero-fade-up-delay-3 mt-6 max-w-3xl text-lg leading-8 text-white/75 md:text-2xl md:leading-10">
              Dịch vụ cắt tóc chuyên nghiệp và đẳng cấp dành cho bạn.
            </p>

            <Link
              to="/service"
              className="hero-fade-up hero-fade-up-delay-4 hero-glow mt-10 inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-[#f79b1c] px-8 py-4 text-xl font-bold text-white shadow-[0_12px_24px_rgba(247,155,28,0.35)] transition hover:-translate-y-1 hover:bg-[#ffab3a]"
            >
              Đặt lịch ngay
            </Link>
          </div>

          <div className="mx-auto mt-10 grid w-full max-w-6xl gap-6 border-t border-[#d8b77a]/20 pt-8 text-center md:grid-cols-3">
            <div className="hero-card hero-card-delay-1 rounded-2xl border border-[#d8b77a]/20 bg-[#1a120c]/55 px-5 py-6 backdrop-blur-sm hover:border-[#efcf95]/40 hover:bg-[#21160f]/70">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#d8b77a]/40 text-[#e9ca8f]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7"
                >
                  <circle cx="5.5" cy="7" r="2.2" />
                  <circle cx="5.5" cy="17" r="2.2" />
                  <path d="M8 8.5 19.5 4" />
                  <path d="M8 15.5 19.5 20" />
                  <path d="M7.2 9.3 13 12" />
                  <path d="M7.2 14.7 13 12" />
                </svg>
              </div>
              <h3 className="mt-4 text-3xl font-semibold text-[#efcf95] md:text-4xl">
                Thợ giỏi kinh nghiệm
              </h3>
              <p className="mt-3 text-lg text-white/60">
                Chuyên viên tay nghề cao, tư vấn kiểu tóc phù hợp từng khuôn
                mặt.
              </p>
            </div>

            <div className="hero-card hero-card-delay-2 rounded-2xl border border-[#d8b77a]/20 bg-[#1a120c]/55 px-5 py-6 backdrop-blur-sm hover:border-[#efcf95]/40 hover:bg-[#21160f]/70">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#d8b77a]/40 text-[#e9ca8f]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7"
                >
                  <path d="M7 5.5h10" />
                  <path d="M8.5 5.5v3.5" />
                  <path d="M15.5 5.5v3.5" />
                  <path d="M6.5 9h11" />
                  <path d="M8 9v8" />
                  <path d="M16 9v8" />
                  <path d="M8 17c0 1.2.9 2 2 2" />
                  <path d="M16 17c0 1.2-.9 2-2 2" />
                </svg>
              </div>
              <h3 className="mt-4 text-3xl font-semibold text-[#efcf95] md:text-4xl">
                Dịch vụ chuyên nghiệp
              </h3>
              <p className="mt-3 text-lg text-white/60">
                Quy trình chuẩn barber shop hiện đại, nhanh gọn và chỉn chu.
              </p>
            </div>

            <div className="hero-card hero-card-delay-3 rounded-2xl border border-[#d8b77a]/20 bg-[#1a120c]/55 px-5 py-6 backdrop-blur-sm hover:border-[#efcf95]/40 hover:bg-[#21160f]/70">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#d8b77a]/40 text-[#e9ca8f]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7"
                >
                  <path d="M12 4.5 18.5 7.5v5.2c0 3.1-2.2 5.9-6.5 7.8-4.3-1.9-6.5-4.7-6.5-7.8V7.5L12 4.5Z" />
                  <path d="M9.5 12.3 11.2 14l3.5-3.7" />
                </svg>
              </div>
              <h3 className="mt-4 text-3xl font-semibold text-[#efcf95] md:text-4xl">
                Uy tín & đẳng cấp
              </h3>
              <p className="mt-3 text-lg text-white/60">
                Không gian sang trọng, trải nghiệm cao cấp cho mỗi lần ghé tiệm.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="intro-section-fade relative overflow-hidden px-6 py-20 lg:px-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(8, 6, 4, 0.72), rgba(8, 6, 4, 0.88)), url('/bg-cuthair-2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h2 className="intro-title-reveal text-4xl font-extrabold text-[#f6e7c7] md:text-5xl">
                Giới thiệu
              </h2>
              <div className="mt-4 h-1.5 w-16 rounded-full bg-[#f59e0b]" />

              <div className="intro-text-reveal mt-8 space-y-7 text-base leading-8 text-white/80 md:text-lg md:leading-9">
                {introductionParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="intro-year-reveal -mt-4 flex flex-col items-center md:-mt-6">
              <p className="text-center text-sm font-semibold tracking-[0.22em] text-[#f59e0b] uppercase">
                Năm thành lập
              </p>
              <img
                src="/text-2.png"
                alt="2016"
                className="mt-0 h-56 w-auto max-w-full object-contain md:h-80"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-y border-white/6 bg-[#18110b]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
              Vì sao chọn chúng tôi
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Không chỉ là một lần cắt tóc, mà là một trải nghiệm chỉnh chu
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-white/65">
              Chúng tôi kết hợp kỹ thuật barber hiện đại, không gian cao cấp và
              hệ thống đặt lịch thông minh để mỗi lần ghé tiệm đều nhanh hơn,
              tiện hơn và đúng phong cách bạn mong muốn.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/8 bg-white/5 p-5 text-white/85"
              >
                <div className="mb-4 h-2 w-12 rounded-full bg-[#c8a96e]" />
                <p className="text-base leading-7 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="steps" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
              Cách đặt lịch
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Chỉ 3 bước để có lịch hẹn phù hợp
            </h2>
          </div>

          <div className="space-y-4">
            {bookingSteps.map((step, index) => (
              <div
                key={step}
                className="flex gap-4 rounded-2xl border border-white/8 bg-white/5 p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#c8a96e] font-bold text-[#1a130b]">
                  {index + 1}
                </div>
                <div>
                  <p className="text-lg font-semibold">{step}</p>
                  <p className="mt-2 text-sm leading-7 text-white/60">
                    Tối ưu cho trải nghiệm đặt lịch nhanh, rõ ràng và dễ thao
                    tác trên cả desktop lẫn mobile.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-[#c8a96e]/15 bg-gradient-to-r from-[#1f1610] via-[#271b12] to-[#1a120d] p-8 md:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                Sẵn sàng thay đổi diện mạo?
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Đặt lịch ngay hôm nay để giữ khung giờ đẹp nhất
              </h2>
              <p className="mt-4 leading-8 text-white/65">
                Tạo tài khoản, chọn barber yêu thích và để chúng tôi chuẩn bị
                cho bạn một trải nghiệm cắt tóc chỉn chu, đúng chất riêng.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/service"
                className="inline-flex items-center justify-center rounded-xl bg-[#c8a96e] px-6 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
              >
                Xem lịch trống
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
