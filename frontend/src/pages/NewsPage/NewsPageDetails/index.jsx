import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import http from "@/utils/http";

const NEWS_DETAIL_FALLBACK_IMAGE = "/store-3.jpg";

function formatNewsDate(value) {
  if (!value) {
    return "Đang cập nhật";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Đang cập nhật";
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function NewsDetailSkeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-[24px] bg-white/8 ${className}`} />
  );
}
function NewsPageDetails() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isDisposed = false;

    const fetchNewsDetail = async () => {
      if (!slug) {
        setArticle(null);
        setError("Không tìm thấy bài viết cần đọc.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        // Đọc slug từ URL để gọi đúng bài viết public đang được publish.
        const response = await http.get(`news/${slug}`);

        if (isDisposed) {
          return;
        }

        setArticle(response?.data || null);
      } catch (fetchError) {
        if (isDisposed) {
          return;
        }

        setArticle(null);
        setError(
          fetchError?.response?.data?.error ||
            "Không thể tải nội dung bài viết.",
        );
      } finally {
        if (!isDisposed) {
          setIsLoading(false);
        }
      }
    };

    fetchNewsDetail();

    return () => {
      isDisposed = true;
    };
  }, [slug]);

  const heroImage = useMemo(() => {
    return String(
      article?.image || article?.thumbnail || NEWS_DETAIL_FALLBACK_IMAGE,
    ).trim();
  }, [article]);

  const articleTitle = String(article?.title || "Chi tiết bài viết").trim();
  const articleContent = String(article?.content || "").trim();
  const articleDate = formatNewsDate(article?.createdAt);

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

      <main>
        <section className="relative h-[280px] overflow-hidden md:h-[340px] lg:h-[390px]">
          <img
            src="/bg-cuthair-2.png"
            alt="Chi tiết tin tức"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(4,4,4,0.35),rgba(4,4,4,0.58),rgba(4,4,4,0.9))]" />
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <div className="max-w-5xl">
              <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                Tin tức barber
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-[0.06em] text-[#f6e7c7] uppercase md:text-6xl lg:text-7xl">
                Đọc bài viết chi tiết
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/80 md:text-base md:leading-8 lg:text-lg">
                Xem đầy đủ nội dung bài viết, xu hướng tóc nam và những chia sẻ
                mới nhất từ MDT BaberShop.
              </p>
            </div>
          </div>
        </section>

        <section
          className="relative overflow-hidden px-4 pt-12 pb-20 md:px-8 md:pt-16 md:pb-24"
          style={{
            backgroundImage:
              "linear-gradient(rgba(4,4,4,0.96), rgba(4,4,4,0.985)), radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 32%), url('/bg-cuthair.png')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/45">
              <Link to="/" className="transition hover:text-white/75">
                Trang chủ
              </Link>
              <span>/</span>
              <Link to="/news" className="transition hover:text-white/75">
                Tin tức
              </Link>
              <span>/</span>
              <span className="text-[#d8b77a]">{articleTitle}</span>
            </div>

            {isLoading ? (
              <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[#140e09]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:p-7">
                <NewsDetailSkeleton className="h-[280px] w-full md:h-[420px]" />
                <NewsDetailSkeleton className="mt-6 h-4 w-36" />
                <NewsDetailSkeleton className="mt-4 h-14 w-full max-w-4xl" />
                <NewsDetailSkeleton className="mt-5 h-6 w-full max-w-3xl" />
                <NewsDetailSkeleton className="mt-3 h-5 w-full" />
                <NewsDetailSkeleton className="mt-3 h-5 w-full" />
                <NewsDetailSkeleton className="mt-3 h-5 w-11/12" />
                <NewsDetailSkeleton className="mt-10 h-5 w-full" />
                <NewsDetailSkeleton className="mt-3 h-5 w-full" />
                <NewsDetailSkeleton className="mt-3 h-5 w-10/12" />
              </section>
            ) : null}

            {!isLoading && error ? (
              <section className="rounded-[28px] border border-red-400/20 bg-red-500/10 px-6 py-10 text-center shadow-[0_20px_60px_rgba(127,29,29,0.2)]">
                <p className="text-sm font-semibold tracking-[0.24em] text-[#f6c3c3] uppercase">
                  Tin tức
                </p>
                <h2 className="mt-4 text-3xl font-black text-red-100 md:text-4xl">
                  Không thể mở bài viết này
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-red-100/80 md:text-base">
                  {error}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/news"
                    className="rounded-2xl bg-[#c8a96e] px-6 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
                  >
                    Quay lại trang tin tức
                  </Link>
                  <Link
                    to="/contact"
                    className="rounded-2xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                  >
                    Liên hệ hỗ trợ
                  </Link>
                </div>
              </section>
            ) : null}

            {!isLoading && !error && article ? (
              <article className="overflow-hidden rounded-[30px] border border-white/10 bg-[#140e09]/90 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
                <div className="relative h-[280px] overflow-hidden md:h-[440px]">
                  <img
                    src={heroImage}
                    alt={articleTitle}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.12),rgba(0,0,0,0.22),rgba(0,0,0,0.8))]" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 lg:p-10">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase">
                      <span className="rounded-full bg-[#c8a96e] px-3 py-1 text-[#1a130b]">
                        Chi tiết bài viết
                      </span>
                      <span className="text-white/70">{articleDate}</span>
                    </div>
                    <h2 className="mt-4 max-w-4xl text-3xl leading-tight font-black text-[#f6e7c7] md:text-5xl">
                      {articleTitle}
                    </h2>
                  </div>
                </div>

                <div className="p-6 md:p-8 lg:p-10">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div>
                      <p className="text-sm font-semibold tracking-[0.2em] text-[#c8a96e] uppercase">
                        Nội dung bài viết
                      </p>
                      <p className="mt-2 text-sm text-white/55">
                        Bài viết public đang dùng dữ liệu thật từ backend.
                      </p>
                    </div>
                    <Link
                      to="/news"
                      className="inline-flex rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                    >
                      ← Quay lại tin tức
                    </Link>
                  </div>

                  <div className="mt-8 space-y-6">
                    <div className="rounded-[24px] border border-white/10 bg-[#120d08]/88 p-5 md:p-6 lg:p-8">
                      <p className="text-sm font-semibold tracking-[0.18em] text-[#c8a96e] uppercase">
                        Bài viết đầy đủ
                      </p>

                      {/* Nội dung admin hiện nhập từ textarea nên render text an toàn với xuống dòng gốc. */}
                      <div className="mt-5 text-sm leading-8 break-words whitespace-pre-line text-white/75 md:text-base">
                        {articleContent ||
                          "Bài viết này hiện chưa có nội dung chi tiết."}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default NewsPageDetails;
