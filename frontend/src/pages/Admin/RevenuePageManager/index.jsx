import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  ChartColumnBig,
  LoaderCircle,
  Search,
} from "lucide-react";

import http from "@/utils/http";
import { formatCurrency, mapPaymentMethod } from "@/utils/dashboard";

const INITIAL_SUMMARY = {
  totalRevenue: 0,
  totalPaidAppointments: 0,
  averageRevenuePerAppointment: 0,
  cashRevenue: 0,
  bankTransferRevenue: 0,
};

function mapRevenueSourceLabel(source) {
  if (source === "ORDER") return "Đơn hàng";
  return "Lịch hẹn";
}

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

function mapBranchOption(branch) {
  return {
    id: String(branch.id),
    name: branch.name,
    city: branch.city,
    district: branch.district,
  };
}

function RevenuePageManager() {
  // Đồng bộ filter với query backend để admin xem doanh thu theo đúng khoảng thu tiền thực tế.
  const [filters, setFilters] = useState({
    search: "",
    from: "",
    to: "",
    branchId: "",
    page: 1,
    limit: 8,
  });
  const [revenues, setRevenues] = useState([]);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBranchesLoading, setIsBranchesLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.from) {
      params.set("from", filters.from);
    }

    if (filters.to) {
      params.set("to", filters.to);
    }

    if (filters.branchId) {
      params.set("branchId", filters.branchId);
    }

    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));
    return params.toString();
  }, [filters]);
  useEffect(() => {
    const fetchBranches = async () => {
      setIsBranchesLoading(true);

      try {
        // Reuse nguồn dữ liệu chi nhánh hiện có để filter revenue theo cùng danh sách branch public/admin đang dùng.
        const response = await http.get("user/branches");
        setBranches((response?.data?.items || []).map(mapBranchOption));
      } catch (error) {
        setBranches([]);
      } finally {
        setIsBranchesLoading(false);
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchRevenue = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        // Revenue page lấy dữ liệu các lịch đã hoàn thành và đã được xác nhận thu tiền từ backend.
        const endpoint = queryString
          ? `admin/revenue?${queryString}`
          : "admin/revenue";
        const response = await http.get(endpoint);
        setRevenues(response?.data?.items || []);
        setSummary(response?.data?.summary || INITIAL_SUMMARY);
        setPagination(
          response?.data?.pagination || {
            ...INITIAL_PAGINATION,
            limit: filters.limit,
          },
        );
      } catch (error) {
        setRevenues([]);
        setSummary(INITIAL_SUMMARY);
        setPagination({
          ...INITIAL_PAGINATION,
          limit: filters.limit,
        });
        setErrorMessage(
          error?.response?.data?.error || "Không thể tải báo cáo doanh thu.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenue();
  }, [filters.limit, queryString]);

  const handleFilterChange = (key, value) => {
    // Khi đổi điều kiện lọc thì luôn quay về trang đầu để tránh pagination bị lệch dữ liệu.
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

  return (
    <div className="admin-card-reveal rounded-2xl border border-[#5a3e1d] bg-[#120d09]/82 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:p-5">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium tracking-[0.25em] text-[#e3b76a] uppercase">
            Revenue Manager
          </p>
          <h1 className="mt-2 text-2xl font-black text-[#f6e7c7] md:text-3xl">
            Quản lý doanh thu
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Theo dõi các lịch hẹn và đơn hàng đã được xác nhận thu tiền, lọc nhanh
            theo khoảng ngày ghi nhận doanh thu để đối soát dòng tiền ngay trong
            khu vực quản trị.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-[#6b491f] bg-[#1a120c] px-4 py-3 text-sm text-white/70">
          <ChartColumnBig className="h-4 w-4 text-[#e8cf9d]" />
          <span>Đang hiển thị {pagination.total} giao dịch doanh thu</span>
        </div>
      </div>

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
          <p className="text-sm text-white/50">Tổng doanh thu</p>
          <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
            {formatCurrency(summary.totalRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
          <p className="text-sm text-white/50">Giao dịch đã ghi nhận</p>
          <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
            {summary.totalPaidAppointments}
          </p>
        </div>

        <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
          <p className="text-sm text-white/50">Tiền mặt</p>
          <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
            {formatCurrency(summary.cashRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
          <p className="text-sm text-white/50">Chuyển khoản</p>
          <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
            {formatCurrency(summary.bankTransferRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
          <p className="text-sm text-white/50">Trung bình / lịch</p>
          <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
            {formatCurrency(summary.averageRevenuePerAppointment)}
          </p>
        </div>
      </section>

      <section className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_220px_220px_240px]">
        <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-white/45 uppercase">
            <Search className="h-4 w-4" />
            Tìm kiếm giao dịch
          </span>
          <input
            value={filters.search}
            onChange={(event) =>
              handleFilterChange("search", event.target.value)
            }
            placeholder="Khách hàng, email, dịch vụ, mã đơn, chi nhánh"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          />
        </label>

        <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-white/45 uppercase">
            <CalendarRange className="h-4 w-4" />
            Từ ngày
          </span>
          <input
            type="date"
            value={filters.from}
            onChange={(event) => handleFilterChange("from", event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </label>

        <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-white/45 uppercase">
            <CalendarRange className="h-4 w-4" />
            Đến ngày
          </span>
          <input
            type="date"
            value={filters.to}
            onChange={(event) => handleFilterChange("to", event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </label>

        <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
          <span className="mb-2 block text-xs font-semibold tracking-wide text-white/45 uppercase">
            Chi nhánh
          </span>
          <select
            value={filters.branchId}
            onChange={(event) =>
              handleFilterChange("branchId", event.target.value)
            }
            className="w-full bg-transparent text-sm text-white outline-none"
          >
            <option value="" className="bg-[#120d09]">
              {isBranchesLoading ? "Đang tải chi nhánh..." : "Tất cả chi nhánh"}
            </option>
            {branches.map((branch) => (
              <option
                key={branch.id}
                value={branch.id}
                className="bg-[#120d09]"
              >
                {branch.name} - {branch.district}
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
          <table className="w-full min-w-[1280px] text-left text-sm">
            <thead className="bg-[#17100b] text-white/55">
              <tr className="border-b border-white/10">
                <th className="px-4 py-3">Nguồn</th>
                <th className="px-4 py-3">Mã giao dịch</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Chi nhánh</th>
                <th className="px-4 py-3">Nội dung</th>
                <th className="px-4 py-3">Ngày phát sinh</th>
                <th className="px-4 py-3">Xác nhận thu tiền</th>
                <th className="px-4 py-3">Phương thức</th>
                <th className="px-4 py-3">Số tiền</th>
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
                      Đang tải báo cáo doanh thu...
                    </span>
                  </td>
                </tr>
              ) : revenues.length > 0 ? (
                revenues.map((item) => (
                  <tr
                    key={`${item.source}-${String(item.id)}`}
                    className="border-b border-white/5 last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-[#6b491f] bg-[#2b1d10]/80 px-3 py-1 text-xs font-semibold text-[#f1cb88]">
                        {mapRevenueSourceLabel(item.source)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#e8cf9d]">
                      {item.source === "ORDER" ? item.id : `#${item.id}`}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-white">
                          {item.customerName}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {item.customerEmail || "Chưa có email"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {item.branch ? (
                        <div>
                          <p>{item.branch.name}</p>
                          <p className="mt-1 text-xs text-white/45">
                            {item.branch.district}, {item.branch.city}
                          </p>
                        </div>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="px-4 py-3">{item.serviceName}</td>
                    <td className="px-4 py-3 text-white/70">
                      {formatDateTime(item.appointmentTime)}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {formatDateTime(item.paymentConfirmedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-[#6b491f] bg-[#2b1d10]/80 px-3 py-1 text-xs font-semibold text-[#f1cb88]">
                        {mapPaymentMethod(item.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#f6e7c7]">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-white/55"
                  >
                    Không có giao dịch doanh thu nào phù hợp với bộ lọc hiện
                    tại.
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
          {revenues.length} giao dịch
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

export default RevenuePageManager;
