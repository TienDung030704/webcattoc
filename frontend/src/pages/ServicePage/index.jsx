import { useState } from "react";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";

// Dữ liệu bảng giá dịch vụ theo khu vực
const priceBoards = [
  {
    title: "BẢNG GIÁ DỊCH VỤ SÀI GÒN",
    cutPrice: "GIÁ CẮT: 140K",
    cutDetail: "xả - cắt - gội - tạo kiểu",
    note: "(Giảm 10k khi sử dụng dịch vụ uốn hoặc nhuộm)",
    combos: ["COMBO 2 NGƯỜI: 130K / NGƯỜI", "COMBO 4 NGƯỜI: 120K / NGƯỜI"],
    permPrice: "GIÁ UỐN: 330K",
    styles: [
      ["PREMLOCK: 990K", "UỐN CON SÂU: 550K"],
      ["RUFFLED: 770K", "CHIDORI: 770K"],
      ["ZICZAC: 550K", "MEDUSA: 550K"],
    ],
  },
  {
    title: "BẢNG GIÁ DỊCH VỤ HÀ NỘI",
    cutPrice: "GIÁ CẮT: 120K",
    cutDetail: "xả - cắt - gội - tạo kiểu",
    note: "(Giảm 10k khi sử dụng dịch vụ uốn hoặc nhuộm)",
    combos: ["COMBO 2 NGƯỜI: 110K / NGƯỜI", "COMBO 4 NGƯỜI: 100K / NGƯỜI"],
    permPrice: "GIÁ UỐN: 320K",
    styles: [
      ["PREMLOCK: 920K", "UỐN CON SÂU: 520K"],
      ["RUFFLED: 720K", "CHIDORI: 720K"],
      ["ZICZAC: 520K", "MEDUSA: 520K"],
    ],
  },
  {
    title: "BẢNG GIÁ DỊCH VỤ QUẬN 9",
    cutPrice: "GIÁ CẮT: 130K",
    cutDetail: "xả - cắt - gội - tạo kiểu",
    note: "(Giảm 10k khi sử dụng dịch vụ uốn hoặc nhuộm)",
    combos: ["COMBO 2 NGƯỜI: 120K / NGƯỜI", "COMBO 4 NGƯỜI: 110K / NGƯỜI"],
    permPrice: "GIÁ UỐN: 320K",
    styles: [
      ["PREMLOCK: 920K", "UỐN CON SÂU: 520K"],
      ["RUFFLED: 720K", "CHIDORI: 720K"],
      ["ZICZAC: 520K", "MEDUSA: 520K"],
    ],
  },
];

// Slider ảnh dịch vụ
const serviceGallery = ["/service-1.png", "/service-2.png"];

