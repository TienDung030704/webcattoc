import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import { useGetCurrentUser } from "@/features/Auth/hook";
import { formatCurrency } from "@/utils/dashboard";
import http from "@/utils/http";

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_LABELS = [
  "Tháng Một",
  "Tháng Hai",
  "Tháng Ba",
  "Tháng Tư",
  "Tháng Năm",
  "Tháng Sáu",
  "Tháng Bảy",
  "Tháng Tám",
  "Tháng Chín",
  "Tháng Mười",
  "Tháng Mười Một",
  "Tháng Mười Hai",
];
const BOOKING_MONTH_SPAN = 12;
const SERVICE_PLACEHOLDER_COUNT = 3;
const BUSINESS_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
];

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isSameDay(firstDate, secondDate) {
  return (
    firstDate?.getFullYear() === secondDate?.getFullYear() &&
    firstDate?.getMonth() === secondDate?.getMonth() &&
    firstDate?.getDate() === secondDate?.getDate()
  );
}

function getDateKey(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthLabel(value) {
  return `${MONTH_LABELS[value.getMonth()]} ${value.getFullYear()}`;
}

function getCalendarDays(visibleMonth) {
  const firstDayOfMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  );
  const firstWeekdayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const totalDaysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();
  const days = [];

  for (let index = 0; index < firstWeekdayIndex; index += 1) {
    days.push(null);
  }

  for (let dayNumber = 1; dayNumber <= totalDaysInMonth; dayNumber += 1) {
    days.push(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), dayNumber),
    );
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function buildSlotDate(selectedDate, slot) {
  const [hours, minutes] = slot.split(":").map(Number);
  return new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    hours,
    minutes,
    0,
    0,
  );
}

