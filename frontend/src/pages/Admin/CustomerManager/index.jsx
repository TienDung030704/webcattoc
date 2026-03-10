import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, LoaderCircle, Search, ShieldAlert, Users } from "lucide-react";

import http from "@/utils/http";

const VERIFIED_FILTER_OPTIONS = [
  { label: "Tất cả xác minh", value: "" },
  { label: "Đã xác minh", value: "true" },
  { label: "Chưa xác minh", value: "false" },
];

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

function CustomerManagerPage() {
  // Đồng bộ filter của trang khách hàng với query backend để tìm kiếm và phân trang thật.
  const [filters, setFilters] = useState({
    search: "",
    isVerified: "",
    page: 1,
    limit: 8,
  });
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    verifiedCustomers: 0,
    unverifiedCustomers: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.isVerified) {
      params.set("isVerified", filters.isVerified);
    }

    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));

    return params.toString();
  }, [filters]);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await http.get(`admin/users?${queryString}`);
        setCustomers(response?.data?.items || []);
        setSummary(
          response?.data?.summary || {
            totalCustomers: 0,
            verifiedCustomers: 0,
            unverifiedCustomers: 0,
          }
        );
        setPagination(
          response?.data?.pagination || {
            page: 1,
            limit: filters.limit,
            total: 0,
            totalPages: 1,
          }
        );
      } catch (error) {
        setCustomers([]);
        setSummary({
          totalCustomers: 0,
          verifiedCustomers: 0,
          unverifiedCustomers: 0,
        });
        setPagination({
          page: 1,
          limit: filters.limit,
          total: 0,
          totalPages: 1,
        });
        setErrorMessage("Không thể tải danh sách khách hàng.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [filters.limit, queryString]);

  const handleFilterChange = (key, value) => {
    // Khi admin đổi bộ lọc thì luôn quay lại trang đầu để đồng bộ dữ liệu.
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
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#e3b76a]">
            Customer Manager
          </p>
          <h1 className="mt-2 text-2xl font-black text-[#f6e7c7] md:text-3xl">
            Quản lý khách hàng
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Theo dõi danh sách khách hàng thật từ hệ thống, tìm kiếm nhanh theo tên
            hoặc email và kiểm tra trạng thái xác minh tài khoản.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-[#6b491f] bg-[#1a120c] px-4 py-3 text-sm text-white/70">
          <Users className="h-4 w-4 text-[#e8cf9d]" />
          <span>Đang hiển thị {pagination.total} khách hàng</span>
        </div>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
          <p className="text-sm text-white/50">Tổng khách hàng</p>
          <p className="mt-2 text-3xl font-black text-[#f6e7c7]">{summary.totalCustomers}</p>
          <p className="mt-2 text-xs text-white/45">Tổng số tài khoản người dùng trong hệ thống.</p>
        </div>
        <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
          <p className="text-sm text-white/50">Đã xác minh</p>
          <p className="mt-2 text-3xl font-black text-[#f6e7c7]">{summary.verifiedCustomers}</p>
          <p className="mt-2 text-xs text-white/45">Các tài khoản đã hoàn tất bước xác minh email.</p>
        </div>
        <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
          <p className="text-sm text-white/50">Chưa xác minh</p>
          <p className="mt-2 text-3xl font-black text-[#f6e7c7]">{summary.unverifiedCustomers}</p>
          <p className="mt-2 text-xs text-white/45">Các tài khoản cần tiếp tục xác minh để tăng độ tin cậy.</p>
        </div>
      </section>

      <section className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_220px]">
        <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/45">
            <Search className="h-4 w-4" />
            Tìm kiếm khách hàng
          </span>
          <input
            value={filters.search}
            onChange={(event) => handleFilterChange("search", event.target.value)}
            placeholder="Tên khách hàng, username, email hoặc id"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          />
        </label>

        <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/45">
            Trạng thái xác minh
          </span>
          <select
            value={filters.isVerified}
            onChange={(event) => handleFilterChange("isVerified", event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          >
            {VERIFIED_FILTER_OPTIONS.map((option) => (
              <option key={option.value || "all-verified"} value={option.value} className="bg-[#120d09]">
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
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-[#17100b] text-white/55">
              <tr className="border-b border-white/10">
                <th className="px-4 py-3">Mã KH</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Xác minh</th>
                <th className="px-4 py-3">Lịch hẹn</th>
                <th className="px-4 py-3">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="text-white/85">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-white/60">
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Đang tải danh sách khách hàng...
                    </span>
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((item) => (
                  <tr key={String(item.id)} className="border-b border-white/5 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-[#e8cf9d]">#{item.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-white">{item.displayName}</p>
                        <p className="mt-1 text-xs text-white/45">
                          {item.firstName || item.lastName
                            ? `${item.firstName || ""} ${item.lastName || ""}`.trim()
                            : "Chưa có tên đầy đủ"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/75">{item.username || "Chưa có"}</td>
                    <td className="px-4 py-3">{item.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                        {item.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                          item.isVerified
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                            : "border-red-400/30 bg-red-500/10 text-red-200"
                        }`}
                      >
                        {item.isVerified ? (
                          <BadgeCheck className="h-3.5 w-3.5" />
                        ) : (
                          <ShieldAlert className="h-3.5 w-3.5" />
                        )}
                        {item.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.totalAppointments}</td>
                    <td className="px-4 py-3 text-white/65">{formatDateTime(item.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-white/55">
                    Không có khách hàng nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-white/55">
          Trang {pagination.page} / {pagination.totalPages} • Hiển thị {customers.length} khách hàng
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

export default CustomerManagerPage;
