import { Link, Outlet } from "react-router-dom";

import AdminSidebar from "@/components/AdminSidebar/AdminSidebar";
import { useGetCurrentUser } from "@/features/Auth/hook";

function AdminPage() {
  // Giữ phần kiểm tra đăng nhập và role ở shell admin để các trang con dùng chung.
  const currentUser = useGetCurrentUser();
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));
  const isAdmin = currentUser?.role === "ADMIN";

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="admin-shell-reveal rounded-2xl border border-white/10 bg-[#17100b]/90 p-8 text-center">
          <h1 className="text-2xl font-black text-[#f6e7c7]">
            Bạn chưa đăng nhập
          </h1>
          <p className="mt-2 text-white/70">
            Vui lòng đăng nhập để truy cập quản trị.
          </p>
          <Link
            to="/auth/login"
            className="mt-5 inline-flex rounded-xl bg-[#c8a96e] px-5 py-2.5 text-sm font-bold text-[#1a130b]"
          >
            Đi tới đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="admin-shell-reveal rounded-2xl border border-white/10 bg-[#17100b]/90 p-8 text-center">
          <h1 className="text-2xl font-black text-[#f6e7c7]">
            Không có quyền truy cập
          </h1>
          <p className="mt-2 text-white/70">
            Chỉ tài khoản ADMIN mới được vào khu vực này.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-xl bg-[#c8a96e] px-5 py-2.5 text-sm font-bold text-[#1a130b]"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#050403] text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(4,3,2,0.9), rgba(4,3,2,0.92)), url('/bg-cuthair.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="admin-shell-reveal grid min-h-screen grid-cols-1 lg:grid-cols-[250px_1fr]">
        <AdminSidebar username={currentUser?.username} />

        <main className="min-w-0 overflow-x-hidden p-4 md:p-6">
          {/* Cho cột content co lại trong grid để bảng lớn chỉ scroll trong trang con, không đẩy vỡ layout admin. */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminPage;
