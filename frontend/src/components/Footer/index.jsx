import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0f0b07] px-6 py-10 text-white lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo-web.png" alt="WEBCATTOC" className="h-12 w-auto object-contain" />
            <div>
              <p className="text-lg font-bold text-[#e8cf9d]">MDT BaberShop</p>
              <p className="text-sm text-white/50">Barber Booking Premium</p>
            </div>
          </div>
          <p className="mt-4 max-w-md leading-7 text-white/60">
            Đặt lịch cắt tóc nhanh, chọn barber phù hợp và tận hưởng trải nghiệm
            grooming hiện đại, chỉn chu và tiện lợi.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c8a96e]">
            Điều hướng
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-white/70">
            <Link to="/" className="transition hover:text-white">
              Trang chủ
            </Link>
            <Link to="/service" className="transition hover:text-white">
              Dịch vụ
            </Link>
            <Link to="/booking" className="transition hover:text-white">
              Đặt lịch
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c8a96e]">
            Liên hệ
          </h3>
          <div className="mt-4 space-y-3 text-white/60">
            <p>Hotline: 0123 456 789</p>
            <p>Email: mdtbarbershop@gmail.com</p>
            <p>Địa chỉ: 123 Barber Street, TP.HCM</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-4 text-sm text-white/40">
        © 2026 MDT BaberShop. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
