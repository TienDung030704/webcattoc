import { useEffect, useMemo } from "react";
import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import { useCartActions } from "@/features/cart/hook";
import { useFavoriteActions, useFavoriteState } from "@/features/favorite/hook";
import { formatCurrency } from "@/utils/dashboard";

function getStockBadge(product) {
  if (product?.stockStatus === "OUT_OF_STOCK") {
    return {
      label: "Hết hàng",
      className: "bg-red-200 text-red-900",
    };
  }

  if (product?.stockStatus === "LOW_STOCK") {
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

function formatFavoriteDate(value) {
  if (!value) {
    return "Vừa thêm gần đây";
  }

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FavoritePage() {
  const navigate = useNavigate();
  const { addToCart } = useCartActions();
  const { getFavorites, removeFavorite } = useFavoriteActions();
  const {
    items: favoriteItems,
    total,
    loading,
    error,
    toggleLoadingByProductId,
  } = useFavoriteState();
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    // Mỗi lần vào trang yêu thích thì nạp lại danh sách mới nhất từ backend để đồng bộ với badge heart ở header.
    getFavorites();
  }, [getFavorites, isLoggedIn]);

  const favoriteSummary = useMemo(() => {
    const items = Array.isArray(favoriteItems) ? favoriteItems : [];
    const safeTotal = Number(total || items.length) || 0;

    return {
      items,
      total: safeTotal,
      showingText:
        safeTotal > 0
          ? `Đang lưu ${safeTotal} sản phẩm yêu thích của mày`
          : "Chưa có sản phẩm yêu thích nào được lưu",
    };
  }, [favoriteItems, total]);

  const handleRemoveFavorite = async (productId) => {
    const result = await removeFavorite(productId);

    if (result?.meta?.requestStatus !== "fulfilled") {
      toast.error(result?.payload || "Không thể bỏ sản phẩm khỏi yêu thích", {
        position: "top-right",
      });
      return;
    }

    toast.success("Đã bỏ sản phẩm khỏi danh sách yêu thích", {
      position: "top-right",
    });
  };

  const handleAddFavoriteToCart = (product) => {
    if (!product?.id) {
      return;
    }

    if (
      product.stockStatus === "OUT_OF_STOCK" ||
      Number(product.stock || 0) <= 0
    ) {
      toast.error("Sản phẩm này hiện đang hết hàng", {
        position: "top-right",
      });
      return;
    }

    // Thêm trực tiếp từ trang yêu thích nhưng vẫn giữ cùng snapshot cart như ở trang chi tiết sản phẩm.
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      stockStatus: product.stockStatus,
      quantity: 1,
    });

    toast.success("Đã thêm sản phẩm vào giỏ hàng", {
      position: "top-right",
    });
  };

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(8, 6, 4, 0.48), rgba(8, 6, 4, 0.72)), url('/bg-product.png?v=2')",
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

      <main className="product-page-fade mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/45">
          <Link to="/" className="transition hover:text-white/75">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-[#d8b77a]">Yêu thích</span>
        </div>

        <section className="rounded-[30px] border border-white/10 bg-[#17100b]/90 p-5 md:p-6">
          <div className="flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.22em] text-[#c8a96e] uppercase">
                Danh sách yêu thích
              </p>
              <h1 className="mt-2 text-2xl font-bold text-[#f4e3c3] md:text-3xl">
                Những sản phẩm đã YÊU THÍCH
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                Trang này sẽ gom toàn bộ các sản phẩm mày đã thả tim để xem lại
                nhanh, tiện quay lại mua hoặc bỏ khỏi danh sách yêu thích bất cứ
                lúc nào.
              </p>
            </div>

            <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] px-4 py-3 text-sm text-white/70">
              <p className="text-white/45">Tổng sản phẩm yêu thích</p>
              <p className="mt-1 text-2xl font-black text-[#f6e7c7]">
                {favoriteSummary.total}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[22px] border border-white/8 bg-[#130d09] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-white/55">
                {favoriteSummary.showingText}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/product"
                  className="rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                >
                  Xem thêm sản phẩm
                </Link>
                <Link
                  to="/cart"
                  className="rounded-xl bg-[#c8a96e] px-4 py-2.5 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
                >
                  Mở giỏ hàng
                </Link>
              </div>
            </div>
          </div>

          {!isLoggedIn ? (
            <div className="mt-5 rounded-[24px] border border-white/8 bg-[#130d09] px-5 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2a1b11] text-[#e8cf9d]">
                <Heart className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-[#f4e3c3]">
                Đăng nhập để xem sản phẩm yêu thích
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/55">
                Mày cần đăng nhập trước thì hệ thống mới lấy đúng danh sách sản
                phẩm đã thả tim của tài khoản hiện tại.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/auth/login")}
                  className="rounded-xl bg-[#c8a96e] px-5 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
                >
                  Đăng nhập ngay
                </button>
                <Link
                  to="/product"
                  className="rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                >
                  Tiếp tục xem sản phẩm
                </Link>
              </div>
            </div>
          ) : null}

          {isLoggedIn && error ? (
            <div className="mt-5 rounded-[24px] border border-red-400/20 bg-red-500/10 px-5 py-6 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {isLoggedIn && loading ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`favorite-skeleton-${index}`}
                  className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[22px] border border-white/8 bg-[#130d09]"
                >
                  <div className="h-52 animate-pulse bg-white/8" />
                  <div className="space-y-3 p-3.5">
                    <div className="h-3 w-24 animate-pulse rounded bg-white/8" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-white/8" />
                    <div className="h-4 w-full animate-pulse rounded bg-white/8" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-white/8" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {isLoggedIn &&
          !loading &&
          !error &&
          favoriteSummary.items.length === 0 ? (
            <div className="mt-5 rounded-[24px] border border-white/8 bg-[#130d09] px-5 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2a1b11] text-[#e8cf9d]">
                <Heart className="h-7 w-7 fill-current" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-[#f4e3c3]">
                Chưa có sản phẩm nào trong mục yêu thích
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/55">
                Khi mày bấm tim ở trang chi tiết sản phẩm, món đó sẽ hiện ở đây
                để tiện xem lại và mua sau.
              </p>
              <Link
                to="/product"
                className="mt-6 inline-flex rounded-xl bg-[#c8a96e] px-5 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
              >
                Đi tới trang sản phẩm
              </Link>
            </div>
          ) : null}

          {isLoggedIn &&
          !loading &&
          !error &&
          favoriteSummary.items.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {favoriteSummary.items.map((product, index) => {
                const stockBadge = getStockBadge(product);
                const isRemoving = Boolean(
                  toggleLoadingByProductId?.[String(product.id)],
                );
                const isOutOfStock =
                  product.stockStatus === "OUT_OF_STOCK" ||
                  Number(product.stock || 0) <= 0;

                return (
                  <article
                    key={String(product.id)}
                    className="product-card-reveal mx-auto w-full max-w-[340px] overflow-hidden rounded-[22px] border border-white/8 bg-[#130d09] transition hover:-translate-y-1 hover:border-[#c8a96e]/35"
                    style={{ animationDelay: `${0.14 + index * 0.06}s` }}
                  >
                    <div className="bg-gradient-to-br from-[#f0ddb5] via-[#d4b07a] to-[#8a6030] p-[1px]">
                      <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-t-[21px] bg-[#18100b]">
                        <span
                          className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold ${stockBadge.className}`}
                        >
                          {stockBadge.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFavorite(product.id)}
                          disabled={isRemoving}
                          aria-label="Bỏ khỏi yêu thích"
                          className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d66d7d] bg-[#7a1828]/80 text-[#ffd7de] backdrop-blur-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Heart className="h-4.5 w-4.5 fill-current" />
                        </button>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />

                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-32 w-32 items-center justify-center rounded-[24px] border border-white/15 bg-white/10 px-4 text-center text-base font-bold tracking-[0.18em] text-[#f4e3c3] uppercase shadow-[0_18px_36px_rgba(0,0,0,0.35)]">
                            {getProductFallbackLabel(product.name)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5">
                      <p className="text-[10px] font-semibold tracking-[0.16em] text-[#c8a96e] uppercase">
                        Đã thêm lúc {formatFavoriteDate(product.favoritedAt)}
                      </p>
                      <h3 className="mt-2 text-[15px] leading-6 font-bold text-[#f4e3c3]">
                        {product.name}
                      </h3>

                      <div className="mt-3 border-t border-white/8 pt-3">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs text-white/45">Giá bán</p>
                            <p className="mt-1 text-lg font-bold text-[#d8b77a]">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                          <Link
                            to={`/product/${product.id}`}
                            className="inline-flex items-center justify-center rounded-xl bg-[#c8a96e] px-3.5 py-2 text-xs font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
                          >
                            Xem chi tiết
                          </Link>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddFavoriteToCart(product)}
                          disabled={isOutOfStock}
                          className="mt-2 inline-flex w-full cursor-pointer items-center justify-center px-1 py-1.5 text-xs font-bold text-[#f4e3c3] transition hover:text-[#d9bb82] disabled:cursor-not-allowed disabled:text-white/35"
                        >
                          {isOutOfStock ? "Tạm hết hàng" : "Thêm vào giỏ hàng"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default FavoritePage;
