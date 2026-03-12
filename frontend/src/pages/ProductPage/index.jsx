import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import { formatCurrency } from "@/utils/dashboard";
import http from "@/utils/http";

const PRODUCT_PAGE_SIZE = 6;
const AVAILABILITY_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Còn hàng", value: "IN_STOCK" },
  { label: "Hết hàng", value: "OUT_OF_STOCK" },
];
const SORT_OPTIONS = [
  { label: "Mới nhất", value: "newest" },
  { label: "Giá tăng dần", value: "price_asc" },
  { label: "Giá giảm dần", value: "price_desc" },
];
const QUICK_FILTERS = [
  {
    label: "Tất cả",
    isActive: ({ availability, sort }) => !availability && sort === "newest",
    apply: ({
      setAvailability,
      setSort,
      setSearchInput,
      setAppliedSearch,
      setCurrentPage,
    }) => {
      setAvailability("");
      setSort("newest");
      setSearchInput("");
      setAppliedSearch("");
      setCurrentPage(1);
    },
  },
  {
    label: "Còn hàng",
    isActive: ({ availability }) => availability === "IN_STOCK",
    apply: ({ setAvailability, setCurrentPage }) => {
      setAvailability("IN_STOCK");
      setCurrentPage(1);
    },
  },
  {
    label: "Hết hàng",
    isActive: ({ availability }) => availability === "OUT_OF_STOCK",
    apply: ({ setAvailability, setCurrentPage }) => {
      setAvailability("OUT_OF_STOCK");
      setCurrentPage(1);
    },
  },
  {
    label: "Giá thấp",
    isActive: ({ sort }) => sort === "price_asc",
    apply: ({ setSort, setCurrentPage }) => {
      setSort("price_asc");
      setCurrentPage(1);
    },
  },
];

function getStockBadge(product) {
  if (product.stockStatus === "OUT_OF_STOCK") {
    return {
      label: "Hết hàng",
      className: "bg-red-200 text-red-900",
    };
  }

  if (product.stockStatus === "LOW_STOCK") {
    return {
      label: "Sắp hết",
      className: "bg-amber-200 text-amber-900",
    };
  }

  return {
    label: "Còn hàng",
    className: "bg-[#f3dfb8] text-[#2b1b10]",
  };
}

function getProductFallbackLabel(name) {
  return String(name || "SP")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item.slice(0, 3).toUpperCase())
    .join(" ");
}