function formatVietnameseDate(value) {
  return value.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getSlotRangeLabel(slot) {
  const [hours, minutes] = slot.split(":").map(Number);
  const startTime = new Date(2000, 0, 1, hours, minutes, 0, 0);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

  return `${startTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${endTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getNowMarker() {
  return new Date();
}

function getMaxBookingDate(baseDate) {
  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + BOOKING_MONTH_SPAN,
    baseDate.getDate(),
  );
}

function mapBookingServiceOption(service) {
  return {
    id: service.id,
    name: service.name,
    amount: Number(service.price || 0),
    description: service.description,
    category: service.category,
  };
}

function mapBookingBranchOption(branch) {
  return {
    id: String(branch.id),
    name: branch.name,
    city: branch.city,
    district: branch.district,
    address: branch.address,
  };
}

function BookingHairPage() {
  const navigate = useNavigate();
  const currentUser = useGetCurrentUser();
  const [nowMarker, setNowMarker] = useState(() => getNowMarker());
  const today = useMemo(() => startOfDay(nowMarker), [nowMarker]);
  const maxBookingDate = useMemo(() => getMaxBookingDate(today), [today]);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(nowMarker.getFullYear(), nowMarker.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [branchOptions, setBranchOptions] = useState([]);
  const [isBranchesLoading, setIsBranchesLoading] = useState(true);
  const [branchesError, setBranchesError] = useState("");
  const [serviceOptions, setServiceOptions] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  useEffect(() => {
    // Đồng bộ lịch theo thời gian thực để qua ngày/tháng mới thì UI tự cập nhật và khóa ngày cũ.
    const syncRealtimeCalendar = () => {
      setNowMarker(getNowMarker());
    };

    syncRealtimeCalendar();
    const intervalId = window.setInterval(syncRealtimeCalendar, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const firstDayOfCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );
    const firstDayOfVisibleMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1,
    );
    const firstDayOfLastAllowedMonth = new Date(
      maxBookingDate.getFullYear(),
      maxBookingDate.getMonth(),
      1,
    );

    if (firstDayOfVisibleMonth < firstDayOfCurrentMonth) {
      setVisibleMonth(firstDayOfCurrentMonth);
      return;
    }

    if (firstDayOfVisibleMonth > firstDayOfLastAllowedMonth) {
      setVisibleMonth(firstDayOfLastAllowedMonth);
    }
  }, [maxBookingDate, today, visibleMonth]);

  useEffect(() => {
    const fetchBranches = async () => {
      setIsBranchesLoading(true);
      setBranchesError("");

      try {
        // Lấy danh sách chi nhánh thật để flow booking và trang hệ thống cửa hàng dùng chung một nguồn dữ liệu.
        const response = await http.get("user/branches");
        const items = (response?.data?.items || []).map(mapBookingBranchOption);
        setBranchOptions(items);
      } catch (error) {
        setBranchOptions([]);
        setBranchesError("Không thể tải danh sách chi nhánh lúc này.");
      } finally {
        setIsBranchesLoading(false);
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      setIsServicesLoading(true);
      setServicesError("");
      try {
        // Lấy danh sách dịch vụ thật cho booking page để bỏ hoàn toàn quick-select mock data.
        const response = await http.get("user/services");
        const items = (response?.data?.items || []).map(
          mapBookingServiceOption,
        );
        setServiceOptions(items);
      } catch (error) {
        setServiceOptions([]);
        setServicesError("Không thể tải danh sách dịch vụ lúc này.");
      } finally {
        setIsServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    if (selectedDate < today || selectedDate > maxBookingDate) {
      setSelectedDate(null);
      setSelectedSlot("");
    }
  }, [maxBookingDate, selectedDate, today]);

  useEffect(() => {
    const firstService = serviceOptions[0];
    if (!firstService) {
      return;
    }

    const hasManualServiceName = Boolean(serviceName.trim());
    const hasManualAmount = Boolean(String(amount).trim());
    if (hasManualServiceName || hasManualAmount) {
      return;
    }

    // Chỉ prefill sau khi load xong và form còn trống để không ghi đè input user đang nhập.
    setServiceName(firstService.name);
    setAmount(String(firstService.amount));
  }, [amount, serviceName, serviceOptions]);

  // Tạo lưới ngày theo tháng đang xem để user bấm vào ngày và xem slot ngay trên giao diện.
  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );

  // Với ngày hôm nay, các slot ở thời điểm hiện tại trở về trước vẫn hiển thị nhưng bị khóa để user thấy rõ khung giờ nào đã qua.
  const disabledSlotSet = useMemo(() => {
    if (!selectedDate || !isSameDay(selectedDate, nowMarker)) {
      return new Set();
    }

    return new Set(
      BUSINESS_SLOTS.filter((slot) => {
        const slotDate = buildSlotDate(selectedDate, slot);
        return slotDate.getTime() <= nowMarker.getTime();
      }),
    );
  }, [nowMarker, selectedDate]);

  const hasSelectableSlots = useMemo(
    () => BUSINESS_SLOTS.some((slot) => !disabledSlotSet.has(slot)),
    [disabledSlotSet],
  );

  const selectedBranch = useMemo(
    () =>
      branchOptions.find((branch) => branch.id === selectedBranchId) || null,
    [branchOptions, selectedBranchId],
  );

  const displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    currentUser?.username ||
    "Khách hàng";
  const firstDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  );
  const firstDayOfLastAllowedMonth = new Date(
    maxBookingDate.getFullYear(),
    maxBookingDate.getMonth(),
    1,
  );
  const canGoPrev = visibleMonth.getTime() > firstDayOfCurrentMonth.getTime();
  const canGoNext =
    visibleMonth.getTime() < firstDayOfLastAllowedMonth.getTime();
  const canSubmit =
    Boolean(serviceName.trim()) &&
    Number(amount) > 0 &&
    Boolean(selectedDate) &&
    Boolean(selectedBranchId) &&
    Boolean(selectedSlot) &&
    !isSubmitting;

  const handleSelectService = (service) => {
    // Chọn nhanh dịch vụ thật từ backend để đồng bộ tên dịch vụ và giá dự kiến trong form.
    setServiceName(service.name);
    setAmount(String(service.amount));
  };

  const handleSelectDate = (date) => {
    const nextDate = startOfDay(date);
    const isOutOfRange = nextDate < today || nextDate > maxBookingDate;

    if (isOutOfRange) return;

    // Khi đổi ngày thì reset giờ đã chọn để user chọn lại slot đúng theo ngày mới.
    setSelectedDate(nextDate);
    setSelectedSlot("");
  };

  const handleSelectBranch = (branchId) => {
    const nextBranch =
      branchOptions.find((branch) => branch.id === branchId) || null;

    // Chọn chi nhánh trước rồi mới mở form lịch đặt phía dưới.
    setSelectedBranchId(branchId);
    setSelectedDate(null);
    setSelectedSlot("");
    setVisibleMonth(new Date(nowMarker.getFullYear(), nowMarker.getMonth(), 1));

    if (nextBranch) {
      setTimeout(() => {
        document.getElementById("booking-calendar-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    }
  };

  const handleChangeMonth = (direction) => {
    setVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!serviceName.trim()) {
      toast.error("Vui lòng nhập dịch vụ muốn đặt", {
        position: "top-right",
      });
      return;
    }

    if (!selectedBranchId) {
      toast.error("Vui lòng chọn chi nhánh muốn cắt", {
        position: "top-right",
      });
      return;
    }

    if (!selectedDate) {
      toast.error("Vui lòng chọn ngày muốn đặt", {
        position: "top-right",
      });
      return;
    }

    if (!selectedSlot) {
      toast.error("Vui lòng chọn khung giờ muốn đặt", {
        position: "top-right",
      });
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      toast.error("Số tiền đặt lịch không hợp lệ", {
        position: "top-right",
      });
      return;
    }

    if (!isLoggedIn) {
      toast.error("Bạn cần đăng nhập để xác nhận lịch hẹn", {
        position: "top-right",
      });
      navigate("/auth/login", {
        state: {
          from: "/booking",
        },
      });
      return;
    }

    const appointmentAt = buildSlotDate(
      selectedDate,
      selectedSlot,
    ).toISOString();

    try {
      setIsSubmitting(true);

      await http.post("user/appointments", {
        serviceName: serviceName.trim(),
        appointmentAt,
        amount: Number(amount),
        branchId: selectedBranchId,
      });

      toast.success("Đặt lịch thành công", {
        position: "top-right",
      });

      setSelectedSlot("");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Không thể đặt lịch", {
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Header>
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#120d08]/90 backdrop-blur-md">
          <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-6 lg:px-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/logo-web.png"
                alt="WEBCATTOC"
                className="h-14 w-auto object-contain"
              />
              <span className="text-base font-bold tracking-wide text-[#e8cf9d]">
                MDT BaberShop
              </span>
            </Link>

            <nav className="mx-auto hidden min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden text-sm text-white/70 md:flex">
              <Link
                to="/"
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Trang chủ
              </Link>
              <Link
                to="/service"
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Dịch vụ
              </Link>
              <Link
                to="/product"
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Sản phẩm
              </Link>
              <Link
                to="/news"
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Tin tức
              </Link>
              <Link
                to="/stores"
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Hệ thống cửa hàng
              </Link>
              <Link
                to="/contact"
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Liên hệ
              </Link>
            </nav>

            <HeaderAuthArea />
          </div>
        </header>
      </Header>

      <main>
        <section className="relative h-[260px] overflow-hidden md:h-[320px] lg:h-[360px]">
          <img
            src="/bg-cuthair-2.png"
            alt="Đặt lịch"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(4,4,4,0.35),rgba(4,4,4,0.6),rgba(4,4,4,0.92))]" />
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold tracking-[0.28em] text-[#c8a96e] uppercase">
                Barber Booking
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-[0.06em] text-[#f6e7c7] uppercase md:text-6xl lg:text-7xl">
                Đặt lịch cắt tóc
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/80 md:text-base md:leading-8 lg:text-lg">
                Chọn ngày bạn muốn ghé tiệm, chọn khung giờ phù hợp và xác nhận
                lịch hẹn chỉ trong vài bước.
              </p>
            </div>
          </div>
        </section>

        <section
          className="relative overflow-hidden px-4 pt-10 pb-20 md:px-8 md:pt-14 md:pb-24"
          style={{
            backgroundImage:
              "linear-gradient(rgba(4,4,4,0.96), rgba(4,4,4,0.985)), radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 32%), url('/bg-cuthair.png')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/45">
              <Link to="/" className="transition hover:text-white/75">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-[#d8b77a]">Đặt lịch</span>
            </div>

            <div className="space-y-6">
              <section className="rounded-[26px] border border-white/10 bg-[#17100b]/92 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:p-8">
                <div className="border-b border-white/10 pb-5 text-center">
                  <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                    Bước 1 - Chọn chi nhánh
                  </p>
                  <h2 className="mt-3 text-3xl font-black text-[#f6e7c7] md:text-4xl">
                    Chọn nơi bạn muốn cắt tóc trước
                  </h2>
                  <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-white/60">
                    Sau khi chọn chi nhánh, hệ thống mới mở form lịch để bạn
                    chọn ngày muốn cắt và giờ muốn tới tiệm.
                  </p>
                </div>

                {isBranchesLoading ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={`branch-skeleton-${index}`}
                        className="rounded-2xl border border-white/10 bg-[#120d08] p-4"
                      >
                        <div className="h-5 w-1/2 animate-pulse rounded bg-white/10" />
                        <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-white/8" />
                        <div className="mt-2 h-4 w-full animate-pulse rounded bg-white/8" />
                      </div>
                    ))}
                  </div>
                ) : branchesError ? (
                  <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
                    {branchesError}
                  </div>
                ) : branchOptions.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-[#0d1215] px-5 py-8 text-center text-white/50">
                    Hiện chưa có chi nhánh khả dụng để đặt lịch.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {branchOptions.map((branch) => {
                      const isSelected = selectedBranchId === branch.id;

                      return (
                        <button
                          key={branch.id}
                          type="button"
                          onClick={() => handleSelectBranch(branch.id)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-[#c8a96e]/80 bg-[#24170f]"
                              : "border-white/10 bg-[#120d08] hover:border-[#c8a96e]/45 hover:bg-[#18120d]"
                          }`}
                        >
                          <p className="text-lg font-bold text-[#f6e7c7]">
                            {branch.name}
                          </p>
                          <p className="mt-2 text-sm font-medium text-[#d9c2a0]">
                            {branch.city}
                          </p>
                          <p className="mt-2 text-sm text-white/80">
                            {branch.address}
                          </p>
                          <span
                            className={`mt-4 inline-flex rounded-xl px-3 py-2 text-xs font-bold uppercase transition ${
                              isSelected
                                ? "bg-[#c8a96e] text-[#1a130b]"
                                : "bg-[#232a31] text-white/75"
                            }`}
                          >
                            {isSelected ? "Đã chọn chi nhánh" : branch.district}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {selectedBranch ? (
                <section
                  id="booking-calendar-section"
                  className="rounded-[26px] border border-white/10 bg-[#17100b]/92 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:p-8"
                >
                  <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                        Bước 2 - Chọn ngày hẹn
                      </p>
                      <h2 className="mt-3 text-3xl font-black text-[#f6e7c7] md:text-4xl">
                        {getMonthLabel(visibleMonth)}
                      </h2>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
                        Bạn đang đặt lịch tại{" "}
                        <span className="font-semibold text-[#f6e7c7]">
                          {selectedBranch.name}
                        </span>
                        . Bây giờ hãy chọn ngày muốn cắt, sau đó chọn giờ còn
                        khả dụng theo thời gian thực.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleChangeMonth(-1)}
                        disabled={!canGoPrev}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#120d08] text-white transition hover:border-[#c8a96e]/60 hover:text-[#f6e7c7] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangeMonth(1)}
                        disabled={!canGoNext}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#120d08] text-white transition hover:border-[#c8a96e]/60 hover:text-[#f6e7c7] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#c8a96e]/20 bg-[#120d08] px-4 py-3 text-sm text-[#f5e4c1]">
                    <span className="font-semibold">Chi nhánh đã chọn:</span>{" "}
                    {selectedBranch.name} - {selectedBranch.address}
                  </div>

                  <div className="mt-6 grid grid-cols-7 overflow-hidden rounded-[22px] border border-white/10 bg-[#0f0b07]/85">
                    {WEEKDAY_LABELS.map((label) => (
                      <div
                        key={label}
                        className="border-b border-white/10 bg-[#0c5d87] px-2 py-3 text-center text-sm font-bold text-white"
                      >
                        {label}
                      </div>
                    ))}

                    {calendarDays.map((day, index) => {
                      if (!day) {
                        return (
                          <div
                            key={`empty-day-${index}`}
                            className="min-h-[108px] border-r border-b border-white/10 bg-[#0f0b07]/55 last:border-r-0 md:min-h-[122px]"
                          />
                        );
                      }

                      const isDisabled = day < today || day > maxBookingDate;
                      const isSelected = selectedDate
                        ? isSameDay(day, selectedDate)
                        : false;
                      const isToday = isSameDay(day, today);

                      return (
                        <button
                          key={getDateKey(day)}
                          type="button"
                          onClick={() => handleSelectDate(day)}
                          disabled={isDisabled}
                          className={`min-h-[108px] border-r border-b border-white/10 px-3 py-4 text-left text-white/80 transition last:border-r-0 md:min-h-[122px] ${
                            isSelected
                              ? "bg-[#2a2f34]"
                              : "bg-[#12100d]/95 hover:bg-[#1a1511]"
                          } ${isDisabled ? "cursor-not-allowed opacity-35" : "cursor-pointer"}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-lg font-semibold md:text-2xl">
                              {day.getDate()}
                            </span>
                            {isToday ? (
                              <span className="rounded-full border border-[#c8a96e]/50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#f6e7c7] uppercase">
                                Hôm nay
                              </span>
                            ) : null}
                          </div>

                          {isSelected ? (
                            <span className="mt-8 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#d11b1b] text-sm font-bold text-[#f6e7c7]">
                              {day.getDate()}
                            </span>
                          ) : (
                            <span className="mt-8 block text-xs text-white/35">
                              {isDisabled ? "Không khả dụng" : "Bấm để xem giờ"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedDate ? (
                    <div className="booking-slots-reveal mt-6 rounded-[24px] border border-white/10 bg-[#11161a]/95 p-5 md:p-8">
                      <div className="border-b border-white/10 pb-5 text-center">
                        <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                          Bước 3 - Chọn giờ
                        </p>
                        <h2 className="mt-3 text-2xl font-black text-[#f6e7c7] md:text-4xl">
                          Khung giờ tại {selectedBranch.name}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-white/60">
                          Bạn đang đặt lịch cho{" "}
                          {formatVietnameseDate(selectedDate)} tại{" "}
                          {selectedBranch.address}.
                        </p>
                      </div>

                      {!hasSelectableSlots ? (
                        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-[#0d1215] px-5 py-8 text-center text-white/50">
                          Ngày này hiện không còn khung giờ khả dụng. Với ngày
                          hôm nay, các khung giờ ở thời điểm hiện tại trở về
                          trước vẫn hiển thị nhưng sẽ bị khóa theo thời gian
                          thực.
                        </div>
                      ) : (
                        <div className="mt-4 divide-y divide-white/10">
                          {BUSINESS_SLOTS.map((slot) => {
                            const isSelected = selectedSlot === slot;
                            const isDisabled = disabledSlotSet.has(slot);

                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => {
                                  if (isDisabled) {
                                    return;
                                  }

                                  setSelectedSlot(slot);
                                }}
                                disabled={isDisabled}
                                className={`flex w-full flex-col gap-4 px-4 py-5 text-left transition md:flex-row md:items-center md:justify-between ${
                                  isSelected
                                    ? "bg-[#1d2327]"
                                    : "hover:bg-white/[0.03]"
                                } ${isDisabled ? "cursor-not-allowed opacity-40 hover:bg-transparent" : ""}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#d9c2a0]">
                                    <Clock3 className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-xl font-bold text-[#d9c2a0]">
                                      {getSlotRangeLabel(slot)}
                                    </p>
                                    <p className="mt-1 text-sm tracking-wide text-white/65 uppercase">
                                      {isDisabled
                                        ? "Đã quá giờ"
                                        : "Chọn giờ này"}
                                    </p>
                                  </div>
                                </div>

                                <span
                                  className={`inline-flex min-w-[132px] items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition ${
                                    isDisabled
                                      ? "bg-[#1b1f24] text-white/45"
                                      : isSelected
                                        ? "bg-[#c8a96e] text-[#1a130b]"
                                        : "bg-[#232a31] text-white/80"
                                  }`}
                                >
                                  {isDisabled
                                    ? "Không chọn được"
                                    : isSelected
                                      ? "Đã chọn"
                                      : "Chọn giờ này"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-[#0d1215] px-5 py-8 text-center text-white/50">
                      Hãy chọn ngày trước để hệ thống hiển thị các khung giờ còn
                      đặt được.
                    </div>
                  )}
                </section>
              ) : (
                <section
                  id="booking-calendar-section"
                  className="rounded-[26px] border border-dashed border-white/10 bg-[#17100b]/70 p-6 text-center text-white/50"
                >
                  Hãy chọn chi nhánh trước, sau đó form lịch đặt sẽ xuất hiện ở
                  đây.
                </section>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 rounded-[26px] border border-white/10 bg-[#17100b]/92 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] md:p-8"
            >
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <section>
                  <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                    Chọn dịch vụ
                  </p>
                  <h2 className="mt-3 text-3xl font-black text-[#f6e7c7] md:text-4xl">
                    Hoàn tất thông tin đặt lịch
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
                    Bạn có thể chọn nhanh một dịch vụ phổ biến rồi chỉnh lại tên
                    dịch vụ hoặc giá tiền nếu cần.
                  </p>

                  <div className="mt-6 grid gap-4 xl:grid-cols-3">
                    {isServicesLoading
                      ? Array.from({ length: SERVICE_PLACEHOLDER_COUNT }).map(
                          (_, index) => (
                            <div
                              key={`service-skeleton-${index}`}
                              className="rounded-2xl border border-white/10 bg-[#120d08] p-4"
                            >
                              <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />
                              <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/8" />
                              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-white/8" />
                              <div className="mt-4 h-4 w-24 animate-pulse rounded bg-[#c8a96e]/20" />
                            </div>
                          ),
                        )
                      : serviceOptions.map((service) => {
                          const isActive =
                            serviceName === service.name &&
                            Number(amount) === service.amount;

                          return (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => handleSelectService(service)}
                              className={`rounded-2xl border p-4 text-left transition ${
                                isActive
                                  ? "border-[#c8a96e]/70 bg-[#24170f]"
                                  : "border-white/10 bg-[#120d08] hover:border-[#c8a96e]/45 hover:bg-[#18120d]"
                              }`}
                            >
                              <p className="text-lg font-bold text-[#f6e7c7]">
                                {service.name}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-white/55">
                                {service.description ||
                                  "Dịch vụ đang được cập nhật mô tả."}
                              </p>
                              {service.category ? (
                                <p className="mt-3 text-xs tracking-wide text-white/40 uppercase">
                                  {service.category}
                                </p>
                              ) : null}
                              <p className="mt-4 text-sm font-semibold text-[#e8cf9d]">
                                {formatCurrency(service.amount)}
                              </p>
                            </button>
                          );
                        })}
                  </div>

                  {!isServicesLoading && servicesError ? (
                    <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                      {servicesError} Bạn vẫn có thể nhập tay dịch vụ và số tiền
                      để tiếp tục đặt lịch.
                    </p>
                  ) : null}

                  {!isServicesLoading &&
                  !servicesError &&
                  serviceOptions.length === 0 ? (
                    <p className="mt-4 rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 text-sm text-white/60">
                      Hiện chưa có dịch vụ khả dụng để chọn nhanh. Bạn vẫn có
                      thể nhập tay thông tin dịch vụ bên dưới.
                    </p>
                  ) : null}

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-white/75">
                        Dịch vụ
                      </span>
                      <input
                        type="text"
                        value={serviceName}
                        onChange={(event) => setServiceName(event.target.value)}
                        placeholder="Ví dụ: Cắt tóc nam"
                        className="w-full rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#c8a96e]/50 focus:outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-white/75">
                        Số tiền dự kiến
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder="Nhập số tiền"
                        className="w-full rounded-2xl border border-white/10 bg-[#120d08] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#c8a96e]/50 focus:outline-none"
                      />
                    </label>
                  </div>
                </section>

                <aside className="rounded-[24px] border border-white/10 bg-[#120d08]/95 p-5 md:p-6">
                  <p className="text-sm font-semibold tracking-[0.24em] text-[#c8a96e] uppercase">
                    Tóm tắt lịch hẹn
                  </p>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="rounded-xl border border-white/10 bg-[#17100b] px-4 py-3">
                      <p className="text-white/50">Khách hàng</p>
                      <p className="mt-1 font-semibold text-white">
                        {displayName}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#17100b] px-4 py-3">
                      <p className="text-white/50">Dịch vụ</p>
                      <p className="mt-1 font-semibold text-white">
                        {serviceName || "Chưa chọn"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#17100b] px-4 py-3">
                      <p className="text-white/50">Chi nhánh</p>
                      <p className="mt-1 font-semibold text-white">
                        {selectedBranch
                          ? `${selectedBranch.name} - ${selectedBranch.city}`
                          : "Chưa chọn chi nhánh"}
                      </p>
                      {selectedBranch ? (
                        <p className="mt-2 text-xs leading-6 text-white/55">
                          {selectedBranch.address}
                        </p>
                      ) : null}
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#17100b] px-4 py-3">
                      <p className="text-white/50">Ngày</p>
                      <p className="mt-1 font-semibold text-white">
                        {selectedDate
                          ? formatVietnameseDate(selectedDate)
                          : "Chưa chọn ngày"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#17100b] px-4 py-3">
                      <p className="text-white/50">Giờ hẹn</p>
                      <p className="mt-1 font-semibold text-white">
                        {selectedSlot || "Chưa chọn giờ"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#17100b] px-4 py-3">
                      <p className="text-white/50">Số tiền dự kiến</p>
                      <p className="mt-1 font-semibold text-[#e8cf9d]">
                        {formatCurrency(amount)}
                      </p>
                    </div>
                  </div>

                  {!isLoggedIn ? (
                    <p className="mt-5 rounded-2xl border border-[#c8a96e]/25 bg-[#c8a96e]/10 px-4 py-3 text-sm leading-7 text-[#f5e4c1]">
                      Bạn có thể xem lịch trước. Khi xác nhận đặt lịch, hệ thống
                      sẽ yêu cầu đăng nhập.
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#c8a96e] px-8 py-3 text-sm font-bold text-[#1a130b] transition hover:bg-[#d9bb82] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Đang xác nhận...
                      </span>
                    ) : (
                      "Xác nhận đặt lịch"
                    )}
                  </button>
                </aside>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default BookingHairPage;
