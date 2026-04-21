import {
  CalendarCheck,
  ChartColumnBig,
  LayoutDashboard,
  Newspaper,
  PackageSearch,
  Scissors,
  Settings,
  ShoppingBag,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Home,
} from "lucide-react";
import { NavLink, Link } from "react-router-dom";

function MenuItem({ icon, label, to, disabled = false }) {
  if (disabled) {
    return (
      <button
        className="group flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/25 transition-all"
        type="button"
        disabled
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
          {icon}
        </div>
        <span className="font-medium">{label}</span>
        <span className="ml-auto rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-white/30 uppercase">
          Soon
        </span>
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        `group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-[#c8a96e] to-[#b89555] font-bold text-[#1a130b] shadow-lg shadow-[#c8a96e]/20"
            : "font-medium text-white/65 hover:bg-white/[0.08] hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-[#1a130b]/10"
                : "bg-white/5 group-hover:bg-white/10"
            }`}
          >
            {icon}
          </div>
          <span className="flex-1">{label}</span>
          {isActive && (
            <div className="h-1.5 w-1.5 rounded-full bg-[#1a130b]/60" />
          )}
        </>
      )}
    </NavLink>
  );
}

function AdminSidebar({ username }) {
  return (
    <aside className="border-r border-[#4b3217] bg-[#090705]/90 p-4 backdrop-blur-sm">
      {/* Logo Section with gradient */}
      <div className="group flex items-center justify-between gap-3 border-b border-white/10 pb-4 transition-all duration-300 hover:border-[#c8a96e]/30">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#c8a96e]/20 to-[#895e2a]/20 shadow-lg ring-1 shadow-[#c8a96e]/10 ring-[#c8a96e]/20 transition-all duration-300 group-hover:shadow-[#c8a96e]/20 group-hover:ring-[#c8a96e]/40">
            <img
              src="/logo-web.png"
              alt="logo"
              className="h-7 w-7 object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div>
            <p className="text-lg font-black tracking-wide text-[#f4d7a2] transition-colors duration-300 group-hover:text-[#c8a96e]">
              MDT
            </p>
            <p className="text-[9px] font-medium tracking-wider text-white/30 uppercase">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Back to Home Button */}
        <Link
          to="/"
          className="group/home flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/60 ring-1 ring-white/10 transition-all duration-200 hover:bg-[#c8a96e]/20 hover:text-[#c8a96e] hover:shadow-lg hover:shadow-[#c8a96e]/10 hover:ring-[#c8a96e]/30"
          title="Quay về trang chủ"
        >
          <Home className="h-4 w-4 transition-transform duration-200 group-hover/home:scale-110" />
        </Link>
      </div>

      <div className="group relative mt-4 overflow-hidden rounded-xl border border-[#5a3e1d]/50 bg-gradient-to-br from-[#1a120b] via-[#140f0a] to-[#0f0a06] p-4 shadow-lg transition-all duration-300 hover:border-[#c8a96e]/40 hover:shadow-[#c8a96e]/10">
        {/* Subtle shine effect */}
        <div className="absolute -top-8 -right-8 h-16 w-16 rounded-full bg-[#c8a96e]/5 blur-2xl transition-all duration-500 group-hover:bg-[#c8a96e]/10" />

        <div className="relative flex items-start gap-3">
          {/* Avatar với gradient ring */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c8a96e] via-[#d4b87e] to-[#c8a96e] p-[2px]">
              <div className="h-full w-full rounded-full bg-[#140f0a]" />
            </div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#c8a96e]/20 to-[#895e2a]/20">
              <ShieldCheck className="h-6 w-6 text-[#c8a96e]" strokeWidth={2} />
            </div>
            {/* Status indicator */}
            <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[#140f0a] bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-medium tracking-wider text-white/40 uppercase">
                Xin chào
              </p>
              <Sparkles className="h-3 w-3 text-[#c8a96e]/60" />
            </div>
            <p className="text-base font-bold text-[#f8dfb4] drop-shadow-sm">
              {username}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#c8a96e]/10 px-2 py-0.5 ring-1 ring-[#c8a96e]/20">
              <div className="h-1.5 w-1.5 rounded-full bg-[#c8a96e]" />
              <span className="text-[10px] font-semibold tracking-wide text-[#c8a96e] uppercase">
                Quản trị viên
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2 px-1">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">
            Navigation
          </p>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <nav className="space-y-1 text-sm">
          <MenuItem
            to="/admin"
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Dashboard"
          />

          <MenuItem
            to="/admin/appointments"
            icon={<CalendarCheck className="h-4 w-4" />}
            label="Quản lý lịch hẹn"
          />

          <MenuItem
            to="/admin/services"
            icon={<Scissors className="h-4 w-4" />}
            label="Quản lý dịch vụ"
          />

          <MenuItem
            to="/admin/news"
            icon={<Newspaper className="h-4 w-4" />}
            label="Quản lý tin tức"
          />

          <MenuItem
            to="/admin/products"
            icon={<ShoppingBag className="h-4 w-4" />}
            label="Quản lý sản phẩm"
          />

          <MenuItem
            to="/admin/orders"
            icon={<PackageSearch className="h-4 w-4" />}
            label="Quản lý đơn hàng"
          />

          <MenuItem
            to="/admin/customers"
            icon={<Users className="h-4 w-4" />}
            label="Khách hàng"
          />
          <MenuItem
            to="/admin/revenue"
            icon={<ChartColumnBig className="h-4 w-4" />}
            label="Doanh thu"
          />
          <MenuItem
            disabled
            icon={<Settings className="h-4 w-4" />}
            label="Cài đặt"
          />
        </nav>
      </div>
    </aside>
  );
}

export default AdminSidebar;
