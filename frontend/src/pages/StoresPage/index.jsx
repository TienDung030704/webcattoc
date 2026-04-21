import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import http from "@/utils/http";

function mapStoreBranch(branch) {
  return {
    id: String(branch.id),
    name: branch.name,
    city: branch.city,
    district: branch.district,
    address: branch.address,
    sortOrder: Number(branch.sortOrder || 0),
  };
}

function groupBranchesByCity(branches = []) {
  const grouped = branches.reduce((result, branch) => {
    const cityKey = branch.city;

    if (!result[cityKey]) {
      result[cityKey] = [];
    }

    result[cityKey].push(branch);
    return result;
  }, {});

  return Object.entries(grouped).map(([city, items]) => ({
    city,
    branches: items.sort((firstBranch, secondBranch) => {
      if (firstBranch.sortOrder !== secondBranch.sortOrder) {
        return firstBranch.sortOrder - secondBranch.sortOrder;
      }

      return firstBranch.name.localeCompare(secondBranch.name, "vi");
    }),
  }));
}

function StoresPage() {
  const [storeAreas, setStoreAreas] = useState([]);
  const [isBranchesLoading, setIsBranchesLoading] = useState(true);
  const [branchesError, setBranchesError] = useState("");

  useEffect(() => {
    const fetchBranches = async () => {
      setIsBranchesLoading(true);
      setBranchesError("");

      try {
        // Lấy danh sách chi nhánh từ backend để trang stores và booking luôn hiển thị cùng một nguồn dữ liệu.
        const response = await http.get("user/branches");
        const items = (response?.data?.items || []).map(mapStoreBranch);
        setStoreAreas(groupBranchesByCity(items));
      } catch (error) {
        setStoreAreas([]);
        setBranchesError("Không thể tải hệ thống cửa hàng lúc này.");
      } finally {
        setIsBranchesLoading(false);
      }
    };

    fetchBranches();
  }, []);
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

            <HeaderAuthArea />
          </div>
        </header>
      </Header>

      <main className="service-page-fade">
        {/* Hero banner trang hệ thống cửa hàng */}
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

        {/* Khu vực hiển thị danh sách chi nhánh theo từng thành phố */}
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

          {/* Mỗi block là một khu vực như TP.HCM hoặc Hà Nội */}
          <div className="relative mx-auto max-w-[1560px] space-y-16">
            {isBranchesLoading ? (
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`store-skeleton-${index}`}
                    className="aspect-[0.82] rounded-[28px] border border-white/10 bg-[#120d08]/80 p-6"
                  >
                    <div className="h-6 w-1/2 animate-pulse rounded bg-white/10" />
                    <div className="mt-6 h-52 w-full animate-pulse rounded-2xl bg-white/8" />
                    <div className="mt-6 h-16 animate-pulse rounded-2xl bg-white/8" />
                  </div>
                ))}
              </div>
            ) : branchesError ? (
              <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 px-6 py-5 text-center text-sm text-amber-100">
                {branchesError}
              </div>
            ) : storeAreas.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-[#0d1215] px-6 py-10 text-center text-sm text-white/55">
                Hiện chưa có dữ liệu chi nhánh để hiển thị.
              </div>
            ) : (
              storeAreas.map((area, areaIndex) => (
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

                  {/* Grid các khung chi nhánh trong từng khu vực */}
                  <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                    {area.branches.map((branch, branchIndex) => (
                      <article
                        key={branch.id}
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
                            alt={branch.name}
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
                              {branch.name}
                            </h3>

                            <img
                              src="/store-1.png"
                              alt={branch.name}
                              className="mt-5 h-52 w-full rounded-2xl border border-white/15 bg-black/20 object-contain object-center p-2 md:h-60"
                            />

                            <div className="mt-3 w-[86%] max-w-[300px] rounded-[14px] bg-gradient-to-b from-[#1a120d]/88 to-[#110b07]/82 px-3 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.28)] md:mt-4">
                              <p className="text-[11px] leading-[1.5] font-medium tracking-[0.01em] break-words text-[#f7efe0] drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] md:text-[12px]">
                                {branch.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default StoresPage;
