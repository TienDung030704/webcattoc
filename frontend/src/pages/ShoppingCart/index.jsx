import {
  ChevronRight,
  CircleX,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import {
  useCartActions,
  useCartItems,
  useCartSummary,
} from "@/features/cart/hook";

function getCartItemFallbackLabel(name) {
  return String(name || "SP")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item.slice(0, 3).toUpperCase())
    .join(" ");
}

function formatDisplayPrice(value) {
  // Hiển thị đúng kiểu giá trong mockup: số + "đ", không dùng ký hiệu ₫ mặc định của Intl.
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function ShoppingCartPage() {
  const navigate = useNavigate();
  const items = useCartItems();
  const { totalItems, subtotal } = useCartSummary();
  const { incrementCartItem, decrementCartItem, removeFromCart } =
    useCartActions();
  const isEmptyCart = items.length === 0;

  const handleCheckout = () => {
    navigate("/payment");
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

      <main className="product-page-fade mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="mb-8 flex items-center gap-3 text-[17px] text-white/90">
          <Link to="/" className="transition hover:text-[#e8cf9d]">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4 text-white/45" />
          <span>Giỏ hàng</span>
        </div>

        {isEmptyCart ? (
          <section className="rounded-[30px] border border-white/10 bg-[#11161d]/88 px-6 py-12 text-center shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#c8a96e]/25 bg-[#c8a96e]/10 text-[#e8cf9d]">
              <ShoppingBag className="h-9 w-9" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-white">
              Giỏ hàng đang trống
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Chưa có sản phẩm nào trong giỏ hàng. Bạn quay lại trang sản phẩm
              để tiếp tục mua sắm nhé.
            </p>
            <button
              type="button"
              onClick={() => navigate("/product")}
              className="mt-8 inline-flex items-center justify-center rounded-full border border-[#7e6742] px-10 py-4 text-lg font-medium text-white transition hover:bg-white/5"
            >
              Tiếp tục mua sắm
            </button>
          </section>
        ) : (
          <>
            <section className="overflow-hidden rounded-[24px] border border-white/8 bg-[#0d1218]/92 px-5 py-4 shadow-[0_22px_60px_rgba(0,0,0,0.34)] lg:px-12 lg:py-7">
              <div className="hidden border-b border-white/12 pb-6 lg:grid lg:grid-cols-[minmax(0,1.4fr)_220px_220px_220px_44px] lg:items-center lg:gap-6">
                <span className="text-[18px] font-semibold text-white">
                  Tên sản phẩm
                </span>
                <span className="text-center text-[18px] font-semibold text-white">
                  Đơn giá
                </span>
                <span className="text-center text-[18px] font-semibold text-white">
                  Số lượng
                </span>
                <span className="text-center text-[18px] font-semibold text-white">
                  Thành tiền
                </span>
                <span />
              </div>

              <div className="divide-y divide-white/12">
                {items.map((item) => {
                  const price = Number(item?.price || 0);
                  const quantity = Number(item?.quantity || 0);
                  const stock = Number(item?.stock || 0);
                  const lineTotal = price * quantity;
                  const isOutOfStock =
                    item?.stockStatus === "OUT_OF_STOCK" || stock <= 0;

                  return (
                    <article
                      key={item.productId}
                      className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1.4fr)_220px_220px_220px_44px] lg:items-center lg:gap-6"
                    >
                      <div className="flex items-start gap-5">
                        <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-white">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="px-3 text-center text-sm font-bold tracking-[0.18em] text-[#11161d] uppercase">
                              {getCartItemFallbackLabel(item.name)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 pt-2">
                          <h2 className="text-[20px] leading-8 font-medium text-white">
                            {item.name}
                          </h2>
                          <p className="mt-2 text-[14px] text-[#c3a57e]">
                            SKU:{" "}
                            <span className="text-white/70">
                              {item.productId}
                            </span>
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            {!isOutOfStock ? (
                              <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-white">
                                <Tag className="h-4 w-4 text-white/80" />
                                Còn hàng
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#f39b9b]">
                                <Tag className="h-4 w-4" />
                                Hết hàng
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="lg:text-center">
                        <p className="text-sm text-white/45 lg:hidden">
                          Đơn giá
                        </p>
                        <div className="mt-1 lg:mt-0">
                          <p className="text-[18px] text-white/35 line-through">
                            {formatDisplayPrice(price)} đ
                          </p>
                          <p className="mt-1 text-[24px] font-semibold text-white">
                            {formatDisplayPrice(price)} đ
                          </p>
                        </div>
                      </div>

                      <div className="lg:flex lg:justify-center">
                        <div>
                          <p className="text-sm text-white/45 lg:hidden">
                            Số lượng
                          </p>
                          <div className="mt-2 inline-flex h-[54px] items-center rounded-full border border-white/12 bg-transparent px-2 lg:mt-0">
                            <button
                              type="button"
                              onClick={() => decrementCartItem(item.productId)}
                              className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/8 hover:text-white"
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                            <span className="flex min-w-[48px] items-center justify-center text-[20px] font-medium text-white">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => incrementCartItem(item.productId)}
                              disabled={
                                isOutOfStock || (stock > 0 && quantity >= stock)
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="lg:text-center">
                        <p className="text-sm text-white/45 lg:hidden">
                          Thành tiền
                        </p>
                        <p className="mt-1 text-[24px] font-semibold text-[#f6e1bf] lg:mt-0">
                          {formatDisplayPrice(lineTotal)} đ
                        </p>
                      </div>

                      <div className="flex lg:justify-center">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition hover:bg-white/8 hover:text-white"
                          aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                        >
                          <CircleX className="h-7 w-7" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-2 border-t border-white/12 pt-6">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_220px_220px_220px_44px] lg:items-center lg:gap-6">
                  <div className="lg:col-start-3 lg:text-center">
                    <span className="text-[18px] font-semibold text-white">
                      Số lượng:{" "}
                      <span className="ml-2 text-[20px]">{totalItems}</span>
                    </span>
                  </div>

                  <div className="lg:col-span-2 lg:col-start-4 lg:text-right">
                    <span className="text-[18px] font-semibold text-white">
                      Tổng tiền:
                      <span className="ml-4 text-[32px] font-semibold text-[#f6e1bf]">
                        {formatDisplayPrice(subtotal)} đ
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <button
                type="button"
                onClick={() => navigate("/product")}
                className="inline-flex min-h-[58px] items-center justify-center rounded-full border border-[#5a4d38] px-10 text-[18px] font-medium text-white transition hover:bg-white/5"
              >
                Tiếp tục mua sắm
              </button>

              <button
                type="button"
                onClick={handleCheckout}
                className="inline-flex min-h-[58px] items-center justify-center rounded-full bg-black px-10 text-[18px] font-medium text-white transition hover:bg-black/85"
              >
                Tiến hành thanh toán
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ShoppingCartPage;
