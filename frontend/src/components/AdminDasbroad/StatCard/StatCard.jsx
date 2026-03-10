function StatCard({ title, value }) {
  return (
    <div className="rounded-xl border border-[#5a3e1d] bg-[#100b08]/95 p-4">
      <p className="text-xs text-white/55">{title}</p>
      <p className="mt-1 text-2xl font-bold text-[#f6e7c7]">{value}</p>
    </div>
  );
}

export default StatCard;
