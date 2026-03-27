import { Check, ChevronRight } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import { useCartItems } from "@/features/cart/hook";

function formatDisplayPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDisplayDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Đang cập nhật";
  }

  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const ORDER_SUCCESS_STORAGE_KEY = "payment_order_snapshot";

function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const cartItems = useCartItems();

  const order = useMemo(() => {
    if (location.state?.orderSnapshot) {
      return location.state.orderSnapshot;
    }

    try {
      const rawValue = sessionStorage.getItem(ORDER_SUCCESS_STORAGE_KEY);
      return rawValue ? JSON.parse(rawValue) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  useEffect(() => {
    if (order) {
      return;
    }

    toast.info("Không tìm thấy thông tin xác nhận đơn hàng.", {
      position: "top-right",
    });
    navigate(cartItems.length > 0 ? "/payment" : "/cart", { replace: true });
  }, [cartItems.length, navigate, order]);

  if (!order) {
    return null;
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(8, 6, 4, 0.62), rgba(8, 6, 4, 0.82)), url('/bg-product.png?v=2')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Header>
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#120d08]/90 backdrop-blur-md">
          <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-6 lg:px-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/logo-web.png" alt="WEBCATTOC" className="h-14 w-auto object-contain" />
              <span className="text-base font-bold tracking-wide text-[#e8cf9d]">MDT BaberShop</span>
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
        <div className="mb-12 flex items-center gap-3 text-sm text-white/80">
          <Link to="/" className="transition hover:text-[#e8cf9d]">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4 text-white/35" />
          <span>Thanh toán</span>
        </div>

        <section className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/12 bg-white/5 shadow-[0_0_0_10px_rgba(255,255,255,0.02),0_0_0_20px_rgba(255,255,255,0.02)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[#f6e1bf]">
                <Check className="h-6 w-6" />
              </div>
            </div>

            <h1 className="mt-8 text-4xl font-bold text-[#f8e7c6] md:text-5xl">
              Đặt hàng thành công
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
              Đơn hàng đã thiết lập thành công. Chúng tôi sẽ liên hệ trực tiếp với
              quý khách để xác nhận.
            </p>
          </div>

          <div className="mt-10 grid overflow-hidden rounded-[18px] border border-white/10 bg-[#0d1218]/92 md:grid-cols-4">
            <div className="border-b border-white/10 px-5 py-4 text-center md:border-r md:border-b-0">
              <p className="text-sm font-semibold text-white/70">Mã đơn hàng</p>
              <p className="mt-2 break-all text-base leading-6 font-bold text-[#f6e1bf] md:text-lg">
                {order.orderCode}
              </p>
            </div>
            <div className="border-b border-white/10 px-5 py-4 text-center md:border-r md:border-b-0">
              <p className="text-sm font-semibold text-white/70">Ngày mua</p>
              <p className="mt-2 text-lg font-bold text-[#f6e1bf]">
                {formatDisplayDate(order.createdAt)}
              </p>
            </div>
            <div className="border-b border-white/10 px-5 py-4 text-center md:border-r md:border-b-0">
              <p className="text-sm font-semibold text-white/70">Tổng cộng</p>
              <p className="mt-2 text-lg font-bold text-[#f6e1bf]">
                {formatDisplayPrice(order.total)} đ
              </p>
            </div>
            <div className="px-5 py-4 text-center">
              <p className="text-sm font-semibold text-white/70">Thanh toán</p>
              <p className="mt-2 text-lg font-bold text-[#f6e1bf]">{order.paymentMethodLabel}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
            <section className="rounded-[18px] border border-white/10 bg-[#0d1218]/92 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <div className="grid grid-cols-[minmax(0,1.5fr)_140px_160px] gap-4 border-b border-white/10 pb-4 text-sm font-semibold text-white">
                <span>Tên sản phẩm</span>
                <span className="text-center">Số lượng</span>
                <span className="text-right">Thành tiền</span>
              </div>

              <div className="divide-y divide-white/10">
                {order.items.map((item) => {
                  const lineTotal = Number(item.lineTotal || 0);

                  return (
                    <div
                      key={item.productId}
                      className="grid grid-cols-[minmax(0,1.5fr)_140px_160px] gap-4 py-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-white p-2">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-base font-semibold leading-7 text-white">{item.name}</p>
                          <p className="mt-2 text-xs text-white/35">SKU: {item.productId}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center text-lg font-semibold text-white">
                        {item.quantity}
                      </div>

                      <div className="flex items-center justify-end text-right text-2xl font-bold text-[#f6e1bf]">
                        {formatDisplayPrice(lineTotal)} đ
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 border-t border-white/10 pt-5 text-sm text-white/75">
                <div className="flex items-center justify-between py-2">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-[#f6e1bf]">
                    {formatDisplayPrice(order.subtotal)} đ
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Giao hàng</span>
                  <span className="font-semibold text-[#f6e1bf]">Miễn phí</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Phương thức thanh toán</span>
                  <span className="font-semibold text-[#f6e1bf]">{order.paymentMethodLabel}</span>
                </div>
              </div>

              <div className="mt-5 rounded-[14px] border border-white/8 bg-black/10 p-4 text-sm text-white/70">
                <p className="font-semibold text-white">Thông tin nhận hàng</p>
                <p className="mt-3 leading-7">
                  {order.customer?.fullName} · {order.customer?.phone}
                </p>
                <p className="leading-7">{order.customer?.email}</p>
                <p className="leading-7">
                  {[
                    order.shippingAddress?.address,
                    order.shippingAddress?.ward,
                    order.shippingAddress?.district,
                    order.shippingAddress?.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.note ? (
                  <p className="mt-2 leading-7 text-white/55">Ghi chú: {order.note}</p>
                ) : null}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-lg font-semibold text-white">Tổng</span>
                <span className="text-3xl font-bold text-[#f6e1bf]">
                  {formatDisplayPrice(order.total)} đ
                </span>
              </div>
            </section>

            {order.bankInfo ? (
              <aside className="rounded-[18px] border border-white/10 bg-[#0d1218]/92 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <h2 className="text-xl font-semibold text-white">Thông tin ngân hàng</h2>
                <div className="mt-4 h-px bg-white/10" />

                <div className="mt-5 space-y-5 text-white">
                  <div>
                    <p className="text-sm text-white/55">Chủ tài khoản</p>
                    <p className="mt-1 text-base font-semibold uppercase">
                      {order.bankInfo.accountName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-white/55">Số tài khoản</p>
                    <p className="mt-1 text-base font-semibold">{order.bankInfo.accountNumber}</p>
                  </div>

                  <div>
                    <p className="text-sm text-white/55">Ngân Hàng</p>
                    <p className="mt-1 text-base font-semibold uppercase">
                      {order.bankInfo.bankName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-white/55">Nội dung chuyển khoản</p>
                    <p className="mt-2 text-sm leading-7 font-semibold text-white">
                      Quý khách chuyển khoản với nội dung: {order.bankInfo.transferContent}
                    </p>
                  </div>

                  <div className="w-fit overflow-hidden rounded-[6px] bg-white p-3">
                    <img
                      src={order.bankInfo.qrImage}
                      alt="Mã QR chuyển khoản ngân hàng"
                      className="h-[180px] w-[180px] object-contain"
                    />
                  </div>
                </div>
              </aside>
            ) : order.paymentMethod === "MOMO" ? (
              <aside className="rounded-[18px] border border-white/10 bg-[#0d1218]/92 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <h2 className="text-xl font-semibold text-white">Thanh toán MoMo</h2>
                <div className="mt-4 h-px bg-white/10" />
                <p className="mt-5 text-sm leading-7 text-white/70">
                  Giao dịch MoMo của bạn đã được xác nhận thành công. Hệ thống đã ghi nhận
                  thanh toán và sẽ xử lý đơn hàng theo luồng bình thường.
                </p>
                {order.paymentConfirmedAt ? (
                  <p className="mt-4 text-sm leading-7 text-[#f6e1bf]">
                    Thời gian xác nhận: {new Date(order.paymentConfirmedAt).toLocaleString("vi-VN")}
                  </p>
                ) : null}
              </aside>
            ) : (
              <aside className="rounded-[18px] border border-white/10 bg-[#0d1218]/92 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <h2 className="text-xl font-semibold text-white">Thanh toán khi nhận hàng</h2>
                <div className="mt-4 h-px bg-white/10" />
                <p className="mt-5 text-sm leading-7 text-white/70">
                  Đơn hàng của bạn đã được tạo thành công. Bạn sẽ thanh toán trực tiếp
                  cho nhân viên giao hàng khi nhận sản phẩm.
                </p>
              </aside>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default PaymentSuccessPage;
