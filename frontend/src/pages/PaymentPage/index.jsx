import { ChevronDown, ChevronRight, ShoppingBag, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderAuthArea from "@/components/Header/AuthIsStatus/AuthStatus";
import {
  useCartActions,
  useCartItems,
  useCartSummary,
} from "@/features/cart/hook";
import {
  createMomoOrderPayment,
  createOrder,
} from "@/service/order/orderService";

function getCartItemFallbackLabel(name) {
  return String(name || "SP")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item.slice(0, 3).toUpperCase())
    .join(" ");
}

function formatDisplayPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

const ORDER_SUCCESS_STORAGE_KEY = "payment_order_snapshot";
const PAYMENT_MOMO_STORAGE_KEY = "payment_momo_snapshot";
const PROVINCES_API_BASE_URL = "https://provinces.open-api.vn/api";
const DEFAULT_CITY_CODE = "01";
const DEFAULT_CITY_NAME = "Thành phố Hà Nội";
const EMPTY_LOCATION_OPTIONS = [];
const INITIAL_LOCATION_FORM_VALUES = {
  fullName: "",
  phone: "",
  email: "",
  city: DEFAULT_CITY_NAME,
  cityCode: DEFAULT_CITY_CODE,
  district: "",
  districtCode: "",
  ward: "",
  wardCode: "",
  address: "",
  note: "",
};
const BANK_ACCOUNT_NAME = "NGUYEN TIEN DUNG";
const BANK_ACCOUNT_NUMBER = "9869271243";
const BANK_NAME = "VIETCOMBANK";
const BANK_QR_IMAGE = "/bank.png";

