function NoticeItem({ title, message, time, isRead = false }) {
  return (
    // isRead dùng để đổi style giữa thông báo đã đọc và chưa đọc.
    <li
      className={`rounded-lg border px-3 py-2 text-sm ${
        isRead
          ? "border-white/10 bg-white/5 text-white/70"
          : "border-[#6b491f] bg-[#2b1d10]/80 text-white/85"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-[#f7deb1]">{title}</p>
        <span className="shrink-0 text-[10px] text-white/45">{time}</span>
      </div>
      <p className="mt-1 text-xs text-white/55">{message}</p>
    </li>
  );
}

export default NoticeItem;
