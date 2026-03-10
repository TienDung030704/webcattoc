import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  Heart,
  LogOut,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAutoLogout, useGetCurrentUser } from "@/features/Auth/hook";
import { useCartCount } from "@/features/cart/hook";
import { useFavoriteActions, useFavoriteCount } from "@/features/favorite/hook";
import { formatTime } from "@/utils/dashboard";
import http from "@/utils/http";


function HeaderAuthArea() {
  const navigate = useNavigate();
  const logoutApi = useAutoLogout();
  const currentUser = useGetCurrentUser();
  const { getFavorites, resetFavoritesState } = useFavoriteActions();
  const favoriteCount = useFavoriteCount();
  const cartCount = useCartCount();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  const displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    "Khách hàng";
  const isAdmin = currentUser?.role === "ADMIN";

  const clearAuthStorage = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  };

  useEffect(() => {
    if (!isLoggedIn) {
      // Khi chưa đăng nhập thì reset favorites để badge không bị giữ lại từ session trước.
      resetFavoritesState();
      return;
    }

    getFavorites();
  }, [getFavorites, isLoggedIn, resetFavoritesState]);

  useEffect(() => {
    // Chỉ ADMIN mới có quyền đọc notification từ nhánh /admin.
    if (!isLoggedIn || !isAdmin) {
      setNotifications([]);
      setNotificationUnreadCount(0);
      return;
    }
    const fetchNotifications = async () => {
      setIsNotificationsLoading(true);
      try {
        const [notificationsData, unreadCountData] = await Promise.all([
          http.get("admin/notifications?limit=5"),
          http.get("admin/notifications/unread-count"),
        ]);

        setNotifications(notificationsData?.data?.items || []);
        setNotificationUnreadCount(unreadCountData?.data ?? 0);
      } catch {
        setNotifications([]);
        setNotificationUnreadCount(0);
      } finally {
        setIsNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [isLoggedIn, isAdmin]);

  const handleMarkAllNotificationsAsRead = async () => {
    if (!isAdmin || notificationUnreadCount === 0) return;

    try {
      await http.patch("admin/notifications/read-all");
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setNotificationUnreadCount(0);
    } catch {
      toast.error("Không thể đánh dấu tất cả thông báo là đã đọc", {
        position: "top-right",
      });
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const refreshToken = localStorage.getItem("refresh_token");
    setIsLoggingOut(true);

    try {
      const result = await logoutApi({ refreshToken });
      if (result) {
        clearAuthStorage();
        resetFavoritesState();
        toast.success("Đăng xuất thành công", {
          position: "top-right",
          style: {
            background: "#16a34a",
            color: "#ffffff",
            border: "1px solid #15803d",
            fontSize: "16px",
            fontWeight: "600",
            padding: "14px 16px",
          },
        });
        navigate("/auth/login", { replace: true });
      }
    } catch (error) {
      console.error("Logout failed:", error);
      clearAuthStorage();
      resetFavoritesState();
      toast.error("Mất kết nối server, đã đăng xuất trên thiết bị này", {
        position: "top-right",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          border: "1px solid #b91c1c",
        },
      });
      navigate("/auth/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };
  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="relative rounded-md p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Giỏ hàng"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        </button>
        <Link
          to="/auth/login"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Đăng nhập
        </Link>
        <Link
          to="/auth/register"
          className="rounded-lg bg-[#c8a96e] px-4 py-2 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82]"
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 max-w-[220px] items-center gap-2 rounded-lg px-2 py-1.5 text-white/90 transition hover:bg-white/10"
          >
            <User className="h-5 w-5 shrink-0 text-white/70" />
            <p className="flex max-w-[160px] min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap text-xs md:max-w-[180px] md:text-sm">
              <span className="shrink-0">Hi,</span>
              <span className="block min-w-0 truncate font-semibold text-[#e8cf9d]">
                {displayName}
              </span>
            </p>
            <ChevronDown className="h-4 w-4 shrink-0 text-white/60" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 border-white/10 bg-[#17100b] p-2 text-white shadow-2xl"
        >
          <DropdownMenuItem
            onClick={() => navigate("/information-individual")}
            className="cursor-pointer rounded-md px-3 py-2 text-sm focus:bg-white/10 focus:text-white"
          >
            <User className="h-4 w-4 text-[#e8cf9d]" />
            <span>Thông tin tài khoản</span>
          </DropdownMenuItem>
          {isAdmin ? (
            <DropdownMenuItem
              onClick={() => navigate("/admin")}
              className="cursor-pointer rounded-md px-3 py-2 text-sm focus:bg-white/10 focus:text-white"
            >
              <Settings className="h-4 w-4 text-[#e8cf9d]" />
              <span>Quản lý</span>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer rounded-md px-3 py-2 text-sm text-red-300 focus:bg-red-500/10 focus:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4 text-red-300" />
            <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        className="relative rounded-md p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
        aria-label="Yêu thích"
      >
        <Heart className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {favoriteCount > 99 ? "99+" : favoriteCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => navigate("/cart")}
        className="relative rounded-md p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
        aria-label="Giỏ hàng"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      </button>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="relative rounded-md p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Thông báo"
          >
            <Bell className="h-5 w-5" />
            {notificationUnreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e1b262] px-1 text-[10px] font-semibold text-[#1a130b]">
                {notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 inline-flex h-3.5 w-3.5 rounded-full bg-[#e1b262]" />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[360px] border-white/10 bg-[#17100b] p-0 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <DropdownMenuLabel className="p-0 text-sm font-semibold text-[#f6e7c7]">
              Thông báo
            </DropdownMenuLabel>
            {isAdmin && notificationUnreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllNotificationsAsRead}
                className="text-xs font-medium text-[#e8cf9d] transition hover:text-white"
              >
                Đánh dấu đã đọc
              </button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {isAdmin ? (
              isNotificationsLoading ? (
                <div className="rounded-lg px-3 py-6 text-center text-sm text-white/60">
                  Đang tải thông báo...
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={String(item.id)}
                    className={`mb-2 rounded-lg border px-3 py-3 text-sm last:mb-0 ${
                      item.isRead
                        ? "border-white/10 bg-white/5 text-white/70"
                        : "border-[#6b491f] bg-[#2b1d10]/80 text-white/85"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-[#f7deb1]">{item.title}</p>
                      <span className="shrink-0 text-[10px] text-white/45">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/55">{item.message}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg px-3 py-6 text-center text-sm text-white/60">
                  Chưa có thông báo nào.
                </div>
              )
            ) : (
              <div className="rounded-lg px-3 py-6 text-center text-sm text-white/60">
                Chưa có thông báo nào.
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default HeaderAuthArea;
