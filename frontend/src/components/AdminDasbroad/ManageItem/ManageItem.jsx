function ManageItem({ code, customer, service, time, status }) {
  return (
    // Hiển thị 1 lịch hẹn rút gọn cho khu vực quản lý nhanh ở sidebar admin.
    <div className="grid grid-cols-[58px_1fr_auto] items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-2">
      <span className="text-xs text-white/45">{code}</span>
      <div>
        <p className="text-xs text-white/70">{customer}</p>
        <p className="text-xs text-[#f7deb1]">{service}</p>
        {status ? (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#e9bf78]">
            {status}
          </p>
        ) : null}
      </div>
      <p className="text-xs font-semibold text-[#e9bf78]">{time}</p>
    </div>
  );
}

export default ManageItem;
