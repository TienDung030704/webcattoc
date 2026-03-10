import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import http from "@/utils/http";

const NEWS_PAGE_SIZE = 9;
const NEWS_FALLBACK_IMAGE = "/store-3.jpg";

function formatNewsDate(value) {
  if (!value) {
    return "Đang cập nhật";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Đang cập nhật";
  }

  return date
    .toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, ".");
}

function mapNewsCard(item, category) {
  return {
    id: item?.id,
    slug: item?.slug,
    category,
    date: formatNewsDate(item?.createdAt),
    title: String(item?.title || "Bài viết đang được cập nhật").trim(),
    excerpt: String(
      item?.excerpt || item?.summary || "Nội dung bài viết đang được cập nhật.",
    ).trim(),
    image: String(item?.image || item?.thumbnail || NEWS_FALLBACK_IMAGE).trim(),
  };
}

function NewsSkeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-[28px] bg-white/8 ${className}`} />;
}

function NewsPage() {
  const [newsItems, setNewsItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: NEWS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Lấy danh sách bài viết public thật để thay toàn bộ dữ liệu mock cứng ở trang News.
        const response = await http.get("news", {
          params: {
            page: 1,
            limit: NEWS_PAGE_SIZE,
          },
        });
        const nextData = response?.data || {};
        setNewsItems(Array.isArray(nextData.items) ? nextData.items : []);
        setPagination(
          nextData.pagination || {
            page: 1,
            limit: NEWS_PAGE_SIZE,
            total: 0,
            totalPages: 1,
          },
        );
      } catch (fetchError) {
        setNewsItems([]);
        setPagination({
          page: 1,
          limit: NEWS_PAGE_SIZE,
          total: 0,
          totalPages: 1,
        });
        setError("Không thể tải danh sách bài viết lúc này.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const featuredPost = useMemo(() => {
    if (!newsItems[0]) {
      return null;
    }

    return mapNewsCard(newsItems[0], "Nổi bật");
  }, [newsItems]);

  const spotlightPosts = useMemo(() => {
    // Chia dữ liệu live thành đúng layout tạp chí hiện tại: 1 featured + 2 spotlight + phần grid.
    return newsItems.slice(1, 3).map((item) => mapNewsCard(item, "Tin mới"));
  }, [newsItems]);

  const newsPosts = useMemo(() => {
    return newsItems.slice(3).map((item) => mapNewsCard(item, "Tin tức"));
  }, [newsItems]);

  const hasNews = Boolean(featuredPost) || spotlightPosts.length > 0 || newsPosts.length > 0;

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
                className="rounded-full bg-[#c8a96e] px-4 py-2 font-semibold text-[#1a130b]"
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
        {/* Hero banner trang tin tức */}
        <section className="relative h-[280px] overflow-hidden md:h-[340px] lg:h-[390px]">
          <img
            src="/bg-cuthair-2.png"
            alt="Tin tức barber"
            className="service-hero-zoom h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(4,4,4,0.28),rgba(4,4,4,0.52),rgba(4,4,4,0.88))]" />
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-black tracking-[0.06em] text-[#f6e7c7] uppercase md:text-6xl lg:text-7xl">
                Tin tức
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/80 md:text-base md:leading-8 lg:text-lg">
                Cập nhật xu hướng tóc nam, mẹo chăm sóc tóc và những nội dung
                nổi bật từ MDT BaberShop.
              </p>
            </div>
          </div>
        </section>

        {/* Khu vực nội dung chính của trang tin tức */}
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

          {/* Container chính chứa breadcrumb, bài nổi bật và danh sách bài viết */}
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/45">
              <Link to="/" className="transition hover:text-white/75">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-[#d8b77a]">Tin tức</span>
            </div>

            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 text-sm text-white/45">
              <span>Trang tin tức đang dùng dữ liệu thật từ backend.</span>
              <span>
                {pagination.total
                  ? `Đang hiển thị ${Math.min(newsItems.length, pagination.total)} / ${pagination.total} bài viết`
                  : "Chưa có bài viết nào được hiển thị"}
              </span>
            </div>

            {error ? (
              <div className="mb-8 rounded-[22px] border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-100 shadow-[0_12px_40px_rgba(127,29,29,0.2)]">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <>
                <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#140e09]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:p-6">
                    <NewsSkeleton className="h-[320px] w-full md:h-[420px]" />
                    <NewsSkeleton className="mt-6 h-6 w-32" />
                    <NewsSkeleton className="mt-4 h-12 w-full max-w-3xl" />
                    <NewsSkeleton className="mt-4 h-5 w-full max-w-2xl" />
                    <NewsSkeleton className="mt-2 h-5 w-11/12 max-w-2xl" />
                  </div>

                  <div className="grid gap-6">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-[28px] border border-white/10 bg-[#140e09]/88 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] md:p-6"
                      >
                        <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
                          <NewsSkeleton className="h-[220px] w-full" />
                          <div>
                            <NewsSkeleton className="h-4 w-32" />
                            <NewsSkeleton className="mt-4 h-10 w-full" />
                            <NewsSkeleton className="mt-4 h-5 w-full" />
                            <NewsSkeleton className="mt-2 h-5 w-10/12" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mt-14">
                  <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <NewsSkeleton className="h-4 w-28" />
                      <NewsSkeleton className="mt-4 h-12 w-full max-w-xl" />
                    </div>
                    <NewsSkeleton className="h-5 w-full max-w-2xl" />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-[26px] border border-white/10 bg-[#120d08]/88 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)] md:p-6"
                      >
                        <NewsSkeleton className="h-[250px] w-full" />
                        <NewsSkeleton className="mt-5 h-4 w-24" />
                        <NewsSkeleton className="mt-4 h-10 w-full" />
                        <NewsSkeleton className="mt-4 h-5 w-full" />
                        <NewsSkeleton className="mt-2 h-5 w-10/12" />
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : !hasNews ? (
              <div className="rounded-[28px] border border-white/10 bg-[#140e09]/88 px-6 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                  Tin tức
                </p>
                <h2 className="mt-4 text-3xl font-black tracking-[0.04em] text-[#f6e7c7] uppercase md:text-4xl">
                  Chưa có bài viết nào được hiển thị
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
                  Khi có bài viết mới được publish, nội dung sẽ tự động xuất hiện tại
                  đây mà không cần dùng dữ liệu mock nữa.
                </p>
              </div>
            ) : (
              <>
                {/* Layout trên: 1 bài nổi bật lớn và 2 bài spotlight bên phải */}
                <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  {featuredPost ? (
                    <article className="overflow-hidden rounded-[30px] border border-white/10 bg-[#140e09]/90 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
                      <div className="relative h-[320px] overflow-hidden md:h-[420px]">
                        <img
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.08),rgba(0,0,0,0.22),rgba(0,0,0,0.78))]" />
                        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase">
                            <span className="rounded-full bg-[#c8a96e] px-3 py-1 text-[#1a130b]">
                              {featuredPost.category}
                            </span>
                            <span className="text-white/70">{featuredPost.date}</span>
                          </div>
                          <h2 className="mt-4 max-w-3xl text-2xl leading-tight font-black text-[#f6e7c7] md:text-4xl">
                            {featuredPost.title}
                          </h2>
                          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base md:leading-8">
                            {featuredPost.excerpt}
                          </p>
                        </div>
                      </div>
                    </article>
                  ) : null}

                  {spotlightPosts.length > 0 ? (
                    <div className="grid gap-6">
                      {spotlightPosts.map((post, index) => (
                        <article
                          key={post.id || post.slug || post.title}
                          className="product-card-reveal overflow-hidden rounded-[28px] border border-white/10 bg-[#140e09]/88 shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
                          style={{ animationDelay: `${0.12 + index * 0.1}s` }}
                        >
                          <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
                            <div className="h-[220px] md:h-full">
                              <img
                                src={post.image}
                                alt={post.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col justify-center p-5 md:p-6">
                              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase">
                                <span className="text-[#c8a96e]">{post.category}</span>
                                <span className="text-white/40">{post.date}</span>
                              </div>
                              <h3 className="mt-3 text-xl leading-snug font-bold text-[#f6e7c7]">
                                {post.title}
                              </h3>
                              <p className="mt-3 text-sm leading-7 text-white/65">
                                {post.excerpt}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </section>

                {/* Khu vực grid các bài viết mới */}
                {newsPosts.length > 0 ? (
                  <section className="mt-14">
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                          Bài viết mới
                        </p>
                        <h2 className="mt-3 text-3xl font-black tracking-[0.04em] text-[#f6e7c7] uppercase md:text-5xl">
                          Khám phá thêm nội dung nổi bật
                        </h2>
                      </div>
                      <p className="max-w-2xl text-sm leading-7 text-white/60 md:text-right">
                        Những bài viết được sắp xếp theo phong cách tạp chí hiện đại,
                        giúp người dùng dễ theo dõi và khám phá nhanh các nội dung
                        mới.
                      </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {newsPosts.map((post, index) => (
                        <article
                          key={post.id || post.slug || post.title}
                          className="product-card-reveal overflow-hidden rounded-[26px] border border-white/10 bg-[#120d08]/88 shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:border-[#c8a96e]/30"
                          style={{ animationDelay: `${0.16 + index * 0.08}s` }}
                        >
                          <div className="relative h-[250px] overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04),rgba(0,0,0,0.12),rgba(0,0,0,0.5))]" />
                            <div className="absolute top-4 left-4 rounded-full bg-[#f6e7c7] px-3 py-1 text-[11px] font-bold text-[#1a130b] uppercase">
                              {post.category}
                            </div>
                          </div>

                          <div className="p-5 md:p-6">
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase">
                              {post.date}
                            </p>
                            <h3 className="mt-3 text-xl leading-snug font-bold text-[#f6e7c7]">
                              {post.title}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-white/65">
                              {post.excerpt}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer dùng chung toàn site */}
      <Footer />
    </div>
  );
}

export default NewsPage;