async function fetchLocationJson(path) {
  const response = await fetch(`${PROVINCES_API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu địa chỉ");
  }

  return response.json();
}

function normalizeLocationOptions(items = []) {
  return Array.isArray(items)
    ? items.map((item) => ({
        code: String(item?.code || "").trim(),
        name: String(item?.name || "").trim(),
      }))
    : [];
}

function PaymentPage() {
  const navigate = useNavigate();
  const items = useCartItems();
  const { subtotal } = useCartSummary();
  const { clearCart } = useCartActions();
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [formValues, setFormValues] = useState(INITIAL_LOCATION_FORM_VALUES);
  const [provinceOptions, setProvinceOptions] = useState(EMPTY_LOCATION_OPTIONS);
  const [districtOptions, setDistrictOptions] = useState(EMPTY_LOCATION_OPTIONS);
  const [wardOptions, setWardOptions] = useState(EMPTY_LOCATION_OPTIONS);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const isEmptyCart = items.length === 0;
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  const selectedProvinceName = useMemo(
    () =>
      provinceOptions.find((province) => province.code === formValues.cityCode)?.name ||
      formValues.city,
    [formValues.city, formValues.cityCode, provinceOptions],
  );

  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);

      try {
        const provinces = await fetchLocationJson("/p/");
        const nextProvinceOptions = normalizeLocationOptions(provinces);
        setProvinceOptions(nextProvinceOptions);

        const defaultProvince =
          nextProvinceOptions.find((province) => province.code === DEFAULT_CITY_CODE) ||
          nextProvinceOptions[0];

        if (!defaultProvince) {
          return;
        }

        // Đồng bộ name/code của tỉnh thành từ API thật để dropdown hiển thị đầy đủ 63 tỉnh thành.
        setFormValues((prev) => ({
          ...prev,
          city: defaultProvince.name,
          cityCode: defaultProvince.code,
        }));
      } catch {
        toast.error("Không thể tải danh sách tỉnh/thành phố.", {
          position: "top-right",
        });
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    const provinceCode = String(formValues.cityCode || "").trim();

    if (!provinceCode) {
      setDistrictOptions(EMPTY_LOCATION_OPTIONS);
      setWardOptions(EMPTY_LOCATION_OPTIONS);
      return;
    }

    const fetchDistricts = async () => {
      setIsLoadingDistricts(true);

      try {
        const provinceDetail = await fetchLocationJson(`/p/${provinceCode}?depth=2`);
        setDistrictOptions(normalizeLocationOptions(provinceDetail?.districts));
      } catch {
        setDistrictOptions(EMPTY_LOCATION_OPTIONS);
        toast.error("Không thể tải danh sách quận/huyện.", {
          position: "top-right",
        });
      } finally {
        setIsLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [formValues.cityCode]);

  useEffect(() => {
    const districtCode = String(formValues.districtCode || "").trim();

    if (!districtCode) {
      setWardOptions(EMPTY_LOCATION_OPTIONS);
      return;
    }

    const fetchWards = async () => {
      setIsLoadingWards(true);

      try {
        const districtDetail = await fetchLocationJson(`/d/${districtCode}?depth=2`);
        setWardOptions(normalizeLocationOptions(districtDetail?.wards));
      } catch {
        setWardOptions(EMPTY_LOCATION_OPTIONS);
        toast.error("Không thể tải danh sách phường/xã.", {
          position: "top-right",
        });
      } finally {
        setIsLoadingWards(false);
      }
    };

    fetchWards();
  }, [formValues.districtCode]);

  const handleChangeField = (field) => (event) => {
    // Gom state form vào một object để phần UI checkout dễ mở rộng ở bước nối API sau.
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleChangeProvince = (event) => {
    const nextCityCode = event.target.value;
    const nextProvince = provinceOptions.find((province) => province.code === nextCityCode);

    // Khi đổi tỉnh/thành thì reset quận/huyện và phường/xã để tránh giữ dữ liệu lệch cấp hành chính.
    setFormValues((prev) => ({
      ...prev,
      cityCode: nextCityCode,
      city: nextProvince?.name || "",
      district: "",
      districtCode: "",
      ward: "",
      wardCode: "",
    }));
    setDistrictOptions(EMPTY_LOCATION_OPTIONS);
    setWardOptions(EMPTY_LOCATION_OPTIONS);
  };

  const handleChangeDistrict = (event) => {
    const nextDistrictCode = event.target.value;
    const nextDistrict = districtOptions.find((district) => district.code === nextDistrictCode);

    setFormValues((prev) => ({
      ...prev,
      districtCode: nextDistrictCode,
      district: nextDistrict?.name || "",
      ward: "",
      wardCode: "",
    }));
    setWardOptions(EMPTY_LOCATION_OPTIONS);
  };

  const handleChangeWard = (event) => {
    const nextWardCode = event.target.value;
    const nextWard = wardOptions.find((ward) => ward.code === nextWardCode);

    setFormValues((prev) => ({
      ...prev,
      wardCode: nextWardCode,
      ward: nextWard?.name || "",
    }));
  };

  const buildOrderPayload = () => ({
    paymentMethod:
      paymentMethod === "bank"
        ? "BANK_TRANSFER"
        : paymentMethod === "momo"
          ? "MOMO"
          : "COD",
    items: items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity || 0),
    })),
    customer: {
      fullName: formValues.fullName.trim(),
      phone: formValues.phone.trim(),
      email: formValues.email.trim(),
    },
    shippingAddress: {
      city: formValues.city.trim(),
      district: formValues.district.trim(),
      ward: formValues.ward.trim(),
      address: formValues.address.trim(),
    },
    note: formValues.note.trim(),
  });

  const handleSubmitOrder = async () => {
    const requiredFields = [
      { key: "fullName", label: "họ và tên" },
      { key: "phone", label: "số điện thoại" },
      { key: "email", label: "email" },
      { key: "city", label: "tỉnh/thành phố" },
      { key: "district", label: "quận/huyện" },
      { key: "ward", label: "xã/phường/thị trấn" },
      { key: "address", label: "địa chỉ" },
    ];
    const missingField = requiredFields.find(
      (field) => !String(formValues[field.key] || "").trim(),
    );

    if (missingField) {
      toast.error(`Vui lòng nhập ${missingField.label}.`, {
        position: "top-right",
      });
      return;
    }

    if (!isLoggedIn) {
      toast.error("Bạn cần đăng nhập để đặt hàng.", {
        position: "top-right",
      });
      navigate("/auth/login", {
        state: {
          from: "/payment",
        },
      });
      return;
    }

    const payload = buildOrderPayload();

    try {
      setIsSubmittingOrder(true);

      if (paymentMethod === "momo") {
        // Flow MoMo không được clear cart hay vào success ngay, phải chờ backend xác nhận paid.
        const orderSnapshot = await createMomoOrderPayment(payload);
        const momoPayUrl = String(orderSnapshot?.paymentSession?.payUrl || "").trim();

        sessionStorage.setItem(
          PAYMENT_MOMO_STORAGE_KEY,
          JSON.stringify(orderSnapshot),
        );

        if (momoPayUrl) {
          // Nếu backend đã lấy được payUrl thật từ MoMo thì chuyển thẳng user sang cổng thanh toán.
          toast.success("Đang chuyển sang cổng thanh toán MoMo.", {
            position: "top-right",
          });
          window.location.assign(momoPayUrl);
          return;
        }

        // Fallback về màn pending nội bộ nếu provider chưa trả payUrl nhưng vẫn còn dữ liệu session để retry/check.
        toast.success("Đã tạo phiên thanh toán MoMo.", {
          position: "top-right",
        });

        navigate("/payment/momo", {
          replace: true,
          state: {
            orderSnapshot,
          },
        });
        return;
      }

      // Checkout thật sẽ lấy order snapshot từ backend để success page hiển thị đúng dữ liệu đã lưu DB.
      const orderSnapshot = await createOrder(payload);

      sessionStorage.setItem(
        ORDER_SUCCESS_STORAGE_KEY,
        JSON.stringify(orderSnapshot),
      );
      clearCart();

      toast.success("Đặt hàng thành công.", {
        position: "top-right",
      });

      navigate("/payment/success", {
        replace: true,
        state: {
          orderSnapshot,
        },
      });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Không thể tạo đơn hàng.", {
        position: "top-right",
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(8, 6, 4, 0.48), rgba(8, 6, 4, 0.72)), url('/bg-product.png?v=2')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
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
                className="rounded-full bg-[#c8a96e] px-4 py-2 font-semibold text-[#1a130b]"
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

      <main className="product-page-fade mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="mb-8 flex items-center gap-3 text-[17px] text-white/90">
          <Link to="/" className="transition hover:text-[#e8cf9d]">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4 text-white/45" />
          <span>Thanh toán</span>
        </div>
        {isEmptyCart ? (
          <section className="rounded-[30px] border border-white/10 bg-[#11161d]/88 px-6 py-12 text-center shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#c8a96e]/25 bg-[#c8a96e]/10 text-[#e8cf9d]">
              <ShoppingBag className="h-9 w-9" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-white">
              Chưa có sản phẩm để thanh toán
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Giỏ hàng của bạn đang trống. Hãy quay lại trang sản phẩm để thêm
              món trước khi thanh toán.
            </p>
            <button
              type="button"
              onClick={() => navigate("/product")}
              className="mt-8 inline-flex items-center justify-center rounded-full border border-[#7e6742] px-10 py-4 text-lg font-medium text-white transition hover:bg-white/5"
            >
              Quay lại mua sắm
            </button>
          </section>
        ) : (
          <div className="space-y-8">
            <section className="overflow-hidden rounded-[24px] border border-white/8 bg-[#0d1218]/92 px-5 py-4 shadow-[0_22px_60px_rgba(0,0,0,0.34)] lg:px-12 lg:py-7">
              <div className="hidden border-b border-white/12 pb-6 lg:grid lg:grid-cols-[minmax(0,1.4fr)_220px_180px_220px] lg:items-center lg:gap-6">
                <span className="text-[18px] font-semibold text-white">
                  Tên sản phẩm
                </span>
                <span className="text-center text-[18px] font-semibold text-white">
                  Đơn giá
                </span>
                <span className="text-center text-[18px] font-semibold text-white">
                  Số lượng
                </span>
                <span className="text-right text-[18px] font-semibold text-white">
                  Thành tiền
                </span>
              </div>

              <div className="divide-y divide-white/12">
                {items.map((item) => {
                  const price = Number(item?.price || 0);
                  const quantity = Number(item?.quantity || 0);
                  const lineTotal = price * quantity;

                  return (
                    <article
                      key={item.productId}
                      className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1.4fr)_220px_180px_220px] lg:items-center lg:gap-6"
                    >
                      <div className="flex items-start gap-5">
                        <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-white">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="px-3 text-center text-sm font-bold tracking-[0.18em] text-[#11161d] uppercase">
                              {getCartItemFallbackLabel(item.name)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 pt-2">
                          <h2 className="text-[20px] leading-8 font-medium text-white">
                            {item.name}
                          </h2>
                          <p className="mt-2 text-[14px] text-[#c3a57e]">
                            SKU:{" "}
                            <span className="text-white/70">
                              {item.productId}
                            </span>
                          </p>
                          <span className="mt-3 inline-flex items-center gap-2 text-[15px] font-semibold text-white">
                            <Tag className="h-4 w-4 text-white/80" />
                            Giảm 3%
                          </span>
                        </div>
                      </div>

                      <div className="lg:text-center">
                        <p className="text-sm text-white/45 lg:hidden">
                          Đơn giá
                        </p>
                        <div className="mt-1 lg:mt-0">
                          <p className="text-[18px] text-white/35 line-through">
                            {formatDisplayPrice(price)} đ
                          </p>
                          <p className="mt-1 text-[24px] font-semibold text-white">
                            {formatDisplayPrice(price)} đ
                          </p>
                        </div>
                      </div>

                      <div className="lg:text-center">
                        <p className="text-sm text-white/45 lg:hidden">
                          Số lượng
                        </p>
                        <p className="mt-1 text-[24px] font-semibold text-white lg:mt-0">
                          {quantity}
                        </p>
                      </div>

                      <div className="lg:text-right">
                        <p className="text-sm text-white/45 lg:hidden">
                          Thành tiền
                        </p>
                        <p className="mt-1 text-[24px] font-semibold text-[#f6e1bf] lg:mt-0">
                          {formatDisplayPrice(lineTotal)} đ
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.9fr)]">
              <div className="rounded-[24px] border border-white/8 bg-[#0d1218]/92 px-6 py-7 shadow-[0_22px_60px_rgba(0,0,0,0.34)] lg:px-10">
                <h2 className="text-[18px] font-semibold text-white lg:text-[22px]">
                  Thông tin giao hàng
                </h2>
                <div className="mt-6 h-px bg-white/12" />

                <div className="mt-7 grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-[16px] font-medium text-white">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formValues.fullName}
                      onChange={handleChangeField("fullName")}
                      placeholder="Nhập đầy đủ họ và tên của bạn"
                      className="h-[56px] w-full rounded-[6px] border border-white/14 bg-transparent px-5 text-[16px] text-white placeholder:text-white/45 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[16px] font-medium text-white">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formValues.phone}
                      onChange={handleChangeField("phone")}
                      placeholder="Nhập số điện thoại"
                      className="h-[56px] w-full rounded-[6px] border border-white/14 bg-transparent px-5 text-[16px] text-white placeholder:text-white/45 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[16px] font-medium text-white">
                      Địa chỉ email <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formValues.email}
                      onChange={handleChangeField("email")}
                      placeholder="Nhập Email"
                      className="h-[56px] w-full rounded-[6px] border border-white/14 bg-transparent px-5 text-[16px] text-white placeholder:text-white/45 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[16px] font-medium text-white">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formValues.cityCode}
                        onChange={handleChangeProvince}
                        disabled={isLoadingProvinces}
                        className="h-[56px] w-full appearance-none rounded-[6px] border border-white/14 bg-transparent px-5 pr-12 text-[16px] text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="" className="bg-[#11161d] text-white">
                          {isLoadingProvinces ? "Đang tải tỉnh/thành phố..." : "Chọn tỉnh/thành phố"}
                        </option>
                        {provinceOptions.map((province) => (
                          <option
                            key={province.code}
                            value={province.code}
                            className="bg-[#11161d] text-white"
                          >
                            {province.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-white/40" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[16px] font-medium text-white">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formValues.districtCode}
                        onChange={handleChangeDistrict}
                        disabled={!selectedProvinceName || isLoadingDistricts}
                        className="h-[56px] w-full appearance-none rounded-[6px] border border-white/14 bg-transparent px-5 pr-12 text-[16px] text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="" className="bg-[#11161d] text-white">
                          {isLoadingDistricts ? "Đang tải quận/huyện..." : "Chọn quận/huyện"}
                        </option>
                        {districtOptions.map((district) => (
                          <option
                            key={district.code}
                            value={district.code}
                            className="bg-[#11161d] text-white"
                          >
                            {district.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-white/40" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[16px] font-medium text-white">
                      Xã/Phường/Thị trấn <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formValues.wardCode}
                        onChange={handleChangeWard}
                        disabled={!formValues.districtCode || isLoadingWards}
                        className="h-[56px] w-full appearance-none rounded-[6px] border border-white/14 bg-transparent px-5 pr-12 text-[16px] text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="" className="bg-[#11161d] text-white">
                          {isLoadingWards ? "Đang tải phường/xã..." : "Chọn xã/phường/thị trấn"}
                        </option>
                        {wardOptions.map((ward) => (
                          <option
                            key={ward.code}
                            value={ward.code}
                            className="bg-[#11161d] text-white"
                          >
                            {ward.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-white/40" />
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[16px] font-medium text-white">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formValues.address}
                      onChange={handleChangeField("address")}
                      placeholder="Ví dụ: Số 18 Ngõ 86 Phú Kiều"
                      className="h-[56px] w-full rounded-[6px] border border-white/14 bg-transparent px-5 text-[16px] text-white placeholder:text-white/45 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[16px] font-medium text-white">
                      Ghi chú đơn hàng (nếu có):
                    </label>
                    <textarea
                      value={formValues.note}
                      onChange={handleChangeField("note")}
                      placeholder="Ghi chú..."
                      className="min-h-[155px] w-full rounded-[6px] border border-white/14 bg-transparent px-5 py-4 text-[16px] text-white placeholder:text-white/45 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <aside className="space-y-6 rounded-[24px] border border-white/8 bg-[#0d1218]/92 px-6 py-7 shadow-[0_22px_60px_rgba(0,0,0,0.34)] lg:px-10">
                <div>
                  <h2 className="text-[18px] font-semibold text-white lg:text-[22px]">
                    Sản phẩm
                  </h2>
                  <div className="mt-6 h-px bg-white/12" />

                  <div className="mt-6 rounded-[10px] border border-white/6 bg-black/10 px-4 py-5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-[16px] font-semibold text-white">
                      <span>Sản phẩm</span>
                      <span>Tạm tính</span>
                    </div>

                    <div className="mt-6 space-y-6 text-[16px] text-white/95">
                      {items.map((item) => {
                        const lineTotal =
                          Number(item?.price || 0) *
                          Number(item?.quantity || 0);

                        return (
                          <div
                            key={item.productId}
                            className="grid grid-cols-[minmax(0,1fr)_auto] gap-4"
                          >
                            <p className="leading-8">
                              {item.name} × {item.quantity}
                            </p>
                            <span className="font-semibold text-[#f6e1bf]">
                              {formatDisplayPrice(lineTotal)} đ
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 space-y-5 border-t border-white/10 pt-6">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-[18px] font-semibold text-white">
                        <span>Tạm tính</span>
                        <span className="text-[#f6e1bf]">
                          {formatDisplayPrice(subtotal)} đ
                        </span>
                      </div>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-[18px] font-semibold text-white">
                        <span>Tổng</span>
                        <span className="text-[#f6e1bf]">
                          {formatDisplayPrice(subtotal)} đ
                        </span>
                      </div>
                    </div>

                    <p className="mt-6 text-right text-[14px] font-semibold text-white/80">
                      Giá trên chưa bao gồm phí vận chuyển
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-[18px] font-semibold text-white lg:text-[22px]">
                    Phương thức thanh toán
                  </h2>
                  <div className="mt-6 h-px bg-white/12" />

                  <div className="mt-6 space-y-5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank")}
                      className="flex w-full items-center gap-4 text-left text-[18px] font-semibold text-white"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/25">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${paymentMethod === "bank" ? "bg-white" : "bg-transparent"}`}
                        />
                      </span>
                      <span>Chuyển khoản ngân hàng</span>
                    </button>

                    {paymentMethod === "bank" ? (
                      <div className="relative rounded-[10px] bg-black/12 px-5 py-6 text-[16px] leading-9 text-white/75">
                        <div className="absolute top-[-12px] left-9 h-0 w-0 border-r-[18px] border-b-[18px] border-l-[18px] border-r-transparent border-b-white/25 border-l-transparent" />
                        Thực hiện thanh toán vào ngay tài khoản ngân hàng của
                        chúng tôi. Vui lòng sử dụng Mã đơn hàng của bạn trong
                        phần Nội dung thanh toán. Đơn hàng sẽ được giao sau khi
                        tiền đã chuyển.
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("momo")}
                      className="flex w-full items-center gap-4 text-left text-[18px] font-semibold text-white"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/25">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${paymentMethod === "momo" ? "bg-white" : "bg-transparent"}`}
                        />
                      </span>
                      <span>Thanh toán MoMo QR</span>
                    </button>

                    {paymentMethod === "momo" ? (
                      <div className="relative rounded-[10px] bg-black/12 px-5 py-6 text-[16px] leading-9 text-white/75">
                        <div className="absolute top-[-12px] left-9 h-0 w-0 border-r-[18px] border-b-[18px] border-l-[18px] border-r-transparent border-b-white/25 border-l-transparent" />
                        Sau khi tạo đơn hàng, hệ thống sẽ chuyển bạn sang màn hình mã QR MoMo thật.
                        Giỏ hàng chỉ được xóa sau khi MoMo xác nhận thanh toán thành công.
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className="flex w-full items-center gap-4 text-left text-[18px] font-semibold text-white"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/25">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${paymentMethod === "cod" ? "bg-white" : "bg-transparent"}`}
                        />
                      </span>
                      <span>Thanh toán khi nhận hàng</span>
                    </button>

                    {paymentMethod === "cod" ? (
                      <div className="relative rounded-[10px] bg-black/12 px-5 py-6 text-[16px] leading-9 text-white/75">
                        <div className="absolute top-[-12px] left-9 h-0 w-0 border-r-[18px] border-b-[18px] border-l-[18px] border-r-transparent border-b-white/25 border-l-transparent" />
                        Bạn sẽ thanh toán trực tiếp cho nhân viên giao hàng khi
                        đơn được giao tới địa chỉ nhận hàng.
                      </div>
                    ) : null}
                  </div>
                </div>

                {paymentMethod === "bank" ? (
                  <div>
                    <h2 className="text-[18px] font-semibold text-white lg:text-[22px]">
                      Thông tin ngân hàng
                    </h2>
                    <div className="mt-6 h-px bg-white/12" />

                    <div className="mt-6 space-y-7 text-white">
                      <div>
                        <p className="text-[18px] text-white/70">
                          Chủ tài khoản
                        </p>
                        <p className="mt-2 text-[20px] font-semibold uppercase">
                          {BANK_ACCOUNT_NAME}
                        </p>
                      </div>

                      <div>
                        <p className="text-[18px] text-white/70">
                          Số tài khoản
                        </p>
                        <p className="mt-2 text-[20px] font-semibold">
                          {BANK_ACCOUNT_NUMBER}
                        </p>
                      </div>

                      <div>
                        <p className="text-[18px] text-white/70">Ngân Hàng</p>
                        <p className="mt-2 text-[20px] font-semibold uppercase">
                          {BANK_NAME}
                        </p>
                      </div>

                      <div>
                        <p className="text-[18px] text-white/70">
                          Nội dung chuyển khoản
                        </p>
                        <p className="mt-2 text-[18px] leading-9 font-semibold text-white">
                          Quý khách chuyển khoản với nội dung: Mã đơn hàng + SĐT
                          (ví dụ: 0123 + 0912345678)
                        </p>
                      </div>

                      <div className="w-fit overflow-hidden rounded-[6px] bg-white p-3">
                        <img
                          src={BANK_QR_IMAGE}
                          alt="Mã QR chuyển khoản ngân hàng"
                          className="h-[230px] w-[230px] object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSubmittingOrder}
                  className="inline-flex min-h-[62px] w-full items-center justify-center rounded-full bg-black px-10 text-[18px] font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingOrder
                    ? paymentMethod === "momo"
                      ? "Đang tạo QR MoMo..."
                      : "Đang đặt hàng..."
                    : paymentMethod === "momo"
                      ? "Tạo mã QR MoMo"
                      : "Đặt hàng"}
                </button>
              </aside>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default PaymentPage;
