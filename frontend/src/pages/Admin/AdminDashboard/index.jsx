import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AppointmentRow from "@/components/AdminDasbroad/AppointmentRow/AppointmentRow";
import ManageItem from "@/components/AdminDasbroad/ManageItem/ManageItem";
import NoticeItem from "@/components/AdminDasbroad/NoticeItem/NoticeItem";
import StatCard from "@/components/AdminDasbroad/StatCard/StatCard";
import http from "@/utils/http";
import {
  formatCurrency,
  formatTime,
  mapAppointmentStatus,
} from "@/utils/dashboard";

const ADMIN_NOTIFICATIONS_UPDATED_EVENT = "admin-notifications-updated";
const ADMIN_NOTIFICATIONS_POLLING_MS = 25 * 1000;

function getWeeklyRevenueScaleMax(maxRevenue) {
  if (maxRevenue <= 0) {
    return 1;
  }

  // Chừa headroom và làm tròn theo mốc đẹp để cột cao nhất không luôn chạm trần biểu đồ.
  const rawScale = maxRevenue * 1.15;
  const magnitude = 10 ** Math.floor(Math.log10(rawScale));
  const normalized = rawScale / magnitude;

  let niceScale = 10;
  if (normalized <= 1) {
    niceScale = 1;
  } else if (normalized <= 2) {
    niceScale = 2;
  } else if (normalized <= 5) {
    niceScale = 5;
  }

  return niceScale * magnitude;
}

