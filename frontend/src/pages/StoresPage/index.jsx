import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

const storeAreas = [
  {
    city: "TP. HỒ CHÍ MINH",
    branches: [
      {
        district: "Quận 1",
        address: "48 Nguyễn Trãi, P. Bến Thành, Quận 1, TP. Hồ Chí Minh",
      },
      {
        district: "Quận 3",
        address: "214 Nguyễn Đình Chiểu, P. 6, Quận 3, TP. Hồ Chí Minh",
      },
      {
        district: "Quận 5",
        address: "102 Trần Hưng Đạo, P. 7, Quận 5, TP. Hồ Chí Minh",
      },
      {
        district: "Quận 7",
        address: "36 Nguyễn Thị Thập, P. Tân Hưng, Quận 7, TP. Hồ Chí Minh",
      },
      {
        district: "Quận Bình Thạnh",
        address:
          "219 Xô Viết Nghệ Tĩnh, P. 17, Quận Bình Thạnh, TP. Hồ Chí Minh",
      },
      {
        district: "TP. Thủ Đức",
        address: "22 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh",
      },
    ],
  },
  {
    city: "HÀ NỘI",
    branches: [
      {
        district: "Quận Ba Đình",
        address: "126 Nguyễn Trường Tộ, Q. Ba Đình, Hà Nội",
      },
      {
        district: "Quận Đống Đa",
        address: "58 Tôn Đức Thắng, Q. Đống Đa, Hà Nội",
      },
      {
        district: "Quận Cầu Giấy",
        address: "102 Trần Thái Tông, Q. Cầu Giấy, Hà Nội",
      },
      {
        district: "Quận Hoàn Kiếm",
        address: "86 Hàng Bông, Q. Hoàn Kiếm, Hà Nội",
      },
      {
        district: "Quận Hai Bà Trưng",
        address: "148 Phố Huế, Q. Hai Bà Trưng, Hà Nội",
      },
      {
        district: "Quận Thanh Xuân",
        address: "231 Nguyễn Trãi, Q. Thanh Xuân, Hà Nội",
      },
    ],
  },
];

function StoresPage() {
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

            <nav className="mx-auto hidden w-full max-w-[900px] items-center justify-center gap-2 text-sm text-white/70 md:flex">
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
                className="rounded-full bg-[#c8a96e] px-4 py-2 font-semibold text-[#1a130b]"
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

      <main className="service-page-fade">
        <section className="relative h-[280px] overflow-hidden md:h-[340px] lg:h-[390px]">
          <img
            src="/bg-cuthair-2.png"
            alt="Hệ thống cửa hàng"
            className="service-hero-zoom h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(4,4,4,0.3),rgba(4,4,4,0.52),rgba(4,4,4,0.88))]" />
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-black tracking-[0.06em] text-[#f6e7c7] uppercase md:text-6xl lg:text-7xl">
                Hệ thống cửa hàng
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/80 md:text-base md:leading-8 lg:text-lg">
                Hiển thị theo 2 khu vực: TP. Hồ Chí Minh và Hà Nội.
              </p>
            </div>
          </div>
        </section>

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

          <div className="relative mx-auto max-w-[1560px] space-y-16">
            {storeAreas.map((area, areaIndex) => (
              <section key={area.city}>
                <div className="mx-auto mb-10 max-w-5xl text-center">
                  <p className="text-sm font-semibold tracking-[0.28em] text-[#c8a96e] uppercase">
                    Khu vực
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-[0.06em] text-[#f6e7c7] uppercase md:text-5xl">
                    {area.city}
                  </h2>
                  <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#c8a96e]" />
                </div>

                <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                  {area.branches.map((branch, branchIndex) => (
                    <article
                      key={`${area.city}-${branch.district}`}
                      className="service-board-reveal relative mx-auto w-full max-w-[440px] md:max-w-[500px]"
                      style={{
                        animationDelay: `${
                          0.15 + areaIndex * 0.12 + branchIndex * 0.1
                        }s`,
                      }}
                    >
                      <div className="relative aspect-[0.82] w-full">
                        <img
                          src="/frame-service.png"
                          alt={branch.district}
                          className="service-frame-float absolute inset-0 h-full w-full object-contain drop-shadow-[0_18px_50px_rgba(0,0,0,0.62)]"
                          style={{
                            animationDelay: `${areaIndex * 0.35 + branchIndex * 0.2}s`,
                          }}
                        />

                        <div className="absolute inset-x-[12%] top-[12.5%] bottom-[12.5%] flex flex-col items-center px-5 text-center md:px-7">
                          <h3
                            className="mt-3 text-[17px] leading-tight font-black text-[#f4eee4] uppercase md:mt-4 md:text-[21px]"
                            style={{ textShadow: "2px 2px 0 #b81212" }}
                          >
                            {branch.district}
                          </h3>

                          <img
                            src="/store-1.png"
                            alt={branch.district}
                            className="mt-5 h-52 w-full rounded-2xl border border-white/15 bg-black/20 object-contain object-center p-2 md:h-60"
                          />

                          <div className="mt-4 w-[84%] max-w-[280px] rounded-[16px] bg-black/20 px-2.5 py-2.5 md:mt-5">
                            <p className="text-[9px] font-black tracking-[0.12em] text-[#f7c86d] uppercase">
                              Địa chỉ
                            </p>
                            <p className="mt-1 text-[11px] leading-4.5 break-words text-white/90 md:text-[12px]">
                              {branch.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default StoresPage;
