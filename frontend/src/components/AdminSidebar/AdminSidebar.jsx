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
} from "lucide-react";
import { NavLink } from "react-router-dom";

function MenuItem({ icon, label, to, disabled = false }) {
  if (disabled) {
    return (
      <button
        className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-left text-white/35"
        type="button"
        disabled
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
          isActive
            ? "bg-[#c8a96e] font-semibold text-[#1a130b]"
            : "text-white/75 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function AdminSidebar({ username }) {
  return (
    <aside className="border-r border-[#4b3217] bg-[#090705]/90 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-[#1a120b]">
          <img
            src="/logo-web.png"
            alt="logo"
            className="h-6 w-6 object-contain"
          />
        </div>
        <p className="text-base font-black tracking-wide text-[#f4d7a2]">MDT</p>
      </div>

      <div className="mt-4 rounded-xl border border-[#5a3e1d] bg-[#140f0a] p-3">
        <p className="text-xs text-white/50">Xin chào</p>
        <p className="mt-1 text-sm font-semibold text-[#f8dfb4]">{username}</p>
        <p className="text-xs text-white/45">Quản trị viên hệ thống</p>
      </div>

      <nav className="mt-5 space-y-1.5 text-sm">
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

        <MenuItem to="/admin/customers" icon={<Users className="h-4 w-4" />} label="Khách hàng" />
        <MenuItem
          disabled
          icon={<ChartColumnBig className="h-4 w-4" />}
          label="Doanh thu"
        />
        <MenuItem disabled icon={<Settings className="h-4 w-4" />} label="Cài đặt" />
      </nav>
    </aside>
  );
}

export default AdminSidebar;