function AdminDashboardPage() {
  // Dashboard con chỉ fetch dữ liệu riêng của màn tổng quan, không giữ shell admin nữa.
  const [dashboard, setDashboard] = useState({
    totalAppointmentsToday: 0,
    newCustomers: 0,
    todayRevenue: 0,
    mostPopularService: null,
  });
  const [weeklyRevenue, setWeeklyRevenue] = useState({
    items: [],
    summary: {
      totalRevenue: 0,
      maxRevenue: 0,
    },
  });
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [appointmentsToday, setAppointmentsToday] = useState([]);
  const [manageAppointments, setManageAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

  useEffect(() => {
    let isDisposed = false;

    const fetchDashboard = async () => {
      setIsDashboardLoading(true);
      setDashboardError("");

      try {
        const results = await Promise.allSettled([
          http.get("admin/dashboard/appointments-today"),
          http.get("admin/dashboard/new-customers"),
          http.get("admin/dashboard/today-revenue"),
          http.get("admin/dashboard/weekly-revenue"),
          http.get("admin/dashboard/most-popular-service"),
          http.get("admin/appointments/today"),
          http.get("admin/appointments?limit=5"),
        ]);

        if (isDisposed) {
          return;
        }

        const [
          appointmentsCount,
          customersCount,
          todayRevenue,
          weeklyRevenueData,
          popularService,
          appointmentsTodayData,
          appointmentsData,
        ] = results;
        const hasFailures = results.some((result) => result.status === "rejected");

        // Giữ từng widget độc lập để một API lỗi không kéo doanh thu hôm nay về 0 oan.
        setDashboard({
          totalAppointmentsToday:
            appointmentsCount.status === "fulfilled"
              ? appointmentsCount.value?.data ?? 0
              : 0,
          newCustomers:
            customersCount.status === "fulfilled"
              ? customersCount.value?.data ?? 0
              : 0,
          todayRevenue:
            todayRevenue.status === "fulfilled" ? todayRevenue.value?.data ?? 0 : 0,
          mostPopularService:
            popularService.status === "fulfilled"
              ? popularService.value?.data ?? null
              : null,
        });
        setWeeklyRevenue(
          weeklyRevenueData.status === "fulfilled"
            ? {
                items: weeklyRevenueData.value?.data?.items || [],
                summary: {
                  totalRevenue:
                    weeklyRevenueData.value?.data?.summary?.totalRevenue ?? 0,
                  maxRevenue: weeklyRevenueData.value?.data?.summary?.maxRevenue ?? 0,
                },
              }
            : {
                items: [],
                summary: {
                  totalRevenue: 0,
                  maxRevenue: 0,
                },
              },
        );
        setAppointmentsToday(
          appointmentsTodayData.status === "fulfilled" &&
            Array.isArray(appointmentsTodayData.value?.data)
            ? appointmentsTodayData.value.data
            : [],
        );
        setManageAppointments(
          appointmentsData.status === "fulfilled"
            ? appointmentsData.value?.data?.items || []
            : [],
        );
        setDashboardError(
          hasFailures ? "Một phần dữ liệu dashboard chưa tải được." : "",
        );
      } catch {
        if (isDisposed) {
          return;
        }

        setDashboard({
          totalAppointmentsToday: 0,
          newCustomers: 0,
          todayRevenue: 0,
          mostPopularService: null,
        });
        setWeeklyRevenue({
          items: [],
          summary: {
            totalRevenue: 0,
            maxRevenue: 0,
          },
        });
        setAppointmentsToday([]);
        setManageAppointments([]);
        setDashboardError("Không thể tải dữ liệu dashboard.");
      } finally {
        if (!isDisposed) {
          setIsDashboardLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isDisposed = true;
    };
  }, []);

  const weeklyRevenueMeta = useMemo(() => {
    const items = Array.isArray(weeklyRevenue.items) ? weeklyRevenue.items : [];
    const maxRevenue = Number(weeklyRevenue.summary?.maxRevenue || 0);
    const scaleMax = getWeeklyRevenueScaleMax(maxRevenue);

    return {
      items,
      maxRevenue,
      scaleMax,
      totalRevenueLabel: formatCurrency(
        weeklyRevenue.summary?.totalRevenue || 0,
      ),
      scaleLabels: [1, 0.75, 0.5, 0.25, 0].map((ratio) =>
        formatCurrency(scaleMax * ratio),
      ),
    };
  }, [weeklyRevenue]);

  useEffect(() => {
    let isDisposed = false;

    const refreshNotifications = async () => {
      try {
        const [notificationsData, unreadCount] = await Promise.all([
          http.get("admin/notifications?limit=5"),
          http.get("admin/notifications/unread-count"),
        ]);

        if (isDisposed) {
          return;
        }

        setNotifications(notificationsData?.data?.items || []);
        setNotificationUnreadCount(unreadCount?.data ?? 0);
      } catch (error) {
        if (isDisposed) {
          return;
        }
      }
    };

    // Sidebar thông báo tự refresh độc lập để admin thấy thông báo mới mà không phải reload cả dashboard.
    const handleNotificationsUpdated = () => {
      refreshNotifications();
    };

    refreshNotifications();

    const intervalId = window.setInterval(() => {
      refreshNotifications();
    }, ADMIN_NOTIFICATIONS_POLLING_MS);

    window.addEventListener(
      ADMIN_NOTIFICATIONS_UPDATED_EVENT,
      handleNotificationsUpdated,
    );

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener(
        ADMIN_NOTIFICATIONS_UPDATED_EVENT,
        handleNotificationsUpdated,
      );
    };
  }, []);

  return (
    <div className="admin-card-reveal rounded-2xl border border-[#5a3e1d] bg-[#120d09]/82 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:p-5">
      <h1
        className="admin-card-reveal mt-4 text-2xl font-black text-[#f6e7c7] md:text-3xl"
        style={{ animationDelay: "0.08s" }}
      >
        Dashboard quản trị
      </h1>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2.2fr)_340px]">
        <div className="space-y-4">
          {isDashboardLoading && (
            <p className="mb-3 text-sm text-white/70">
              Đang tải dữ liệu dashboard...
            </p>
          )}

          {dashboardError && (
            <p className="mb-3 text-sm text-red-300">{dashboardError}</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Tổng lịch hôm nay"
              value={dashboard.totalAppointmentsToday}
            />
            <StatCard title="Tổng khách hàng" value={dashboard.newCustomers} />
            <StatCard
              title="Doanh thu đã thu hôm nay"
              value={formatCurrency(dashboard.todayRevenue)}
            />
            <StatCard
              title="Dịch vụ phổ biến"
              value={dashboard.mostPopularService || "Chưa có"}
            />
          </div>

          <section
            className="admin-card-reveal rounded-xl border border-[#5a3e1d] bg-[#100b08]/95 p-4"
            style={{ animationDelay: "0.18s" }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-[#f6e7c7]">Doanh thu tuần</h2>
                <p className="mt-1 text-xs text-white/45">
                  7 ngày gần nhất theo ngày xác nhận thu tiền thực tế
                </p>
              </div>
              <span className="text-xs font-semibold text-[#e8cf9d]">
                {weeklyRevenueMeta.totalRevenueLabel}
              </span>
            </div>

            {weeklyRevenueMeta.items.length > 0 ? (
              <div className="grid h-71 grid-cols-[44px_1fr] gap-3">
                <div className="flex flex-col justify-between text-[10px] text-white/45">
                  {weeklyRevenueMeta.scaleLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <div className="grid h-full grid-rows-[1fr_auto] gap-2">
                  <div className="flex h-full items-end justify-between gap-2 rounded-xl border border-white/10 bg-[#17100b]/70 px-2 py-3">
                    {weeklyRevenueMeta.items.map((item) => {
                      const heightPercent =
                        item.revenue > 0
                          ? Math.max(
                              (item.revenue / weeklyRevenueMeta.scaleMax) * 100,
                              8,
                            )
                          : 0;

                      return (
                        <div
                          key={item.date}
                          className="flex h-full w-full flex-col items-center justify-end"
                        >
                          <div
                            className="relative flex h-full w-full max-w-[44px] items-end rounded-xl bg-white/5 px-1.5 py-1"
                            title={`${item.fullLabel}: ${formatCurrency(item.revenue)}`}
                          >
                            {/* Giữ cột doanh thu luôn có khung chiều cao cố định để thanh vàng render đúng theo doanh thu hiện tại. */}
                            <div
                              className="w-full rounded-lg bg-gradient-to-t from-[#7a4a1d] via-[#c9902f] to-[#f2d18b] shadow-[0_0_18px_rgba(227,183,106,0.35)] transition-all duration-300"
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-start justify-between gap-2 px-2">
                    {weeklyRevenueMeta.items.map((item) => (
                      <div
                        key={`${item.date}-label`}
                        className="w-full text-center text-[10px] text-white/50"
                      >
                        <p>{item.label}</p>
                        <p>{item.fullLabel}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-60 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/50">
                Chưa có doanh thu đã xác nhận trong 7 ngày gần nhất.
              </div>
            )}
          </section>

          <section
            className="admin-card-reveal flex flex-col rounded-xl border border-[#5a3e1d] bg-[#100b08]/95 p-4"
            style={{ animationDelay: "0.24s" }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-[#f6e7c7]">
                Danh sách lịch hẹn hôm nay
              </h2>
              <Link
                to="/admin/appointments"
                className="text-sm font-semibold text-[#e8cf9d] transition hover:text-white"
              >
                Xem quản lý lịch hẹn
              </Link>
            </div>
            <div className="min-h-[280px] flex-1 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-white/60">
                  <tr className="border-b border-white/10">
                    <th className="py-2">Khách hàng</th>
                    <th className="py-2">Dịch vụ</th>
                    <th className="py-2">Giờ</th>
                    <th className="py-2">Trạng thái</th>
                    <th className="py-2">Xử lý</th>
                  </tr>
                </thead>
                <tbody className="text-white/85">
                  {appointmentsToday.length > 0 ? (
                    appointmentsToday.map((item) => (
                      <AppointmentRow
                        key={String(item.id)}
                        name={item.customerName}
                        service={item.serviceName}
                        time={formatTime(item.appointmentTime)}
                        status={mapAppointmentStatus(item.status)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td className="py-3 text-white/60" colSpan={5}>
                        Chưa có lịch hẹn hôm nay.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="admin-side-reveal space-y-4">
          <section
            className="admin-card-reveal rounded-xl border border-[#5a3e1d] bg-[#100b08]/95 p-4"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-[#f6e7c7]">Thông báo</h2>
              <span className="text-xs text-white/45">
                {notificationUnreadCount} chưa đọc
              </span>
            </div>
            <ul className="space-y-2">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <NoticeItem
                    key={String(item.id)}
                    title={item.title}
                    message={item.message}
                    time={formatTime(item.createdAt)}
                    isRead={item.isRead}
                  />
                ))
              ) : (
                <li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/55">
                  Chưa có thông báo nào.
                </li>
              )}
            </ul>
          </section>

          <section
            className="admin-card-reveal rounded-xl border border-[#5a3e1d] bg-[#100b08]/95 p-4"
            style={{ animationDelay: "0.36s" }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-[#f6e7c7]">Quản lý lịch hẹn</h2>
              <Link
                to="/admin/appointments"
                className="text-sm font-semibold text-[#e8cf9d] transition hover:text-white"
              >
                Mở trang
              </Link>
            </div>
            <div className="space-y-2 text-sm">
              {manageAppointments.length > 0 ? (
                manageAppointments.map((item) => (
                  <ManageItem
                    key={String(item.id)}
                    code={`#${item.id}`}
                    customer={item.customerName}
                    service={item.serviceName}
                    time={formatTime(item.appointmentTime)}
                    status={mapAppointmentStatus(item.status)}
                  />
                ))
              ) : (
                <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/55">
                  Chưa có lịch hẹn để quản lý.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