function ProductPage() {
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [availability, setAvailability] = useState("");
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PRODUCT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const currentPage = pagination.page || 1;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Gọi API public để trang sản phẩm hiển thị dữ liệu thật thay cho danh sách mock cứng.
        const response = await http.get("user/products", {
          params: {
            page: currentPage,
            limit: PRODUCT_PAGE_SIZE,
            sort,
            ...(appliedSearch ? { search: appliedSearch } : {}),
            ...(availability ? { availability } : {}),
          },
        });
        const nextData = response?.data || {};
        setProducts(Array.isArray(nextData.items) ? nextData.items : []);
        setPagination(
          nextData.pagination || {
            page: 1,
            limit: PRODUCT_PAGE_SIZE,
            total: 0,
            totalPages: 1,
          },
        );
      } catch (fetchError) {
        setProducts([]);
        setError("Không thể tải danh sách sản phẩm lúc này.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [appliedSearch, availability, currentPage, sort]);

  const showingText = useMemo(() => {
    if (!pagination.total) {
      return "Hiển thị 0 / 0 sản phẩm";
    }

    const from = (pagination.page - 1) * pagination.limit + 1;
    const to = Math.min(pagination.page * pagination.limit, pagination.total);
    return `Hiển thị ${from} - ${to} / ${pagination.total} sản phẩm`;
  }, [pagination]);

  const handleApplyFilters = () => {
    // Tách input đang gõ và query đã apply để chỉ fetch lại khi user bấm lọc.
    setAppliedSearch(searchInput.trim());
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setAppliedSearch("");
    setAvailability("");
    setSort("newest");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleChangeSort = (event) => {
    setSort(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleChangeAvailability = (value) => {
    setAvailability(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > (pagination.totalPages || 1)) {
      return;
    }

    setPagination((prev) => ({ ...prev, page: nextPage }));
  };

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

            <HeaderAuthArea />
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
          </div>
          <section className="grid gap-5 lg:grid-cols-[270px_1fr] xl:grid-cols-[285px_1fr]">
            <aside className="product-sidebar-reveal h-fit rounded-[24px] border border-white/8 bg-[#130d09] p-4 lg:sticky lg:top-24">
              <div className="rounded-[18px] border border-white/8 bg-[#1b130d] p-4">
                <h2 className="text-base font-bold text-[#f4e3c3]">
                  Tìm kiếm sản phẩm
                </h2>
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
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Nhập tên sản phẩm"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-white/8 bg-[#1b130d] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#f4e3c3]">
                    Tình trạng sản phẩm
                  </h3>
                  <span className="text-xs text-white/35">
                    {pagination.total || 0} sản phẩm
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {AVAILABILITY_OPTIONS.map((item) => (
                    <label
                      key={item.label}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-white/75 transition hover:border-white/10 hover:bg-white/5"
                    >
                      <input
                        type="radio"
                        name="availability"
                        checked={availability === item.value}
                        onChange={() => handleChangeAvailability(item.value)}
                        className="h-4 w-4 accent-[#c8a96e]"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-white/8 bg-[#1b130d] p-4">
                <h3 className="text-sm font-bold text-[#f4e3c3]">Sắp xếp</h3>
                <div className="mt-3 space-y-2">
                  {SORT_OPTIONS.map((item) => (
                    <label
                      key={item.value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-white/75 transition hover:border-white/10 hover:bg-white/5"
                    >
                      <input
                        type="radio"
                        name="sidebar-sort"
                        checked={sort === item.value}
                        onChange={() =>
                          handleChangeSort({ target: { value: item.value } })
                        }
                        className="h-4 w-4 accent-[#c8a96e]"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <button
                  onClick={handleApplyFilters}
                  className="rounded-xl bg-[#c8a96e] px-4 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
                >
                  Lọc sản phẩm
                </button>
                <button
                  onClick={handleResetFilters}
                  className="rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                >
                  Đặt lại
                </button>
              </div>
            </aside>

            <div className="space-y-5">
              <div className="product-toolbar-reveal rounded-[22px] border border-white/8 bg-[#130d09] p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {QUICK_FILTERS.map((item) => {
                      const isActive = item.isActive({ availability, sort });

                      return (
                        <button
                          key={item.label}
                          onClick={() =>
                            item.apply({
                              setAvailability,
                              setSort,
                              setSearchInput,
                              setAppliedSearch,
                              setCurrentPage: (nextPage) =>
                                setPagination((prev) => ({
                                  ...prev,
                                  page: nextPage,
                                })),
                            })
                          }
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                            isActive
                              ? "bg-[#c8a96e] text-[#1a130b]"
                              : "border border-white/12 bg-white/5 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <p className="text-sm text-white/55">{showingText}</p>
                    <select
                      value={sort}
                      onChange={handleChangeSort}
                      className="rounded-xl border border-white/12 bg-[#1b130d] px-4 py-2.5 text-sm text-white focus:outline-none"
                    >
                      {SORT_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-[22px] border border-red-400/20 bg-red-500/10 px-5 py-6 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {isLoading
                  ? Array.from({ length: PRODUCT_PAGE_SIZE }).map(
                      (_, index) => (
                        <div
                          key={`product-skeleton-${index}`}
                          className="overflow-hidden rounded-[22px] border border-white/8 bg-[#130d09]"
                        >
                          <div className="h-56 animate-pulse bg-white/8" />
                          <div className="space-y-3 p-4">
                            <div className="h-3 w-24 animate-pulse rounded bg-white/8" />
                            <div className="h-5 w-3/4 animate-pulse rounded bg-white/8" />
                            <div className="h-4 w-full animate-pulse rounded bg-white/8" />
                            <div className="h-4 w-2/3 animate-pulse rounded bg-white/8" />
                          </div>
                        </div>
                      ),
                    )
                  : null}

                {!isLoading && !error && products.length === 0 ? (
                  <div className="col-span-full rounded-[22px] border border-white/8 bg-[#130d09] px-5 py-10 text-center">
                    <p className="text-lg font-semibold text-[#f4e3c3]">
                      Không tìm thấy sản phẩm phù hợp.
                    </p>
                    <p className="mt-2 text-sm text-white/55">
                      Mày thử đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc nha.
                    </p>
                  </div>
                ) : null}

                {!isLoading && !error
                  ? products.map((product, index) => {
                      const stockBadge = getStockBadge(product);

                      return (
                        <article
                          key={product.id}
                          className="product-card-reveal overflow-hidden rounded-[22px] border border-white/8 bg-[#130d09] transition hover:-translate-y-1 hover:border-[#c8a96e]/35"
                          style={{ animationDelay: `${0.16 + index * 0.08}s` }}
                        >
                          <div className="bg-gradient-to-br from-[#f0ddb5] via-[#d4b07a] to-[#8a6030] p-[1px]">
                            <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-t-[21px] bg-[#18100b]">
                              <span
                                className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold ${stockBadge.className}`}
                              >
                                {stockBadge.label}
                              </span>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />

                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-36 w-36 items-center justify-center rounded-[28px] border border-white/15 bg-white/10 px-4 text-center text-lg font-bold tracking-[0.18em] text-[#f4e3c3] uppercase shadow-[0_18px_36px_rgba(0,0,0,0.35)]">
                                  {getProductFallbackLabel(product.name)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-4">
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#c8a96e] uppercase">
                              {product.stock > 0
                                ? `Còn ${product.stock} sản phẩm`
                                : "Tạm hết hàng"}
                            </p>
                            <h3 className="mt-2 text-base font-bold text-[#f4e3c3]">
                              {product.name}
                            </h3>

                            <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/8 pt-4">
                              <div>
                                <p className="text-sm text-white/45">Giá bán</p>
                                <p className="mt-1 text-xl font-bold text-[#d8b77a]">
                                  {formatCurrency(product.price)}
                                </p>
                              </div>
                              <Link
                                to={`/product/${product.id}`}
                                className="inline-flex items-center justify-center rounded-xl bg-[#c8a96e] px-4 py-2.5 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
                              >
                                Xem chi tiết
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  : null}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className="rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Trước
                </button>

                {Array.from(
                  { length: pagination.totalPages || 1 },
                  (_, index) => index + 1,
                ).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    disabled={isLoading}
                    className={`rounded-xl px-4 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      pageNumber === currentPage
                        ? "bg-[#c8a96e] font-bold text-[#1a130b]"
                        : "border border-white/12 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={
                    currentPage >= (pagination.totalPages || 1) || isLoading
                  }
                  className="rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
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
