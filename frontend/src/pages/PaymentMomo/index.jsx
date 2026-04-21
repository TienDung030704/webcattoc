import { LoaderCircle, QrCode, RefreshCcw, XCircle } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import { useCartActions } from "@/features/cart/hook";
import {
  cancelMomoOrderPayment,
  getMomoOrderStatus,
  recreateMomoOrderPayment,
} from "@/service/order/orderService";

const ORDER_SUCCESS_STORAGE_KEY = "payment_order_snapshot";
const PAYMENT_MOMO_STORAGE_KEY = "payment_momo_snapshot";

function formatDisplayPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatRemainingTime(expiresAt, now = Date.now()) {
  if (!expiresAt) {
    return "--:--";
  }

  const remainingMs = new Date(expiresAt).getTime() - now;
  if (remainingMs <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function PaymentMomoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCartActions();
  const [order, setOrder] = useState(() => {
    if (location.state?.orderSnapshot) {
      return location.state.orderSnapshot;
    }

    try {
      const rawValue = sessionStorage.getItem(PAYMENT_MOMO_STORAGE_KEY);
      return rawValue ? JSON.parse(rawValue) : null;
    } catch {
      return null;
    }
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [qrFallbackUrl, setQrFallbackUrl] = useState("");

  const orderId = order?.id || "";
  const paymentSession = order?.paymentSession || null;
  const remainingTime = useMemo(
    () => formatRemainingTime(order?.paymentExpiresAt || paymentSession?.expiresAt, now),
    [now, order?.paymentExpiresAt, paymentSession?.expiresAt],
  );
  const isPaid = order?.paymentStatus === "PAID";
  const isExpired = order?.paymentStatus === "EXPIRED";
  const isFailed = order?.paymentStatus === "FAILED";

  useEffect(() => {
    if (!orderId) {
      toast.error("Không tìm thấy phiên thanh toán MoMo.", {
        position: "top-right",
      });
      navigate("/payment", { replace: true });
      return;
    }

    sessionStorage.setItem(PAYMENT_MOMO_STORAGE_KEY, JSON.stringify(order));
  }, [navigate, order, orderId]);

  useEffect(() => {
    const countdownId = window.setInterval(() => {
      // Tick mỗi giây để countdown tự cập nhật mà không cần chờ polling API.
      setNow(Date.now());
    }, 1000);

    if (!orderId || isPaid || isExpired || isFailed) {
      return () => {
        window.clearInterval(countdownId);
      };
    }

    const intervalId = window.setInterval(async () => {
      try {
        const nextOrder = await getMomoOrderStatus(orderId);
        setOrder(nextOrder);
      } catch {
        // Polling lỗi tạm thời thì bỏ qua để không spam toast liên tục.
      }
    }, 3000);

    return () => {
      window.clearInterval(countdownId);
      window.clearInterval(intervalId);
    };
  }, [isExpired, isFailed, isPaid, orderId]);

  useEffect(() => {
    if (!isPaid || !order) {
      return;
    }

    // Chỉ xóa cart khi backend đã xác nhận thanh toán thành công thực sự.
    sessionStorage.setItem(ORDER_SUCCESS_STORAGE_KEY, JSON.stringify(order));
    sessionStorage.removeItem(PAYMENT_MOMO_STORAGE_KEY);
    clearCart();

    toast.success("Thanh toán MoMo thành công.", {
      position: "top-right",
    });

    navigate("/payment/success", {
      replace: true,
      state: {
        orderSnapshot: order,
      },
    });
  }, [clearCart, isPaid, navigate, order]);

  useEffect(() => {
    const payUrl = String(paymentSession?.payUrl || "").trim();

    if (!payUrl) {
      setQrFallbackUrl("");
      return;
    }

    let isMounted = true;

    const generateQrFromPayUrl = async () => {
      try {
        // Fallback tạo ảnh QR từ payUrl khi MoMo không trả qrCodeUrl trực tiếp.
        const nextQrUrl = await QRCode.toDataURL(payUrl, {
          width: 240,
          margin: 1,
        });

        if (isMounted) {
          setQrFallbackUrl(nextQrUrl);
        }
      } catch {
        if (isMounted) {
          setQrFallbackUrl("");
        }
      }
    };

    generateQrFromPayUrl();

    return () => {
      isMounted = false;
    };
  }, [paymentSession?.payUrl]);

  const handleRefreshStatus = async () => {
    if (!orderId) return;

    try {
      setIsRefreshing(true);
      const nextOrder = await getMomoOrderStatus(orderId);
      setOrder(nextOrder);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Không thể cập nhật trạng thái MoMo.",
        {
          position: "top-right",
        },
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!orderId) return;

    try {
      setIsRetrying(true);
      const nextOrder = await recreateMomoOrderPayment(orderId);
      setOrder(nextOrder);
      sessionStorage.setItem(PAYMENT_MOMO_STORAGE_KEY, JSON.stringify(nextOrder));
      toast.success("Đã tạo lại mã QR MoMo mới.", {
        position: "top-right",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Không thể tạo lại phiên thanh toán MoMo.",
        {
          position: "top-right",
        },
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!orderId) return;

    try {
      setIsCanceling(true);
      const nextOrder = await cancelMomoOrderPayment(orderId);
      setOrder(nextOrder);
      sessionStorage.removeItem(PAYMENT_MOMO_STORAGE_KEY);
      toast.success("Đã hủy đơn thanh toán MoMo.", {
        position: "top-right",
      });
      navigate("/payment", { replace: true });
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Không thể hủy đơn thanh toán MoMo.",
        {
          position: "top-right",
        },
      );
    } finally {
      setIsCanceling(false);
    }
  };

  if (!order) {
    return null;
  }

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
              <img src="/logo-web.png" alt="WEBCATTOC" className="h-14 w-auto object-contain" />
              <span className="text-base font-bold tracking-wide text-[#e8cf9d]">
                MDT BaberShop
              </span>
            </Link>
            <div className="mx-auto hidden text-sm text-white/60 md:block">
              Quét mã QR MoMo để hoàn tất thanh toán đơn hàng
            </div>
            <HeaderAuthArea />
          </div>
        </header>
      </Header>

      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_380px]">
          <section className="rounded-[24px] border border-white/8 bg-[#0d1218]/92 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.34)] lg:p-8">
            <div className="flex items-center gap-3 text-[#f6e1bf]">
              <QrCode className="h-6 w-6" />
              <h1 className="text-2xl font-semibold">Thanh toán MoMo</h1>
            </div>

            <p className="mt-4 text-sm leading-7 text-white/70">
              Dùng ứng dụng MoMo để quét mã QR hoặc bấm nút thanh toán nhanh bên dưới.
              Đơn hàng chỉ được xác nhận sau khi hệ thống nhận callback/IPN thành công từ MoMo.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
              <div className="rounded-[18px] border border-white/10 bg-white p-4 text-center">
                {paymentSession?.qrCodeUrl || qrFallbackUrl ? (
                  <img
                    src={paymentSession?.qrCodeUrl || qrFallbackUrl}
                    alt="Mã QR thanh toán MoMo"
                    className="mx-auto h-[240px] w-[240px] object-contain"
                  />
                ) : (
                  <div className="flex h-[240px] w-[240px] items-center justify-center rounded-[12px] bg-[#f3f4f6] text-center text-[#111827]">
                    QR chưa sẵn sàng
                  </div>
                )}
              </div>

              <div className="space-y-5 rounded-[18px] border border-white/10 bg-black/15 p-5">
                <div>
                  <p className="text-sm text-white/50">Mã đơn hàng</p>
                  <p className="mt-2 text-lg font-semibold text-[#f6e1bf]">{order.orderCode}</p>
                </div>

                <div>
                  <p className="text-sm text-white/50">Tổng thanh toán</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {formatDisplayPrice(order.total)} đ
                  </p>
                </div>

                <div>
                  <p className="text-sm text-white/50">Trạng thái</p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {order.paymentStatus === "PENDING"
                      ? "Đang chờ thanh toán"
                      : order.paymentStatus === "PAID"
                        ? "Đã thanh toán"
                        : order.paymentStatus === "EXPIRED"
                          ? "Đã hết hạn"
                          : "Thanh toán thất bại"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-white/50">Thời gian còn lại</p>
                  <p className="mt-2 text-3xl font-bold text-[#f6e1bf]">{remainingTime}</p>
                </div>

                {paymentSession?.payUrl ? (
                  <a
                    href={paymentSession.payUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#ae2070] px-6 text-base font-semibold text-white transition hover:bg-[#981b62]"
                  >
                    Mở trang thanh toán MoMo
                  </a>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleRefreshStatus}
                    disabled={isRefreshing}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRefreshing ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-4 w-4" />
                    )}
                    Cập nhật trạng thái
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelPayment}
                    disabled={isCanceling || isPaid}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-red-400/25 px-5 text-sm font-medium text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCanceling ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Hủy thanh toán
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6 rounded-[24px] border border-white/8 bg-[#0d1218]/92 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.34)]">
            <div>
              <h2 className="text-xl font-semibold text-white">Thông tin đơn hàng</h2>
              <div className="mt-4 h-px bg-white/10" />
              <div className="mt-5 space-y-4 text-sm text-white/70">
                <p>
                  <span className="text-white/45">Khách hàng:</span> {order.customer?.fullName}
                </p>
                <p>
                  <span className="text-white/45">Số điện thoại:</span> {order.customer?.phone}
                </p>
                <p>
                  <span className="text-white/45">Email:</span> {order.customer?.email}
                </p>
                <p>
                  <span className="text-white/45">Địa chỉ:</span>{" "}
                  {[
                    order.shippingAddress?.address,
                    order.shippingAddress?.ward,
                    order.shippingAddress?.district,
                    order.shippingAddress?.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>

            {(isExpired || isFailed) && (
              <div className="rounded-[18px] border border-amber-300/20 bg-amber-500/10 p-5">
                <h3 className="text-lg font-semibold text-amber-100">
                  {isExpired ? "Phiên thanh toán đã hết hạn" : "Thanh toán chưa thành công"}
                </h3>
                <p className="mt-3 text-sm leading-7 text-amber-50/80">
                  Bạn có thể tạo lại một phiên QR MoMo mới để tiếp tục thanh toán đơn hàng này.
                </p>
                <button
                  type="button"
                  onClick={handleRetryPayment}
                  disabled={isRetrying}
                  className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#ae2070] px-5 text-sm font-semibold text-white transition hover:bg-[#981b62] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRetrying ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  Tạo lại mã QR MoMo
                </button>
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PaymentMomoPage;
