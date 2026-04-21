import { Clock3 } from "lucide-react";

function AppointmentRow({ name, service, time, status }) {
  return (
    <tr className="border-b border-white/5">
      <td className="py-2">{name}</td>
      <td className="py-2">{service}</td>
      <td className="py-2">{time}</td>
      <td className="py-2">
        <span className="rounded bg-[#2f2315] px-2 py-1 text-xs text-[#e9bf78]">
          {status}
        </span>
      </td>
      <td className="py-2">
        <button
          type="button"
          className="text-white/65 transition hover:text-white"
        >
          <Clock3 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

export default AppointmentRow;
