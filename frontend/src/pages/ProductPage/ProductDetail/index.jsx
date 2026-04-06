import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import { useCartActions } from "@/features/cart/hook";
import {
  useFavoriteActions,
  useFavoriteStatus,
} from "@/features/favorite/hook";
import {
  useProductActions,
  useProductDetailState,
} from "@/features/product/hook";
import { formatCurrency } from "@/utils/dashboard";

function getStockBadge(product) {
  if (product?.stockStatus === "OUT_OF_STOCK") {
    return {
      label: "Hết hàng",
      className: "bg-red-200 text-red-900",
      description: "Sản phẩm này hiện đang tạm hết hàng.",
    };
  }

  if (product?.stockStatus === "LOW_STOCK") {
    return {
      label: "Sắp hết",
      className: "bg-amber-200 text-amber-900",
      description: `Chỉ còn ${product?.stock || 0} sản phẩm trong kho.`,
    };
  }

  return {
    label: "Còn hàng",
    className: "bg-[#f3dfb8] text-[#2b1b10]",
    description: `Hiện còn ${product?.stock || 0} sản phẩm sẵn sàng phục vụ.`,
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

function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { item: product, loading: isLoading, error } = useProductDetailState();
  const { getProductDetail, resetProductDetail } = useProductActions();
  const { addToCart } = useCartActions();
  const { getFavoriteStatus, addFavorite, removeFavorite, getFavorites } =
    useFavoriteActions();
  const { isFavorite, isLoading: isFavoriteLoading } =
    useFavoriteStatus(productId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  useEffect(() => {
    getProductDetail(productId);

    return () => {
      resetProductDetail();
    };
  }, [getProductDetail, productId, resetProductDetail]);

  useEffect(() => {
    if (!productId || !isLoggedIn) {
      return;
    }

    // Nếu đã đăng nhập thì lấy trạng thái favorite thật từ backend để heart không phụ thuộc localStorage cũ.
    getFavoriteStatus(productId);
  }, [getFavoriteStatus, isLoggedIn, productId]);

  const imageGallery = useMemo(() => {
    if (!product) {
      return [];
    }

    // Gom cover image và gallery ảnh về một danh sách ổn định để thumbnail và arrow luôn dùng chung một nguồn.
    return [
      product.imageUrl,
      ...(Array.isArray(product.imageUrls) ? product.imageUrls : []),
    ]
      .map((imageUrl) => String(imageUrl || "").trim())
      .filter(Boolean)
      .filter((imageUrl, index, array) => array.indexOf(imageUrl) === index);
  }, [product]);

  const normalizedActiveImageIndex = imageGallery.length
    ? Math.min(activeImageIndex, imageGallery.length - 1)
    : 0;
  const currentImage = imageGallery[normalizedActiveImageIndex] || "";
  const stockBadge = getStockBadge(product);
  const canNavigateImages = imageGallery.length > 1;
  const isFirstImage = normalizedActiveImageIndex <= 0;
  const isLastImage = normalizedActiveImageIndex >= imageGallery.length - 1;

  const handleShowPreviousImage = () => {
    setActiveImageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleShowNextImage = () => {
    setActiveImageIndex((prev) => Math.min(imageGallery.length - 1, prev + 1));
  };

  const handleChangeQuantity = (nextQuantity) => {
    setQuantity(nextQuantity);
  };

  const handleToggleFavorite = async () => {
    if (!product?.id) {
      return;
    }

    if (!isLoggedIn) {
      toast.error("Mày cần đăng nhập để dùng tính năng yêu thích", {
        position: "top-right",
      });
      navigate("/auth/login");
      return;
    }

    const action = isFavorite ? removeFavorite : addFavorite;
    const result = await action(product.id);

    if (result?.meta?.requestStatus !== "fulfilled") {
      toast.error(
        result?.payload || "Không thể cập nhật trạng thái yêu thích",
        {
          position: "top-right",
        },
      );
      return;
    }

    await getFavorites();

    if (isFavorite) {
      toast.success("Đã bỏ sản phẩm khỏi yêu thích", {
        position: "top-right",
      });
      return;
    }

    toast.success("Đã thêm sản phẩm vào yêu thích", {
      position: "top-right",
    });
  };

  const handleAddProductToCart = ({ redirectToCart = false } = {}) => {
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

    // Lưu snapshot sản phẩm hiện tại để trang cart render ổn định ngay cả khi chưa có cart API backend.
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      stockStatus: product.stockStatus,
      quantity,
    });

    toast.success("Đã thêm sản phẩm vào giỏ hàng", {
      position: "top-right",
    });

    if (redirectToCart) {
      navigate("/cart");
    }
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
          <Link to="/product" className="transition hover:text-white/75">
            Sản phẩm
          </Link>
          <span>/</span>
          <span className="text-[#d8b77a]">
            {product?.name || "Chi tiết sản phẩm"}
          </span>
        </div>

        {isLoading ? (
          <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#130d09] p-4">
              <div className="h-[420px] animate-pulse rounded-[24px] bg-white/8" />
              <div className="mt-4 grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`detail-thumb-skeleton-${index}`}
                    className="h-24 animate-pulse rounded-[18px] bg-white/8"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[28px] border border-white/10 bg-[#130d09] p-6">
                <div className="h-6 w-28 animate-pulse rounded bg-white/8" />
                <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-white/8" />
                <div className="mt-5 h-8 w-40 animate-pulse rounded bg-white/8" />
                <div className="mt-6 h-5 w-full animate-pulse rounded bg-white/8" />
                <div className="mt-3 h-5 w-11/12 animate-pulse rounded bg-white/8" />
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="h-12 animate-pulse rounded-xl bg-white/8" />
                  <div className="h-12 animate-pulse rounded-xl bg-white/8" />
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {!isLoading && error ? (
          <section className="rounded-[28px] border border-red-400/20 bg-red-500/10 px-6 py-8 text-center">
            <p className="text-xl font-semibold text-red-100">
              Không tải được sản phẩm
            </p>
            <p className="mt-3 text-sm text-red-100/80">{error}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/product"
                className="rounded-xl bg-[#c8a96e] px-5 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
              >
                Quay lại danh sách sản phẩm
              </Link>
              <Link
                to="/contact"
                className="rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </section>
        ) : null}

        {!isLoading && !error && product ? (
          <div className="space-y-5">
            <section className="product-card-reveal overflow-hidden rounded-[28px] border border-white/10 bg-[#130d09] p-4 lg:p-5">
              <div className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
                <div>
                  <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-[24px] border border-white/8 bg-[#18100b]">
                    <span
                      className={`absolute top-4 left-4 z-10 rounded-full px-3 py-1 text-xs font-bold ${stockBadge.className}`}
                    >
                      {stockBadge.label}
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleFavorite}
                      disabled={isFavoriteLoading}
                      aria-label={
                        isFavorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"
                      }
                      aria-pressed={isFavorite}
                      className={`absolute top-4 right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-sm transition ${
                        isFavorite
                          ? "border-[#d66d7d] bg-[#7a1828]/80 text-[#ffd7de]"
                          : "border-white/12 bg-[#120d08]/78 text-white/80 hover:border-white/25 hover:text-white"
                      } ${isFavoriteLoading ? "cursor-not-allowed opacity-70" : ""}`}
                    >
                      <Heart
                        className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
                      />
                    </button>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />

                    {currentImage ? (
                      <img
                        src={currentImage}
                        alt={product.name}
                        className="h-full w-full object-contain p-4 md:p-5"
                      />
                    ) : (
                      <div className="flex h-40 w-40 items-center justify-center rounded-[32px] border border-white/15 bg-white/10 px-4 text-center text-2xl font-bold tracking-[0.22em] text-[#f4e3c3] uppercase shadow-[0_18px_36px_rgba(0,0,0,0.35)]">
                        {getProductFallbackLabel(product.name)}
                      </div>
                    )}
                    {canNavigateImages ? (
                      <>
                        <button
                          type="button"
                          onClick={handleShowPreviousImage}
                          disabled={isFirstImage}
                          aria-label="Xem ảnh trước"
                          className="absolute left-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#120d08]/78 text-white/85 backdrop-blur-sm transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleShowNextImage}
                          disabled={isLastImage}
                          aria-label="Xem ảnh tiếp theo"
                          className="absolute top-1/2 right-4 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-[#120d08]/78 text-white/85 backdrop-blur-sm transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    ) : null}
                  </div>

                  {imageGallery.length > 1 ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {imageGallery.map((imageUrl, index) => {
                        const isActive = index === activeImageIndex;

                        return (
                          <button
                            key={`${imageUrl}-${index}`}
                            type="button"
                            onClick={() => setActiveImageIndex(index)}
                            className={`overflow-hidden rounded-[18px] border p-1 transition ${
                              isActive
                                ? "border-[#c8a96e] bg-[#c8a96e]/10"
                                : "border-white/10 bg-[#18100b] hover:border-white/30"
                            }`}
                          >
                            <img
                              src={imageUrl}
                              alt={`${product.name} ${index + 1}`}
                              className="h-24 w-full rounded-[14px] object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4 rounded-[24px] border border-[#3b2a1b] bg-[linear-gradient(180deg,rgba(18,13,9,0.96)_0%,rgba(12,8,6,0.98)_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.32)] lg:p-6">
                  <div className="max-w-lg">
                    <p className="text-[11px] font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                      Chi tiết sản phẩm
                    </p>
                    <h1 className="mt-3 font-serif text-[30px] leading-tight text-[#f4e3c3] lg:text-[38px] lg:leading-[1.2]">
                      {product.name}
                    </h1>

                    {/* Gom các badge thông tin quan trọng lên đầu để toàn bộ nội dung nằm chung trong khung chính. */}
                    <div className="mt-5 flex flex-wrap items-center gap-2.5 text-sm">
                      <span className="inline-flex items-center gap-2 font-semibold text-[#39d98a]">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#18d26b] shadow-[0_0_14px_rgba(24,210,107,0.8)]" />
                        {stockBadge.label.toUpperCase()}
                      </span>
                      <span className="rounded-md border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-medium tracking-[0.14em] text-white/75 uppercase">
                        Mã #{product.id}
                      </span>
                      <span className="rounded-md border border-[#c8a96e]/25 bg-[#c8a96e]/8 px-3 py-1.5 text-xs font-medium tracking-[0.14em] text-[#f4e3c3] uppercase">
                        Storefront
                      </span>
                    </div>

                    <div className="mt-6 -ml-4 bg-[linear-gradient(180deg,rgba(39,15,15,0.42)_0%,rgba(22,11,10,0.28)_100%)] px-4 py-4">
                      <div className="flex flex-wrap items-baseline gap-3 lg:gap-4">
                        <p className="text-sm font-semibold tracking-[0.18em] text-white/45 uppercase">
                          Giá bán:
                        </p>
                        <p className="text-[22px] leading-none font-black tracking-tight text-[#ff6d6d] lg:text-[28px]">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold tracking-[0.18em] text-white/45 uppercase">
                        Số lượng
                      </p>
                      <div className="inline-flex items-center overflow-hidden rounded-xl border border-white/12 bg-[#120d08]">
                        <button
                          type="button"
                          onClick={() =>
                            handleChangeQuantity(Math.max(1, quantity - 1))
                          }
                          className="flex h-10 w-10 items-center justify-center text-lg font-bold text-white/75 transition hover:bg-white/8 hover:text-white"
                        >
                          -
                        </button>
                        <span className="flex h-10 min-w-12 items-center justify-center border-x border-white/10 px-3 text-sm font-semibold text-[#f4e3c3]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleChangeQuantity(quantity + 1)}
                          className="flex h-10 w-10 items-center justify-center text-lg font-bold text-white/75 transition hover:bg-white/8 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="flex flex-wrap items-center gap-4 rounded-[20px] border border-white/10 bg-[#17100b] px-4 py-3.5 sm:col-span-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-lg text-[#1b130d]">
                          ✆
                        </div>
                        <div className="min-w-0 flex-1 border-l border-white/10 pl-4">
                          <p className="text-xs font-semibold tracking-[0.18em] text-white/45 uppercase">
                            Hotline đặt hàng
                          </p>
                          <p className="mt-1 text-2xl font-black tracking-[0.03em] text-[#f4e3c3]">
                            0869 271 243
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddProductToCart()}
                        className="inline-flex min-h-13 items-center justify-center rounded-2xl border border-[#7f2727]/45 bg-transparent px-5 py-3 text-[15px] font-bold text-[#b95b5b] transition hover:border-[#9e3434] hover:bg-[#7f2727]/10 hover:text-[#d26f6f]"
                      >
                        Thêm vào giỏ hàng
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleAddProductToCart({ redirectToCart: true })
                        }
                        className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7b1717_0%,#8e2323_48%,#a43434_100%)] px-5 py-3 text-[15px] font-bold text-white transition hover:brightness-110"
                      >
                        Mua ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="product-card-reveal rounded-[28px] border border-white/10 bg-[#130d09] p-6">
              <div>
                <p className="text-sm font-semibold tracking-[0.22em] text-[#c8a96e] uppercase">
                  Mô tả chi tiết
                </p>
                <h2 className="mt-3 text-2xl font-bold text-[#f4e3c3]">
                  Vì sao sản phẩm này phù hợp với bạn?
                </h2>
                <div className="mt-4 text-sm leading-7 break-words whitespace-pre-line text-white/70">
                  {product.description?.trim() ||
                    "Sản phẩm được tuyển chọn cho nhu cầu chăm sóc và tạo kiểu tóc hàng ngày. Nếu mày cần tư vấn kỹ hơn về chất tóc, cách dùng hoặc sản phẩm đi kèm, đội ngũ của shop có thể hỗ trợ trực tiếp."}
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetailPage;
