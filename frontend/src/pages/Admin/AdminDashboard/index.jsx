import { useEffect, useState } from "react";
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

function AdminDashboardPage() {
  // Dashboard con chỉ fetch dữ liệu riêng của màn tổng quan, không giữ shell admin nữa.
  const [dashboard, setDashboard] = useState({
    totalAppointmentsToday: 0,
    newCustomers: 0,
    todayRevenue: 0,
    mostPopularService: null,
  });
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [appointmentsToday, setAppointmentsToday] = useState([]);
  const [manageAppointments, setManageAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsDashboardLoading(true);
      setDashboardError("");

      try {
        const [
          appointmentsCount,
          customersCount,
          todayRevenue,
          popularService,
          appointmentsTodayData,
          appointmentsData,
          notificationsData,
          unreadCount,
        ] = await Promise.all([
          http.get("admin/dashboard/appointments-today"),
          http.get("admin/dashboard/new-customers"),
          http.get("admin/dashboard/today-revenue"),
          http.get("admin/dashboard/most-popular-service"),
          http.get("admin/appointments/today"),
          http.get("admin/appointments?limit=5"),
          http.get("admin/notifications?limit=5"),
          http.get("admin/notifications/unread-count"),
        ]);

        setDashboard({
          totalAppointmentsToday: appointmentsCount?.data ?? 0,
          newCustomers: customersCount?.data ?? 0,
          todayRevenue: todayRevenue?.data ?? 0,
          mostPopularService: popularService?.data ?? null,
        });
        setAppointmentsToday(
          Array.isArray(appointmentsTodayData?.data)
            ? appointmentsTodayData.data
            : []
        );
        setManageAppointments(appointmentsData?.data?.items || []);
        setNotifications(notificationsData?.data?.items || []);
        setNotificationUnreadCount(unreadCount?.data ?? 0);
      } catch (error) {
        setDashboard({
          totalAppointmentsToday: 0,
          newCustomers: 0,
          todayRevenue: 0,
          mostPopularService: null,
        });
        setAppointmentsToday([]);
        setManageAppointments([]);
        setNotifications([]);
        setNotificationUnreadCount(0);
        setDashboardError("Không thể tải dữ liệu dashboard.");
      } finally {
        setIsDashboardLoading(false);
      }
    };

    fetchDashboard();
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
            <p className="mb-3 text-sm text-white/70">Đang tải dữ liệu dashboard...</p>
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
              title="Doanh thu hôm nay"
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
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-[#f6e7c7]">Doanh thu tuần</h2>
              <span className="text-xs text-white/45">Tất cả thời gian</span>
            </div>

            <div className="grid h-44 grid-cols-[28px_1fr] gap-3">
              <div className="flex flex-col justify-between text-[10px] text-white/45">
                <span>10m</span>
                <span>8m</span>
                <span>6m</span>
                <span>4m</span>
                <span>2m</span>
                <span>0</span>
              </div>
              <div className="flex h-full items-end justify-between gap-2 border-b border-white/10 pb-1">
                {[18, 28, 34, 47, 58, 74, 83, 36].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-full max-w-[32px] rounded-t-sm bg-gradient-to-t from-[#7a4a1d] to-[#e3b76a]"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </section>

          <section
            className="admin-card-reveal rounded-xl border border-[#5a3e1d] bg-[#100b08]/95 p-4"
            style={{ animationDelay: "0.24s" }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-[#f6e7c7]">Danh sách lịch hẹn hôm nay</h2>
              <Link
                to="/admin/appointments"
                className="text-sm font-semibold text-[#e8cf9d] transition hover:text-white"
              >
                Xem quản lý lịch hẹn
              </Link>
            </div>
            <div className="overflow-x-auto">
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
