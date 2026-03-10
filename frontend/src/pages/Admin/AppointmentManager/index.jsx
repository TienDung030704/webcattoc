import { useEffect, useMemo, useState } from "react";
import { CalendarRange, LoaderCircle, Search } from "lucide-react";
import { toast } from "sonner";

import http from "@/utils/http";
import {
  formatCurrency,
  formatTime,
  mapAppointmentStatus,
} from "@/utils/dashboard";

const STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Đã đặt", value: "BOOKED" },
  { label: "Đang làm", value: "IN_PROGRESS" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELED" },
];

const STATUS_TRANSITIONS = {
  BOOKED: ["IN_PROGRESS", "CANCELED"],
  IN_PROGRESS: ["COMPLETED", "CANCELED"],
  COMPLETED: [],
  CANCELED: [],
};

function AppointmentManagerPage() {
  // Lưu filter để đồng bộ query với API quản lý lịch hẹn của admin.
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    date: "",
    page: 1,
    limit: 8,
  });
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.date) {
      params.set("date", filters.date);
    }

    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));

    return params.toString();
  }, [filters]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await http.get(`admin/appointments?${queryString}`);
        setAppointments(response?.data?.items || []);
        setPagination(
          response?.data?.pagination || {
            page: 1,
            limit: filters.limit,
            total: 0,
            totalPages: 1,
          }
        );
      } catch (error) {
        setAppointments([]);
        setPagination({
          page: 1,
          limit: filters.limit,
          total: 0,
          totalPages: 1,
        });
        setErrorMessage("Không thể tải danh sách lịch hẹn.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
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

  const handleUpdateStatus = async (appointmentId, nextStatus) => {
    if (!nextStatus) return;

    setUpdatingId(String(appointmentId));
    try {
      await http.patch(`admin/appointments/${appointmentId}/status`, {
        status: nextStatus,
      });

      setAppointments((prev) =>
        prev.map((item) =>
          String(item.id) === String(appointmentId)
            ? { ...item, status: nextStatus }
            : item
        )
      );

      toast.success("Cập nhật trạng thái lịch hẹn thành công", {
        position: "top-right",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể cập nhật trạng thái lịch hẹn",
        {
          position: "top-right",
        }
      );
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="admin-card-reveal rounded-2xl border border-[#5a3e1d] bg-[#120d09]/82 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:p-5">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#e3b76a]">
            Appointment Manager
          </p>
          <h1 className="mt-2 text-2xl font-black text-[#f6e7c7] md:text-3xl">
            Quản lý đặt lịch
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Theo dõi danh sách lịch hẹn, lọc nhanh theo trạng thái và cập nhật tiến
            trình xử lý ngay trong trang quản trị.
          </p>
        </div>

        <div className="rounded-xl border border-[#6b491f] bg-[#1a120c] px-4 py-3 text-sm text-white/70">
          <p className="text-white/50">Tổng lịch đang hiển thị</p>
          <p className="mt-1 text-xl font-bold text-[#f6e7c7]">{pagination.total}</p>
        </div>
      </div>

      <section className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_200px_200px]">
        <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/45">
            <Search className="h-4 w-4" />
            Tìm kiếm
          </span>
          <input
            value={filters.search}
            onChange={(event) => handleFilterChange("search", event.target.value)}
            placeholder="Tìm theo khách hàng hoặc dịch vụ"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          />
        </label>

        <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/45">
            Trạng thái
          </span>
          <select
            value={filters.status}
            onChange={(event) => handleFilterChange("status", event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value} className="bg-[#120d09]">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/45">
            <CalendarRange className="h-4 w-4" />
            Ngày hẹn
          </span>
          <input
            type="date"
            value={filters.date}
            onChange={(event) => handleFilterChange("date", event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </label>
      </section>

      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-4 overflow-hidden rounded-2xl border border-[#5a3e1d] bg-[#100b08]/95">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[#17100b] text-white/55">
              <tr className="border-b border-white/10">
                <th className="px-4 py-3">Mã lịch</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Dịch vụ</th>
                <th className="px-4 py-3">Giờ hẹn</th>
                <th className="px-4 py-3">Số tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="text-white/85">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-white/60">
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Đang tải danh sách lịch hẹn...
                    </span>
                  </td>
                </tr>
              ) : appointments.length > 0 ? (
                appointments.map((item) => {
                  const nextStatuses = STATUS_TRANSITIONS[item.status] || [];
                  const isUpdating = updatingId === String(item.id);

                  return (
                    <tr key={String(item.id)} className="border-b border-white/5 last:border-b-0">
                      <td className="px-4 py-3 font-semibold text-[#e8cf9d]">#{item.id}</td>
                      <td className="px-4 py-3">{item.customerName}</td>
                      <td className="px-4 py-3 text-white/65">{item.customerEmail || "Chưa có"}</td>
                      <td className="px-4 py-3">{item.serviceName}</td>
                      <td className="px-4 py-3">{formatTime(item.appointmentTime)}</td>
                      <td className="px-4 py-3">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full border border-[#6b491f] bg-[#2b1d10]/80 px-3 py-1 text-xs font-semibold text-[#f1cb88]">
                          {mapAppointmentStatus(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
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
                                Chọn trạng thái
                              </option>
                              {nextStatuses.map((status) => (
                                <option key={status} value={status} className="bg-[#120d09]">
                                  {mapAppointmentStatus(status)}
                                </option>
                              ))}
                            </select>
                            {isUpdating ? (
                              <LoaderCircle className="h-4 w-4 animate-spin text-[#e8cf9d]" />
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-white/40">Không thể cập nhật thêm</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-white/55">
                    Không có lịch hẹn nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-white/55">
          Trang {pagination.page} / {pagination.totalPages} • Hiển thị {appointments.length} lịch hẹn
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
  );
}

export default AppointmentManagerPage;
