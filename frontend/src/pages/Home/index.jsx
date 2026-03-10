import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import { formatCurrency } from "@/utils/dashboard";
import http from "@/utils/http";

// Nội dung mô tả thương hiệu ở phần Giới thiệu
const introductionParagraphs = [
  "Với những HOMIES tìm kiếm một kiểu tóc thời thượng phù hợp khuôn mặt, MTD BaberSHop là chuỗi cắt tóc nam phong cách thời trang cập nhật xu hướng ( TRENDY FASHION BARBERSHOP), luôn mang đến những kiểu tóc ĐẸP ĐÚNG Ý, đúng mong đợi nhờ đội ngũ thợ cắt tóc khéo tay nghề, vui vẻ, thân thiện, biết chiều khách và tư vấn có nghề.",
  "Thành lập từ năm 2022, MTD BaberSHop không chỉ là thương hiệu tiên phong sản xuất sáp vuốt tóc cho nam tại Việt Nam, mà còn là chuỗi barbershop hàng đầu mang đến phong cách thời trang thời thượng và trải nghiệm dịch vụ thân thiện, gần gũi như homie. Với hơn 14 chi nhánh tại Hà Nội và TP. Hồ Chí Minh, IRONCAP không ngừng nâng cao chất lượng dịch vụ để phục vụ khách hàng đúng ý nhất.",
];

// 3 khung hệ sinh thái thương hiệu dưới phần Giới thiệu
const ecosystemCards = ["SÁP", "BABER", "MTD SHCOOL"];

const HOME_PRODUCT_LIMIT = 3;

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      setIsLoadingProducts(true);

      try {
        // Lấy dữ liệu sản phẩm thật để section sản phẩm ở trang chủ hiển thị ảnh từ backend.
        const response = await http.get("user/products", {
          params: {
            page: 1,
            limit: HOME_PRODUCT_LIMIT,
            sort: "newest",
            availability: "IN_STOCK",
          },
        });
        const nextItems = response?.data?.items;
        setFeaturedProducts(Array.isArray(nextItems) ? nextItems : []);
      } catch (error) {
        setFeaturedProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchHomeProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#120d08] text-white">
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

            <HeaderAuthArea />
          </div>
        </header>
      </Header>

      {/* Hero section: giới thiệu thương hiệu và CTA đặt lịch */}
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
              to="/booking"
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

      {/* Section giới thiệu thương hiệu và năm thành lập */}
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
          {/* Block hệ sinh thái thương hiệu nằm dưới phần Giới thiệu */}
          <div className="intro-text-reveal mt-12">
            <p
              className="text-center text-[22px] font-black tracking-[0.28em] text-[#f5e9d0] uppercase md:text-[34px]"
              style={{ textShadow: "2px 2px 0 #8f1414" }}
            >
              HỆ SINH THÁI
            </p>

            <div className="mt-4 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ecosystemCards.map((card) => (
                <div
                  key={card}
                  className="group relative mx-auto w-full max-w-[320px]"
                >
                  <div className="relative aspect-[22/7] w-full overflow-hidden rounded-[18px]">
                    {/* Lớp phủ đỏ hover nằm dưới khung để tạo hiệu ứng nhấn */}
                    <div className="pointer-events-none absolute inset-[-12px] z-0 rounded-[26px] bg-[#a11616]/0 transition duration-300 group-hover:bg-[#a11616]/55" />

                    <img
                      src="/rcm-1.png"
                      alt={card}
                      className="relative z-10 h-full w-full object-contain drop-shadow-[0_14px_36px_rgba(0,0,0,0.45)]"
                    />

                    <div className="absolute inset-x-[8%] top-[18%] bottom-[15%] z-20 flex items-center justify-center text-center uppercase">
                      <p
                        className="text-[21px] leading-none font-black text-[#fff5df] md:text-[26px]"
                        style={{ textShadow: "2px 2px 0 #a11616" }}
                      >
                        {card}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Section sản phẩm: tiêu đề nằm ngoài, 3 card ảnh và 1 nút chung phía dưới */}
      <section
        id="about"
        className="about-section-fade border-y border-white/6 bg-[#18110b]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <h2 className="about-title-reveal mb-10 text-center text-4xl font-black tracking-[0.06em] text-[#f6e7c7] uppercase md:text-5xl">
            Sản phẩm
          </h2>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {isLoadingProducts
              ? Array.from({ length: HOME_PRODUCT_LIMIT }).map((_, index) => (
                  <div
                    key={`home-product-skeleton-${index}`}
                    className="about-card-reveal relative mx-auto w-full max-w-[420px]"
                    style={{ animationDelay: `${0.16 + index * 0.12}s` }}
                  >
                    <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-b from-[#c8a96e]/30 via-[#c8a96e]/10 to-transparent blur-xl" />
                    <div className="relative overflow-hidden rounded-[32px] border border-[#c8a96e]/20 bg-[#140e09] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-8">
                      <div className="h-[300px] animate-pulse rounded-[24px] bg-white/8 md:h-[360px]" />
                    </div>
                  </div>
                ))
              : null}

            {!isLoadingProducts && featuredProducts.length > 0
              ? featuredProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="about-card-reveal relative mx-auto block w-full max-w-[420px]"
                    style={{ animationDelay: `${0.16 + index * 0.12}s` }}
                  >
                    <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-b from-[#c8a96e]/30 via-[#c8a96e]/10 to-transparent blur-xl" />
                    <div className="about-card-float relative overflow-hidden rounded-[32px] border border-[#c8a96e]/35 bg-[#140e09] shadow-[0_30px_80px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:border-[#d8b77a]/55">
                      <div className="flex items-center justify-center bg-[#18110b] px-6 pt-8 pb-4 md:px-8 md:pt-10">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-[300px] w-auto max-w-full object-contain md:h-[360px]"
                        />
                      </div>
                      <div className="border-t border-white/8 px-6 py-5 text-center md:px-8">
                        <p className="text-xs font-semibold tracking-[0.22em] text-[#c8a96e] uppercase">
                          Sản phẩm nổi bật
                        </p>
                        <h3 className="mt-2 line-clamp-2 text-xl font-bold text-[#f6e7c7]">
                          {product.name}
                        </h3>
                        <p className="mt-3 text-lg font-semibold text-[#f79b1c]">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              : null}

            {!isLoadingProducts && featuredProducts.length === 0
              ? Array.from({ length: HOME_PRODUCT_LIMIT }).map((_, index) => (
                  <div
                    key={`home-product-fallback-${index}`}
                    className="about-card-reveal relative mx-auto w-full max-w-[420px]"
                    style={{ animationDelay: `${0.16 + index * 0.12}s` }}
                  >
                    <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-b from-[#c8a96e]/30 via-[#c8a96e]/10 to-transparent blur-xl" />
                    <div className="about-card-float relative flex flex-col items-center rounded-[32px] border border-[#c8a96e]/35 bg-[#140e09] px-6 py-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:px-8 md:py-10">
                      <img
                        src="/product-1.png"
                        alt="Sản phẩm MDT BaberShop"
                        className="h-[300px] w-auto object-contain md:h-[360px]"
                      />
                    </div>
                  </div>
                ))
              : null}
          </div>

          <div className="about-cta-reveal mt-10 flex justify-center">
            <Link
              to="/product"
              className="hero-glow inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-[#f79b1c] px-8 py-4 text-xl font-bold text-white shadow-[0_12px_24px_rgba(247,155,28,0.35)] transition hover:-translate-y-1 hover:bg-[#ffab3a]"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section>

      {/* Footer dùng chung toàn site */}
      <Footer />
    </div>
  );
}

export default Home;