function ServicePage() {
  // State slider ảnh dịch vụ
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Hàm chuyển ảnh sang trái
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? serviceGallery.length - 1 : prev - 1,
    );
  };

  // Hàm chuyển ảnh sang phải
  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === serviceGallery.length - 1 ? 0 : prev + 1,
    );
  };
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
                className="rounded-full bg-[#c8a96e] px-4 py-2 font-semibold text-[#1a130b]"
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
      <main className="service-page-fade">
        {/* Hero banner đầu trang dịch vụ */}
        <section className="relative h-[330px] overflow-hidden md:h-[380px] lg:h-[430px]">
          <img
            src="/bg-cuthair.png"
            alt="Dịch vụ cắt tóc"
            className="service-hero-zoom h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.12),rgba(0,0,0,0.28),rgba(0,0,0,0.62))]" />
        </section>

        {/* Khu vực nội dung chính: bảng giá và slider ảnh dịch vụ */}
        <section
          className="service-bg-shimmer relative overflow-hidden px-4 pt-10 pb-20 md:px-8 md:pt-14 md:pb-24"
          style={{
            backgroundImage:
              "linear-gradient(rgba(4,4,4,0.96), rgba(4,4,4,0.98)), radial-gradient(circle at top, rgba(255,255,255,0.07), transparent 30%), url('/bg-cuthair.png')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.06)_45%,transparent_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_55%)]" />
          </div>

          <div className="relative mx-auto max-w-[1500px]">
            <h1 className="service-title-reveal text-center text-5xl font-black tracking-[0.04em] text-white uppercase md:text-7xl">
              DỊCH VỤ
            </h1>

            {/* Danh sách bảng giá dịch vụ */}
            <div className="mt-10 grid gap-6 xl:grid-cols-3 xl:gap-8">
              {priceBoards.map((board, index) => (
                <article
                  key={board.title}
                  className="service-board-reveal relative mx-auto w-full max-w-[390px] md:max-w-[430px] xl:max-w-[460px]"
                  style={{ animationDelay: `${0.18 + index * 0.12}s` }}
                >
                  <div className="relative aspect-[0.64] w-full">
                    <img
                      src="/frame-service.png"
                      alt={board.title}
                      className="service-frame-float absolute inset-0 h-full w-full object-contain drop-shadow-[0_18px_50px_rgba(0,0,0,0.6)]"
                      style={{ animationDelay: `${index * 0.45}s` }}
                    />

                    <div className="absolute inset-x-[10%] top-[11.5%] bottom-[10.5%] flex flex-col items-center px-4 text-center md:inset-x-[9.5%] md:top-[11%] md:bottom-[10%] md:px-7">
                      <div className="mt-10 md:mt-12">
                        <h2
                          className="mx-auto max-w-[240px] text-center text-[16px] leading-tight font-black text-[#f4eee4] uppercase md:max-w-[300px] md:text-[20px]"
                          style={{ textShadow: "2px 2px 0 #b81212" }}
                        >
                          {board.title}
                        </h2>
                        {board.subtitle ? (
                          <p
                            className="mt-1 text-[16px] leading-tight font-black text-[#f4eee4] uppercase md:text-[20px]"
                            style={{ textShadow: "2px 2px 0 #b81212" }}
                          >
                            {board.subtitle}
                          </p>
                        ) : null}
                      </div>

                      <div className="mt-8 w-full text-[#f5f0e7] md:mt-10">
                        <div>
                          <p className="text-[18px] leading-tight font-black uppercase md:text-[22px]">
                            {board.cutPrice}
                          </p>
                          <p className="mt-1 text-[11px] font-semibold tracking-[0.05em] uppercase md:text-[13px]">
                            {board.cutDetail}
                          </p>
                          <p className="mx-auto mt-1 max-w-[280px] text-[10px] leading-4 font-medium text-white/80 md:max-w-[330px] md:text-[11px]">
                            {board.note}
                          </p>
                        </div>

                        <div className="mt-6 space-y-1 text-[14px] leading-tight font-black uppercase md:text-[16px]">
                          {board.combos.map((combo) => (
                            <p key={combo}>{combo}</p>
                          ))}
                        </div>

                        <div className="mt-9">
                          <p className="text-[18px] leading-tight font-black uppercase md:text-[22px]">
                            {board.permPrice}
                          </p>
                          <div className="mt-3 space-y-2 text-[11px] leading-tight font-black uppercase md:text-[13px]">
                            {board.styles.map((row) => (
                              <div
                                key={row.join("-")}
                                className="grid grid-cols-2 gap-2 text-center md:gap-3"
                              >
                                <p>{row[0]}</p>
                                <p>{row[1]}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Slider ảnh dịch vụ */}
            <section className="mx-auto mt-16 max-w-6xl">
              <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-black/35 p-3 md:p-5">
                <img
                  key={serviceGallery[currentImageIndex]}
                  src={serviceGallery[currentImageIndex]}
                  alt={`Service ${currentImageIndex + 1}`}
                  className="service-gallery-fade h-[300px] w-full rounded-2xl bg-black/60 object-contain md:h-[430px] lg:h-[500px]"
                />

                {/* Nút điều hướng slider */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute top-1/2 left-6 -translate-y-1/2 rounded-full border border-white/25 bg-black/50 p-3 text-white transition hover:bg-black/70"
                  aria-label="arrow-left"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute top-1/2 right-6 -translate-y-1/2 rounded-full border border-white/25 bg-black/50 p-3 text-white transition hover:bg-black/70"
                  aria-label="arrow-right"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>

              {/* Chấm tròn điều hướng slider */}
              <div className="mt-5 flex items-center justify-center gap-2.5">
                {serviceGallery.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      currentImageIndex === index
                        ? "bg-[#c8a96e] ring-2 ring-[#c8a96e]/40"
                        : "bg-white/35 hover:bg-white/55"
                    }`}
                    aria-label={`dot-${index + 1}`}
                  />
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>

      {/* Footer dùng chung toàn site */}
      <Footer />
    </div>
  );
}
export default ServicePage;
