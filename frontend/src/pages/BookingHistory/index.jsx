import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarRange, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import {
  formatCurrency,
  mapAppointmentStatus,
  mapPaymentMethod,
  mapPaymentStatus,
} from "@/utils/dashboard";
import http from "@/utils/http";

function formatDateTime(value) {
  if (!value) return "--";

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getBranchSummary(branch) {
  if (!branch) {
    return "Chưa có thông tin chi nhánh";
  }

  return [branch.address, branch.district, branch.city].filter(Boolean).join(", ");
}

function BookingHistoryPage() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));
  const [historyItems, setHistoryItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchBookingHistory = useCallback(async (page = 1) => {
    if (!isLoggedIn) {
      setHistoryItems([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      });
      setErrorMessage("");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      // Gọi API history của chính user hiện tại để page luôn lấy dữ liệu mới nhất từ backend.
      const response = await http.get(`user/appointments?page=${page}&limit=10`);
      setHistoryItems(response?.data?.items || []);
      setPagination(
        response?.data?.pagination || {
          page,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      setHistoryItems([]);
      setPagination({
        page,
        limit: 10,
        total: 0,
        totalPages: 1,
      });
      setErrorMessage(
        error?.response?.data?.error || "Không thể tải lịch sử đặt lịch của bạn.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchBookingHistory(1);
  }, [fetchBookingHistory]);

  const summaryText = useMemo(() => {
    const total = Number(pagination.total || 0);

    if (total <= 0) {
      return "Chưa có lịch hẹn nào được lưu trong tài khoản của mày.";
    }

    return `Đang hiển thị ${historyItems.length} / ${total} lịch hẹn đã đặt của mày.`;
  }, [historyItems.length, pagination.total]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages || nextPage === pagination.page) {
      return;
    }

    fetchBookingHistory(nextPage);
  };

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

      <main>
        <section className="relative h-[260px] overflow-hidden md:h-[320px] lg:h-[360px]">
          <img
            src="/bg-cuthair-2.png"
            alt="Lịch sử đặt lịch"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(4,4,4,0.35),rgba(4,4,4,0.6),rgba(4,4,4,0.92))]" />
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <div className="max-w-4xl">
              <h1 className="profile-hero-reveal text-4xl font-black tracking-[0.06em] text-[#f6e7c7] uppercase md:text-6xl lg:text-7xl">
                Lịch sử đặt lịch
              </h1>
              <p className="profile-hero-reveal profile-hero-delay-1 mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/80 md:text-base md:leading-8 lg:text-lg">
                Xem lại toàn bộ lịch hẹn mà mày đã đặt tại MDT BaberShop, bao gồm chi nhánh,
                thời gian thực hiện và trạng thái thanh toán.
              </p>
            </div>
          </div>
        </section>

        <section
          className="relative overflow-hidden px-4 pt-10 pb-20 md:px-8 md:pt-14 md:pb-24"
          style={{
            backgroundImage:
              "linear-gradient(rgba(4,4,4,0.96), rgba(4,4,4,0.985)), radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 32%), url('/bg-cuthair.png')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/45">
              <Link to="/" className="transition hover:text-white/75">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-[#d8b77a]">Lịch sử đặt lịch</span>
            </div>

            {!isLoggedIn ? (
              <div className="profile-panel-reveal rounded-[26px] border border-white/10 bg-[#17100b]/92 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:p-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2a1b11] text-[#e8cf9d]">
                  <CalendarRange className="h-7 w-7" />
                </div>
                <h2 className="mt-5 text-2xl font-black text-[#f6e7c7] md:text-3xl">
                  Bạn chưa đăng nhập
                </h2>
                <p className="mt-3 text-white/70">
                  Vui lòng đăng nhập để xem toàn bộ lịch sử đặt lịch của tài khoản hiện tại.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/auth/login")}
                    className="inline-flex rounded-2xl bg-[#c8a96e] px-7 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
                  >
                    Đi đến trang đăng nhập
                  </button>
                  <Link
                    to="/booking"
                    className="inline-flex rounded-2xl border border-white/12 bg-white/5 px-7 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                  >
                    Đặt lịch ngay
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <section className="profile-panel-reveal rounded-[26px] border border-white/10 bg-[#17100b]/92 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:p-8 lg:p-10">
                  <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                        Booking history
                      </p>
                      <h2 className="mt-3 text-3xl font-black text-[#f6e7c7] md:text-4xl">
                        Toàn bộ lịch hẹn đã đặt
                      </h2>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60 md:text-base">
                        Page này giúp mày xem lại các lịch hẹn đã tạo, biết rõ lịch nào đã hoàn
                        thành, lịch nào bị hủy và trạng thái thanh toán của từng lần đặt lịch.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] px-4 py-3 text-sm text-white/70">
                      <p className="text-white/45">Tổng số lịch đã đặt</p>
                      <p className="mt-1 text-2xl font-black text-[#f6e7c7]">
                        {pagination.total}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-white/8 bg-[#130d09] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm text-white/55">{summaryText}</p>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to="/booking"
                          className="rounded-xl bg-[#c8a96e] px-4 py-2.5 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
                        >
                          Đặt lịch mới
                        </Link>
                        <Link
                          to="/information-individual"
                          className="rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                        >
                          Xem thông tin tài khoản
                        </Link>
                      </div>
                    </div>
                  </div>

                  {errorMessage ? (
                    <div className="mt-5 rounded-[24px] border border-red-400/20 bg-red-500/10 px-5 py-6 text-sm text-red-100">
                      {errorMessage}
                    </div>
                  ) : null}

                  {isLoading ? (
                    <div className="mt-5 rounded-[24px] border border-white/8 bg-[#130d09] px-5 py-12 text-center text-white/60">
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        Đang tải lịch sử đặt lịch...
                      </span>
                    </div>
                  ) : null}

                  {!isLoading && !errorMessage && historyItems.length === 0 ? (
                    <div className="mt-5 rounded-[24px] border border-white/8 bg-[#130d09] px-5 py-12 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2a1b11] text-[#e8cf9d]">
                        <CalendarRange className="h-7 w-7" />
                      </div>
                      <h3 className="mt-5 text-xl font-bold text-[#f4e3c3]">
                        Chưa có lịch hẹn nào
                      </h3>
                      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/55">
                        Khi mày xác nhận đặt lịch ở trang booking, lịch hẹn sẽ được lưu lại ở đây
                        để tiện theo dõi về sau.
                      </p>
                      <Link
                        to="/booking"
                        className="mt-6 inline-flex rounded-xl bg-[#c8a96e] px-5 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
                      >
                        Đi tới trang đặt lịch
                      </Link>
                    </div>
                  ) : null}

                  {!isLoading && !errorMessage && historyItems.length > 0 ? (
                    <>
                      <div className="mt-5 hidden overflow-hidden rounded-[24px] border border-[#5a3e1d] bg-[#100b08]/95 lg:block">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[1200px] text-left text-sm">
                            <thead className="bg-[#17100b] text-white/55">
                              <tr className="border-b border-white/10">
                                <th className="px-4 py-3">Mã lịch</th>
                                <th className="px-4 py-3">Dịch vụ</th>
                                <th className="px-4 py-3">Thời gian hẹn</th>
                                <th className="px-4 py-3">Chi nhánh</th>
                                <th className="px-4 py-3">Số tiền</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3">Thanh toán</th>
                                <th className="px-4 py-3">Phương thức</th>
                                <th className="px-4 py-3">Xác nhận thanh toán</th>
                                <th className="px-4 py-3">Ngày tạo</th>
                              </tr>
                            </thead>
                            <tbody className="text-white/85">
                              {historyItems.map((item) => (
                                <tr
                                  key={String(item.id)}
                                  className="border-b border-white/5 last:border-b-0"
                                >
                                  <td className="px-4 py-4 font-semibold text-[#e8cf9d]">
                                    #{item.id}
                                  </td>
                                  <td className="px-4 py-4">{item.serviceName}</td>
                                  <td className="px-4 py-4 text-white/75">
                                    {formatDateTime(item.appointmentTime)}
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="font-semibold text-[#f6e7c7]">
                                      {item.branch?.name || "Chưa có thông tin chi nhánh"}
                                    </p>
                                    <p className="mt-1 text-xs text-white/55">
                                      {getBranchSummary(item.branch)}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">{formatCurrency(item.amount)}</td>
                                  <td className="px-4 py-4">
                                    <span className="inline-flex rounded-full border border-[#6b491f] bg-[#2b1d10]/80 px-3 py-1 text-xs font-semibold text-[#f1cb88]">
                                      {mapAppointmentStatus(item.status)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className="inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                      {mapPaymentStatus(item.paymentStatus)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-white/70">
                                    {mapPaymentMethod(item.paymentMethod)}
                                  </td>
                                  <td className="px-4 py-4 text-white/70">
                                    {item.paymentConfirmedAt
                                      ? formatDateTime(item.paymentConfirmedAt)
                                      : "Chưa xác nhận"}
                                  </td>
                                  <td className="px-4 py-4 text-white/70">
                                    {formatDateTime(item.createdAt)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:hidden">
                        {historyItems.map((item) => (
                          <article
                            key={String(item.id)}
                            className="rounded-[24px] border border-white/8 bg-[#130d09] p-5"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold tracking-[0.16em] text-[#c8a96e] uppercase">
                                  Mã lịch #{item.id}
                                </p>
                                <h3 className="mt-2 text-lg font-bold text-[#f4e3c3]">
                                  {item.serviceName}
                                </h3>
                              </div>
                              <span className="inline-flex rounded-full border border-[#6b491f] bg-[#2b1d10]/80 px-3 py-1 text-xs font-semibold text-[#f1cb88]">
                                {mapAppointmentStatus(item.status)}
                              </span>
                            </div>

                            <div className="mt-4 grid gap-3 text-sm text-white/75">
                              <div className="rounded-2xl border border-white/8 bg-[#17100b] px-4 py-3">
                                <p className="text-xs text-white/45">Thời gian hẹn</p>
                                <p className="mt-1 font-semibold text-white">
                                  {formatDateTime(item.appointmentTime)}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-white/8 bg-[#17100b] px-4 py-3">
                                <p className="text-xs text-white/45">Chi nhánh</p>
                                <p className="mt-1 font-semibold text-white">
                                  {item.branch?.name || "Chưa có thông tin chi nhánh"}
                                </p>
                                <p className="mt-1 text-xs text-white/55">
                                  {getBranchSummary(item.branch)}
                                </p>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/8 bg-[#17100b] px-4 py-3">
                                  <p className="text-xs text-white/45">Số tiền</p>
                                  <p className="mt-1 font-semibold text-white">
                                    {formatCurrency(item.amount)}
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-white/8 bg-[#17100b] px-4 py-3">
                                  <p className="text-xs text-white/45">Thanh toán</p>
                                  <p className="mt-1 font-semibold text-white">
                                    {mapPaymentStatus(item.paymentStatus)}
                                  </p>
                                </div>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/8 bg-[#17100b] px-4 py-3">
                                  <p className="text-xs text-white/45">Phương thức</p>
                                  <p className="mt-1 font-semibold text-white">
                                    {mapPaymentMethod(item.paymentMethod)}
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-white/8 bg-[#17100b] px-4 py-3">
                                  <p className="text-xs text-white/45">Xác nhận thanh toán</p>
                                  <p className="mt-1 font-semibold text-white">
                                    {item.paymentConfirmedAt
                                      ? formatDateTime(item.paymentConfirmedAt)
                                      : "Chưa xác nhận"}
                                  </p>
                                </div>
                              </div>
                              <div className="rounded-2xl border border-white/8 bg-[#17100b] px-4 py-3">
                                <p className="text-xs text-white/45">Ngày tạo lịch</p>
                                <p className="mt-1 font-semibold text-white">
                                  {formatDateTime(item.createdAt)}
                                </p>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm text-white/55">
                          Trang {pagination.page} / {pagination.totalPages} • Hiển thị {historyItems.length} lịch hẹn
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={pagination.page <= 1 || isLoading}
                            onClick={() => handlePageChange(pagination.page - 1)}
                            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Trang trước
                          </button>
                          <button
                            type="button"
                            disabled={pagination.page >= pagination.totalPages || isLoading}
                            onClick={() => handlePageChange(pagination.page + 1)}
                            className="rounded-lg border border-[#6b491f] bg-[#1e150d] px-4 py-2 text-sm font-semibold text-[#f6e7c7] transition hover:bg-[#2a1d11] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Trang sau
                          </button>
                        </div>
                      </div>
                    </>
                  ) : null}
                </section>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default BookingHistoryPage;
