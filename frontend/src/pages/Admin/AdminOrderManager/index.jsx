import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  LoaderCircle,
  PackageSearch,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import http from "@/utils/http";
import { formatCurrency } from "@/utils/dashboard";

const STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Chờ xác nhận", value: "PENDING_CONFIRMATION" },
  { label: "Đã xác nhận", value: "CONFIRMED" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELED" },
];
const STATUS_TRANSITIONS = {
  PENDING_CONFIRMATION: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["COMPLETED", "CANCELED"],
  COMPLETED: [],
  CANCELED: [],
};

const INITIAL_SUMMARY = {
  totalOrders: 0,
  pendingConfirmationOrders: 0,
  confirmedOrders: 0,
  completedOrders: 0,
  canceledOrders: 0,
};
const INITIAL_PAGINATION = {
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 1,
};

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

function mapOrderStatus(status) {
  if (status === "PENDING_CONFIRMATION") return "Chờ xác nhận";
  if (status === "CONFIRMED") return "Đã xác nhận";
  if (status === "COMPLETED") return "Hoàn thành";
  if (status === "CANCELED") return "Đã hủy";
  return "Chưa rõ";
}

function mapPaymentMethod(paymentMethod) {
  if (paymentMethod === "BANK_TRANSFER") return "Chuyển khoản";
  if (paymentMethod === "COD") return "COD";
  return "Khác";
}

function mapPaymentStatus(paymentStatus) {
  if (paymentStatus === "PAID") return "Đã thanh toán";
  if (paymentStatus === "PENDING") return "Chờ thanh toán";
  return "Chưa rõ";
}

