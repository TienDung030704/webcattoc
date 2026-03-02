import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

const filterCategories = [
  { name: "Sáp vuốt tóc", count: 12 },
  { name: "Pomade", count: 8 },
  { name: "Gôm xịt giữ nếp", count: 6 },
  { name: "Dầu gội", count: 10 },
  { name: "Dầu xả", count: 7 },
  { name: "Tinh dầu dưỡng tóc", count: 5 },
];

const holdLevels = ["Nhẹ", "Trung bình", "Mạnh"];

const priceRanges = ["Dưới 200.000đ", "200.000đ - 350.000đ", "Trên 350.000đ"];

const products = [
  {
    name: "Matte Wax Premium",
    type: "Sáp vuốt tóc",
    description: "Giữ nếp tự nhiên, hoàn thiện mái tóc gọn gàng suốt ngày dài.",
    price: "289.000đ",
    oldPrice: "349.000đ",
    badge: "-17%",
    short: "WAX",
    accent: "from-[#f0ddb5] via-[#d4b07a] to-[#8a6030]",
  },
  {
    name: "Pomade Classic Shine",
    type: "Pomade",
    description: "Độ bóng vừa phải, dễ tạo kiểu side part và slick back hiện đại.",
    price: "320.000đ",
    oldPrice: "390.000đ",
    badge: "Mới",
    short: "POM",
    accent: "from-[#f7e8cd] via-[#d7b784] to-[#7b5531]",
  },
  {
    name: "Texture Clay Strong Hold",
    type: "Sáp vuốt tóc",
    description: "Chất clay mạnh, tăng texture rõ nét và giữ form tốt cho tóc ngắn.",
    price: "305.000đ",
    oldPrice: "365.000đ",
    badge: "Hot",
    short: "CLAY",
    accent: "from-[#e0c58f] via-[#a6763f] to-[#55331a]",
  },
  {
    name: "Sea Salt Spray Volume",
    type: "Gôm xịt giữ nếp",
    description: "Tạo độ phồng tự nhiên, hỗ trợ pre-styling nhanh gọn trước khi sấy.",
    price: "245.000đ",
    oldPrice: "299.000đ",
    badge: "-12%",
    short: "SPRAY",
    accent: "from-[#e2d2b1] via-[#bf985e] to-[#6d4528]",
  },
  {
    name: "Shampoo Refresh Cleanse",
    type: "Dầu gội",
    description: "Làm sạch dịu nhẹ da đầu, giảm bết tóc và cảm giác khó chịu.",
    price: "219.000đ",
    oldPrice: "269.000đ",
    badge: "Care",
    short: "CARE",
    accent: "from-[#efe3ca] via-[#d0b07b] to-[#7c5832]",
  },
  {
    name: "Hair Serum Nourish Oil",
    type: "Tinh dầu dưỡng tóc",
    description: "Tinh dầu dưỡng tóc mềm mượt, giảm khô xơ và tăng độ bóng khỏe.",
    price: "359.000đ",
    oldPrice: "429.000đ",
    badge: "Best",
    short: "SERUM",
    accent: "from-[#f6e8cf] via-[#cea46a] to-[#6b4428]",
  },
];

const quickFilters = ["Tất cả", "Bán chạy", "Giá tốt", "Cao cấp"];

function ProductPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(8, 6, 4, 0.48), rgba(8, 6, 4, 0.68)), url('/bg-product.png?v=2')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
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
                className="rounded-full bg-[#c8a96e] px-4 py-2 font-semibold text-[#1a130b]"
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

      <main className="product-page-fade mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/45">
          <Link to="/" className="transition hover:text-white/75">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-[#d8b77a]">Sản phẩm</span>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#17100b]/90 p-4 md:p-5">
          <div className="mb-5 flex flex-col gap-3 border-b border-white/8 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.22em] text-[#c8a96e] uppercase">
                Danh mục sản phẩm
              </p>
              <h1 className="mt-2 text-2xl font-bold text-[#f4e3c3] md:text-3xl">
                Chọn sản phẩm phù hợp với chất tóc của bạn
              </h1>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/60 lg:text-right">
              Bộ lọc nằm bên trái và danh sách sản phẩm ở bên phải như layout
              trong mẫu.
            </p>
          </div>

          <section className="grid gap-5 lg:grid-cols-[270px_1fr] xl:grid-cols-[285px_1fr]">
            <aside className="product-sidebar-reveal h-fit rounded-[24px] border border-white/8 bg-[#130d09] p-4 lg:sticky lg:top-24">
              <div className="rounded-[18px] border border-white/8 bg-[#1b130d] p-4">
                <h2 className="text-base font-bold text-[#f4e3c3]">Tìm kiếm sản phẩm</h2>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-[#120d08] px-3 py-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 text-white/45"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Nhập tên sản phẩm"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-white/8 bg-[#1b130d] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#f4e3c3]">Danh mục</h3>
                  <span className="text-xs text-white/35">06 mục</span>
                </div>
                <div className="mt-3 space-y-2">
                  {filterCategories.map((item, index) => (
                    <label
                      key={item.name}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-transparent px-3 py-2 text-sm text-white/75 transition hover:border-white/10 hover:bg-white/5"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          defaultChecked={index < 2}
                          className="h-4 w-4 rounded border-white/30 bg-transparent accent-[#c8a96e]"
                        />
                        {item.name}
                      </span>
                      <span className="text-xs text-white/35">{item.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-white/8 bg-[#1b130d] p-4">
                <h3 className="text-sm font-bold text-[#f4e3c3]">Độ giữ nếp</h3>
                <div className="mt-3 space-y-2">
                  {holdLevels.map((item, index) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-white/75 transition hover:border-white/10 hover:bg-white/5"
                    >
                      <input
                        type="radio"
                        name="hold"
                        defaultChecked={index === 1}
                        className="h-4 w-4 accent-[#c8a96e]"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-white/8 bg-[#1b130d] p-4">
                <h3 className="text-sm font-bold text-[#f4e3c3]">Mức giá</h3>
                <div className="mt-3 space-y-2">
                  {priceRanges.map((item, index) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-white/75 transition hover:border-white/10 hover:bg-white/5"
                    >
                      <input
                        type="radio"
                        name="price"
                        defaultChecked={index === 1}
                        className="h-4 w-4 accent-[#c8a96e]"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <button className="rounded-xl bg-[#c8a96e] px-4 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]">
                  Lọc sản phẩm
                </button>
                <button className="rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10">
                  Đặt lại
                </button>
              </div>
            </aside>

            <div className="space-y-5">
              <div className="product-toolbar-reveal rounded-[22px] border border-white/8 bg-[#130d09] p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {quickFilters.map((item, index) => (
                      <button
                        key={item}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          index === 0
                            ? "bg-[#c8a96e] text-[#1a130b]"
                            : "border border-white/12 bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <p className="text-sm text-white/55">Hiển thị 1 - 6 / 18 sản phẩm</p>
                    <select className="rounded-xl border border-white/12 bg-[#1b130d] px-4 py-2.5 text-sm text-white focus:outline-none">
                      <option>Sắp xếp mặc định</option>
                      <option>Giá tăng dần</option>
                      <option>Giá giảm dần</option>
                      <option>Bán chạy nhất</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product, index) => (
                  <article
                    key={product.name}
                    className="product-card-reveal overflow-hidden rounded-[22px] border border-white/8 bg-[#130d09] transition hover:-translate-y-1 hover:border-[#c8a96e]/35"
                    style={{ animationDelay: `${0.16 + index * 0.08}s` }}
                  >
                    <div className={`bg-gradient-to-br ${product.accent} p-[1px]`}>
                      <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-t-[21px] bg-[#18100b]">
                        <span className="absolute left-3 top-3 rounded-full bg-[#f3dfb8] px-3 py-1 text-xs font-bold text-[#2b1b10]">
                          {product.badge}
                        </span>
                        <button className="absolute right-3 top-3 h-8 w-8 rounded-full border border-white/30 bg-[#1b130d]/85 text-white/75 transition hover:text-white">
                          ♥
                        </button>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />
                        <div className="absolute h-40 w-24 rounded-[30px] border border-white/20 bg-gradient-to-b from-[#f8e6c5] via-[#ecd3a7] to-[#a97844] shadow-[0_18px_36px_rgba(0,0,0,0.35)]" />
                        <div className="absolute top-[56px] h-7 w-14 rounded-t-2xl border border-white/15 bg-[#2b1b12]" />
                        <div className="absolute top-[84px] flex h-28 w-20 flex-col items-center justify-center rounded-[20px] border border-[#8c643a]/25 bg-white/80 px-2 text-center text-[#3d2918] shadow-inner">
                          <p className="text-[8px] tracking-[0.22em] uppercase text-[#7b5c3e]">
                            Premium
                          </p>
                          <p className="mt-1 text-lg font-bold">{product.short}</p>
                          <p className="text-[9px] text-[#7b5c3e]">Barber</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-[#c8a96e] uppercase">
                        {product.type}
                      </p>
                      <h3 className="mt-2 text-base font-bold text-[#f4e3c3]">{product.name}</h3>
                      <p className="mt-2 min-h-[44px] text-sm leading-6 text-white/60">
                        {product.description}
                      </p>

                      <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/8 pt-4">
                        <div>
                          <p className="text-sm text-white/35 line-through">{product.oldPrice}</p>
                          <p className="mt-1 text-xl font-bold text-[#d8b77a]">{product.price}</p>
                        </div>
                        <Link
                          to="/contact"
                          className="inline-flex items-center justify-center rounded-xl bg-[#c8a96e] px-4 py-2.5 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
                        >
                          Xem
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button className="rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/10">
                  Trước
                </button>
                <button className="rounded-xl bg-[#c8a96e] px-4 py-2.5 text-sm font-bold text-[#1a130b]">
                  1
                </button>
                <button className="rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/10">
                  2
                </button>
                <button className="rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/10">
                  3
                </button>
                <button className="rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/10">
                  Sau
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProductPage;