function AdminOrderManagerPage() {
  // Đồng bộ filter đơn hàng với query backend để admin tìm kiếm và phân trang thật.
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 8,
  });
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [payingId, setPayingId] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));

    return params.toString();
  }, [filters]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await http.get(`admin/orders?${queryString}`);
      setOrders(response?.data?.items || []);
      setSummary(response?.data?.summary || INITIAL_SUMMARY);
      setPagination(
        response?.data?.pagination || {
          ...INITIAL_PAGINATION,
          limit: filters.limit,
        },
      );
    } catch (error) {
      setOrders([]);
      setSummary(INITIAL_SUMMARY);
      setPagination({
        ...INITIAL_PAGINATION,
        limit: filters.limit,
      });
      setErrorMessage(
        error?.response?.data?.error || "Không thể tải danh sách đơn hàng.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters.limit, queryString]);

  const handleFilterChange = (key, value) => {
    // Khi đổi bộ lọc thì luôn quay lại trang đầu để tránh lệch dữ liệu phân trang.
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleOpenDetail = async (orderId) => {
    setDetailLoadingId(String(orderId));

    try {
      const response = await http.get(`admin/orders/${orderId}`);
      setDetailOrder(response?.data || null);
      setIsDetailOpen(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Không thể tải chi tiết đơn hàng.",
        {
          position: "top-right",
        },
      );
    } finally {
      setDetailLoadingId("");
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    if (!nextStatus) return;

    setUpdatingId(String(orderId));

    try {
      const response = await http.patch(`admin/orders/${orderId}/status`, {
        status: nextStatus,
      });
      const updatedOrder = response?.data;

      setOrders((prev) =>
        prev.map((item) =>
          String(item.id) === String(orderId)
            ? {
                ...item,
                status: updatedOrder?.status || nextStatus,
                updatedAt: updatedOrder?.updatedAt || item.updatedAt,
                paymentStatus:
                  updatedOrder?.paymentStatus || item.paymentStatus,
                paymentConfirmedAt:
                  updatedOrder?.paymentConfirmedAt || item.paymentConfirmedAt,
              }
            : item,
        ),
      );

      // Đồng bộ detail đang mở để admin không cần đóng modal rồi mở lại.
      if (detailOrder && String(detailOrder.id) === String(orderId)) {
        setDetailOrder(updatedOrder);
      }

      await fetchOrders();

      toast.success("Cập nhật trạng thái đơn hàng thành công", {
        position: "top-right",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Không thể cập nhật trạng thái đơn hàng.",
        {
          position: "top-right",
        },
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleConfirmPayment = async (orderId, paymentMethod = "COD") => {
    setPayingId(String(orderId));

    try {
      const response = await http.patch(`admin/orders/${orderId}/payment`, {
        paymentMethod,
      });
      const updatedOrder = response?.data;

      setOrders((prev) =>
        prev.map((item) =>
          String(item.id) === String(orderId)
            ? {
                ...item,
                paymentMethod:
                  updatedOrder?.paymentMethod || item.paymentMethod,
                paymentStatus:
                  updatedOrder?.paymentStatus || item.paymentStatus,
                paymentConfirmedAt:
                  updatedOrder?.paymentConfirmedAt || item.paymentConfirmedAt,
                updatedAt: updatedOrder?.updatedAt || item.updatedAt,
              }
            : item,
        ),
      );

      if (detailOrder && String(detailOrder.id) === String(orderId)) {
        setDetailOrder(updatedOrder);
      }

      await fetchOrders();

      toast.success("Đã xác nhận thanh toán đơn hàng", {
        position: "top-right",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Không thể xác nhận thanh toán đơn hàng.",
        {
          position: "top-right",
        },
      );
    } finally {
      setPayingId("");
    }
  };

  return (
    <>
      <div className="admin-card-reveal rounded-2xl border border-[#5a3e1d] bg-[#120d09]/82 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:p-5">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[0.25em] text-[#e3b76a] uppercase">
              Order Manager
            </p>
            <h1 className="mt-2 text-2xl font-black text-[#f6e7c7] md:text-3xl">
              Quản lý đơn hàng
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Theo dõi danh sách đơn hàng thật từ hệ thống, xem nhanh trạng thái
              xử lý, xác nhận đã thu tiền và cập nhật luồng giao hàng trực tiếp
              trong khu vực quản trị.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-[#6b491f] bg-[#1a120c] px-4 py-3 text-sm text-white/70">
            <PackageSearch className="h-4 w-4 text-[#e8cf9d]" />
            <span>Đang hiển thị {pagination.total} đơn hàng</span>
          </div>
        </div>

        <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Tổng đơn hàng</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
              {summary.totalOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Chờ xác nhận</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
              {summary.pendingConfirmationOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Đã xác nhận</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
              {summary.confirmedOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Hoàn thành</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
              {summary.completedOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Đã hủy</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
              {summary.canceledOrders}
            </p>
          </div>
        </section>

        <section className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_220px]">
          <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-white/45 uppercase">
              <Search className="h-4 w-4" />
              Tìm kiếm đơn hàng
            </span>
            <input
              value={filters.search}
              onChange={(event) =>
                handleFilterChange("search", event.target.value)
              }
              placeholder="Mã đơn, tên khách, email, số điện thoại"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            />
          </label>

          <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
            <span className="mb-2 block text-xs font-semibold tracking-wide text-white/45 uppercase">
              Trạng thái
            </span>
            <select
              value={filters.status}
              onChange={(event) =>
                handleFilterChange("status", event.target.value)
              }
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value || "all-status"}
                  value={option.value}
                  className="bg-[#120d09]"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </p>
        ) : null}

        <section className="mt-4 overflow-hidden rounded-2xl border border-[#5a3e1d] bg-[#100b08]/95">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-[#17100b] text-white/55">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Liên hệ</th>
                  <th className="px-4 py-3">Thanh toán</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-white/85">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-white/60"
                    >
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Đang tải danh sách đơn hàng...
                      </span>
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((item) => {
                    const nextStatuses = STATUS_TRANSITIONS[item.status] || [];
                    const isUpdating = updatingId === String(item.id);
                    const isPaying = payingId === String(item.id);
                    const isLoadingDetail = detailLoadingId === String(item.id);
                    const isPaid = item.paymentStatus === "PAID";
                    const canConfirmPayment =
                      item.status === "COMPLETED" && !isPaid;

                    return (
                      <tr
                        key={String(item.id)}
                        className="border-b border-white/5 last:border-b-0"
                      >
                        <td className="px-4 py-3 font-semibold text-[#e8cf9d]">
                          <div>
                            <p className="break-all">{item.orderCode}</p>
                            <p className="mt-1 text-xs text-white/40">
                              #{item.id}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-white">
                              {item.customerName}
                            </p>
                            <p className="mt-1 text-xs text-white/45">
                              {item.customerEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/70">
                          {item.customerPhone}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p>{mapPaymentMethod(item.paymentMethod)}</p>
                            <p className="mt-1 text-xs text-white/45">
                              {mapPaymentStatus(item.paymentStatus)}
                            </p>
                            <p className="mt-1 text-xs text-white/35">
                              {item.paymentConfirmedAt
                                ? `Xác nhận: ${formatDateTime(item.paymentConfirmedAt)}`
                                : "Chưa xác nhận thu tiền"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">{item.itemsCount}</td>
                        <td className="px-4 py-3 font-semibold text-[#f6e7c7]">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full border border-[#6b491f] bg-[#2b1d10]/80 px-3 py-1 text-xs font-semibold text-[#f1cb88]">
                            {mapOrderStatus(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/65">
                          {formatDateTime(item.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              className="h-9 rounded-lg px-3 py-0 text-xs"
                              onClick={() => handleOpenDetail(item.id)}
                              disabled={isLoadingDetail}
                            >
                              {isLoadingDetail ? (
                                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                              Chi tiết
                            </Button>

                            {canConfirmPayment ? (
                              <div className="flex items-center gap-2">
                                <select
                                  defaultValue=""
                                  disabled={isPaying}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    event.target.value = "";
                                    if (!value) return;
                                    handleConfirmPayment(item.id, value);
                                  }}
                                  className="rounded-lg border border-white/10 bg-[#17100b] px-3 py-2 text-xs text-white outline-none"
                                >
                                  <option value="" className="bg-[#120d09]">
                                    Xác nhận thanh toán
                                  </option>
                                  <option value="COD" className="bg-[#120d09]">
                                    Tiền mặt
                                  </option>
                                  <option
                                    value="BANK_TRANSFER"
                                    className="bg-[#120d09]"
                                  >
                                    Chuyển khoản
                                  </option>
                                </select>
                                {isPaying ? (
                                  <LoaderCircle className="h-4 w-4 animate-spin text-[#e8cf9d]" />
                                ) : null}
                              </div>
                            ) : isPaid ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Đã thu tiền
                              </span>
                            ) : null}

                            {nextStatuses.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <select
                                  defaultValue=""
                                  disabled={isUpdating}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    event.target.value = "";
                                    handleUpdateStatus(item.id, value);
                                  }}
                                  className="rounded-lg border border-white/10 bg-[#17100b] px-3 py-2 text-xs text-white outline-none"
                                >
                                  <option value="" className="bg-[#120d09]">
                                    Cập nhật trạng thái
                                  </option>
                                  {nextStatuses.map((status) => (
                                    <option
                                      key={status}
                                      value={status}
                                      className="bg-[#120d09]"
                                    >
                                      {mapOrderStatus(status)}
                                    </option>
                                  ))}
                                </select>
                                {isUpdating ? (
                                  <LoaderCircle className="h-4 w-4 animate-spin text-[#e8cf9d]" />
                                ) : null}
                              </div>
                            ) : !isPaid ? (
                              <span className="text-xs text-white/40">
                                Đã khóa luồng
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-white/55"
                    >
                      Không có đơn hàng nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/55">
            Trang {pagination.page} / {pagination.totalPages} • Hiển thị{" "}
            {orders.length} đơn hàng
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trang trước
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="rounded-lg border border-[#6b491f] bg-[#1e150d] px-4 py-2 text-sm font-semibold text-[#f6e7c7] transition hover:bg-[#2a1d11] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={isDetailOpen}
        onOpenChange={(nextOpen) => {
          setIsDetailOpen(nextOpen);

          if (!nextOpen) {
            setDetailOrder(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[#5a3e1d] bg-[#120d09] text-white sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-[#f6e7c7]">
              Chi tiết đơn hàng
            </DialogTitle>
            <DialogDescription className="text-white/55">
              Xem nhanh thông tin người nhận, địa chỉ giao hàng và các sản phẩm
              trong đơn.
            </DialogDescription>
          </DialogHeader>

          {detailOrder ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
                  <p className="text-sm text-white/50">Mã đơn</p>
                  <p className="mt-2 font-semibold break-all text-[#f6e7c7]">
                    {detailOrder.orderCode}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
                  <p className="text-sm text-white/50">Trạng thái</p>
                  <p className="mt-2 font-semibold text-[#f6e7c7]">
                    {mapOrderStatus(detailOrder.status)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
                  <p className="text-sm text-white/50">Thanh toán</p>
                  <p className="mt-2 font-semibold text-[#f6e7c7]">
                    {mapPaymentMethod(detailOrder.paymentMethod)}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {mapPaymentStatus(detailOrder.paymentStatus)}
                  </p>
                  <p className="mt-1 text-xs text-white/35">
                    {detailOrder.paymentConfirmedAt
                      ? `Xác nhận: ${formatDateTime(detailOrder.paymentConfirmedAt)}`
                      : "Chưa xác nhận thu tiền"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
                  <p className="text-sm text-white/50">Ngày tạo</p>
                  <p className="mt-2 font-semibold text-[#f6e7c7]">
                    {formatDateTime(detailOrder.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <section className="rounded-2xl border border-[#5a3e1d] bg-[#100b08]/95 p-5">
                  <div className="flex items-center gap-2 text-[#f6e7c7]">
                    <UserRound className="h-4 w-4" />
                    <h2 className="text-base font-semibold">
                      Thông tin người nhận
                    </h2>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-white/75">
                    <p>
                      <span className="text-white/45">Họ tên:</span>{" "}
                      {detailOrder.customer?.fullName}
                    </p>
                    <p>
                      <span className="text-white/45">Số điện thoại:</span>{" "}
                      {detailOrder.customer?.phone}
                    </p>
                    <p>
                      <span className="text-white/45">Email:</span>{" "}
                      {detailOrder.customer?.email}
                    </p>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#5a3e1d] bg-[#100b08]/95 p-5">
                  <div className="flex items-center gap-2 text-[#f6e7c7]">
                    <ChevronRight className="h-4 w-4" />
                    <h2 className="text-base font-semibold">
                      Địa chỉ giao hàng
                    </h2>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-white/75">
                    <p>{detailOrder.shippingAddress?.address}</p>
                    <p>
                      {detailOrder.shippingAddress?.ward},{" "}
                      {detailOrder.shippingAddress?.district}
                    </p>
                    <p>{detailOrder.shippingAddress?.city}</p>
                    {detailOrder.note ? (
                      <p className="pt-2 text-white/60">
                        Ghi chú: {detailOrder.note}
                      </p>
                    ) : null}
                  </div>
                </section>
              </div>

              <section className="overflow-hidden rounded-2xl border border-[#5a3e1d] bg-[#100b08]/95">
                <div className="border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-2 text-[#f6e7c7]">
                    <ShoppingBag className="h-4 w-4" />
                    <h2 className="text-base font-semibold">
                      Sản phẩm trong đơn
                    </h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-[#17100b] text-white/55">
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3">Sản phẩm</th>
                        <th className="px-4 py-3">Mã SP</th>
                        <th className="px-4 py-3">Đơn giá</th>
                        <th className="px-4 py-3">Số lượng</th>
                        <th className="px-4 py-3">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="text-white/85">
                      {detailOrder.items?.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-white/5 last:border-b-0"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5">
                                <img
                                  src={item.imageUrl || "/product-1.png"}
                                  alt={item.name}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <span className="font-semibold text-white">
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white/60">
                            #{item.productId}
                          </td>
                          <td className="px-4 py-3">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-4 py-3">{item.quantity}</td>
                          <td className="px-4 py-3 font-semibold text-[#f6e7c7]">
                            {formatCurrency(item.lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
                  <p className="text-sm text-white/50">Tạm tính</p>
                  <p className="mt-2 text-xl font-black text-[#f6e7c7]">
                    {formatCurrency(detailOrder.subtotal)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
                  <p className="text-sm text-white/50">Phí giao hàng</p>
                  <p className="mt-2 text-xl font-black text-[#f6e7c7]">
                    {formatCurrency(detailOrder.shippingFee)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
                  <p className="text-sm text-white/50">Tổng cộng</p>
                  <p className="mt-2 text-xl font-black text-[#f6e7c7]">
                    {formatCurrency(detailOrder.total)}
                  </p>
                </div>
              </section>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AdminOrderManagerPage;
