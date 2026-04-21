import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  LoaderCircle,
  PencilLine,
  Plus,
  Scissors,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import http from "@/utils/http";
import { formatCurrency } from "@/utils/dashboard";

const ACTIVE_FILTER_OPTIONS = [
  { label: "Tất cả hiển thị", value: "" },
  { label: "Đang bật", value: "true" },
  { label: "Đang ẩn", value: "false" },
];

const INITIAL_FORM_VALUES = {
  name: "",
  category: "",
  price: "",
  description: "",
};

const INITIAL_SUMMARY = {
  totalServices: 0,
  activeServices: 0,
  inactiveServices: 0,
  categoriesCount: 0,
};

const INITIAL_PAGINATION = {
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 1,
};

function ServiceManagerPage() {
  // Đồng bộ bộ lọc của trang dịch vụ với query backend để tìm kiếm và phân trang thật.
  const [filters, setFilters] = useState({
    search: "",
    isActive: "",
    page: 1,
    limit: 8,
  });
  const [services, setServices] = useState([]);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingService, setEditingService] = useState(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [detailService, setDetailService] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState("");
  const [deleteLoadingId, setDeleteLoadingId] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.isActive) {
      params.set("isActive", filters.isActive);
    }

    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));

    return params.toString();
  }, [filters]);

  const fetchServices = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await http.get(`admin/services?${queryString}`);
      setServices(response?.data?.items || []);
      setSummary(response?.data?.summary || INITIAL_SUMMARY);
      setPagination(
        response?.data?.pagination || {
          ...INITIAL_PAGINATION,
          limit: filters.limit,
        }
      );
    } catch (error) {
      setServices([]);
      setSummary(INITIAL_SUMMARY);
      setPagination({
        ...INITIAL_PAGINATION,
        limit: filters.limit,
      });
      setErrorMessage("Không thể tải danh sách dịch vụ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [queryString]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const openCreateForm = () => {
    // Reset form về trạng thái mặc định để tạo dịch vụ mới không bị dính dữ liệu cũ.
    setFormMode("create");
    setEditingService(null);
    setFormValues(INITIAL_FORM_VALUES);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (service) => {
    // Prefill form từ dịch vụ đang chọn để admin chỉnh sửa ngay trong cùng một modal.
    setFormMode("edit");
    setEditingService(service);
    setFormValues({
      name: service?.name || "",
      category: service?.category || "",
      price: service?.price != null ? String(service.price) : "",
      description: service?.description || "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
    setFormErrors({});
    setFormValues(INITIAL_FORM_VALUES);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validateServiceForm = () => {
    const nextErrors = {};
    const normalizedName = formValues.name.trim();
    const normalizedCategory = formValues.category.trim();
    const normalizedPrice = Number(formValues.price);

    // Validate sớm ở frontend để admin nhận phản hồi nhanh trước khi gọi API.
    if (!normalizedName) {
      nextErrors.name = "Tên dịch vụ là bắt buộc";
    }

    if (!normalizedCategory) {
      nextErrors.category = "Danh mục dịch vụ là bắt buộc";
    }

    if (formValues.price === "") {
      nextErrors.price = "Giá dịch vụ là bắt buộc";
    } else if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      nextErrors.price = "Giá dịch vụ phải là số không âm";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildServicePayload = () => {
    return {
      // Chuẩn hóa payload trước khi gửi để backend nhận đúng kiểu dữ liệu mong muốn.
      name: formValues.name.trim(),
      category: formValues.category.trim(),
      price: Number(formValues.price),
      description: formValues.description.trim(),
    };
  };

  const handleSubmitService = async () => {
    if (!validateServiceForm()) {
      return;
    }

    const payload = buildServicePayload();
    setIsSubmittingForm(true);

    try {
      if (formMode === "create") {
        await http.post("admin/services", payload);
      } else {
        await http.patch(`admin/services/${editingService?.id}`, payload);
      }

      await fetchServices();
      closeForm();
      toast.success(
        formMode === "create" ? "Thêm dịch vụ thành công" : "Cập nhật dịch vụ thành công",
        {
          position: "top-right",
        }
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          (formMode === "create" ? "Không thể thêm dịch vụ" : "Không thể cập nhật dịch vụ"),
        {
          position: "top-right",
        }
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleOpenDetail = async (serviceId) => {
    setDetailLoadingId(String(serviceId));

    try {
      const response = await http.get(`admin/services/${serviceId}`);
      setDetailService(response?.data || null);
      setIsDetailOpen(true);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Không thể tải chi tiết dịch vụ", {
        position: "top-right",
      });
    } finally {
      setDetailLoadingId("");
    }
  };

  const handleDeleteService = async (service) => {
    const isConfirmed = window.confirm(`Mày có chắc muốn xóa dịch vụ \"${service.name}\" không?`);
    if (!isConfirmed) {
      return;
    }

    setDeleteLoadingId(String(service.id));

    try {
      await http.del(`admin/services/${service.id}`);
      await fetchServices();
      toast.success("Xóa dịch vụ thành công", {
        position: "top-right",
      });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Không thể xóa dịch vụ", {
        position: "top-right",
      });
    } finally {
      setDeleteLoadingId("");
    }
  };

  return (
    <>
      <div className="admin-card-reveal rounded-2xl border border-[#5a3e1d] bg-[#120d09]/82 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:p-5">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#e3b76a]">
              Service Manager
            </p>
            <h1 className="mt-2 text-2xl font-black text-[#f6e7c7] md:text-3xl">
              Quản lý dịch vụ
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Theo dõi danh sách dịch vụ thật từ hệ thống, tạo mới và cập nhật dịch vụ
              trực tiếp ngay trong trang quản trị.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#6b491f] bg-[#1a120c] px-4 py-3 text-sm text-white/70">
              <Scissors className="h-4 w-4 text-[#e8cf9d]" />
              <span>Đang hiển thị {pagination.total} dịch vụ</span>
            </div>
            <Button type="button" onClick={openCreateForm} className="px-4 py-3">
              <Plus className="h-4 w-4" />
              Thêm dịch vụ
            </Button>
          </div>
        </div>

        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Tổng dịch vụ</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">{summary.totalServices}</p>
            <p className="mt-2 text-xs text-white/45">Số dịch vụ hiện có trong hệ thống.</p>
          </div>
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Dịch vụ đang bật</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">{summary.activeServices}</p>
            <p className="mt-2 text-xs text-white/45">Các dịch vụ đang sẵn sàng hiển thị cho khách.</p>
          </div>
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Danh mục hiện có</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">{summary.categoriesCount}</p>
            <p className="mt-2 text-xs text-white/45">Tổng số nhóm dịch vụ đang được quản lý.</p>
          </div>
        </section>

        <section className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_220px]">
          <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/45">
              <Search className="h-4 w-4" />
              Tìm kiếm dịch vụ
            </span>
            <input
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
              placeholder="Tên dịch vụ, danh mục, mô tả hoặc id"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            />
          </label>

          <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/45">
              Hiển thị
            </span>
            <select
              value={filters.isActive}
              onChange={(event) => handleFilterChange("isActive", event.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              {ACTIVE_FILTER_OPTIONS.map((option) => (
                <option key={option.value || "all-active"} value={option.value} className="bg-[#120d09]">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </p>
        ) : null}

        <section className="mt-4 overflow-hidden rounded-2xl border border-[#5a3e1d] bg-[#100b08]/95">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-[#17100b] text-white/55">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3">Mã DV</th>
                  <th className="px-4 py-3">Tên dịch vụ</th>
                  <th className="px-4 py-3">Danh mục</th>
                  <th className="px-4 py-3">Giá</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Mô tả</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-white/85">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-white/60">
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Đang tải danh sách dịch vụ...
                      </span>
                    </td>
                  </tr>
                ) : services.length > 0 ? (
                  services.map((item) => {
                    const isDeleting = deleteLoadingId === String(item.id);
                    const isLoadingDetail = detailLoadingId === String(item.id);

                    return (
                      <tr key={String(item.id)} className="border-b border-white/5 last:border-b-0">
                        <td className="px-4 py-3 font-semibold text-[#e8cf9d]">#{item.id}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="mt-1 text-xs text-white/40">Cập nhật từ API quản lý dịch vụ</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              item.isActive
                                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                                : "border-white/10 bg-white/5 text-white/65"
                            }`}
                          >
                            {item.isActive ? "Đang bật" : "Đang ẩn"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/65">{item.description || "Chưa có mô tả"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex min-w-max items-center gap-2 whitespace-nowrap">
                            <button
                              type="button"
                              disabled={isLoadingDetail}
                              onClick={() => handleOpenDetail(item.id)}
                              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-white/10 px-3 py-2 text-xs text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {isLoadingDetail ? (
                                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                              Xem chi tiết
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditForm(item)}
                              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-[#6b491f] bg-[#1e150d] px-3 py-2 text-xs font-semibold text-[#f6e7c7] transition hover:bg-[#2a1d11]"
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                              Sửa
                            </button>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDeleteService(item)}
                              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {isDeleting ? (
                                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-white/55">
                      Không có dịch vụ nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/55">
            Trang {pagination.page} / {pagination.totalPages} • Hiển thị {services.length} dịch vụ
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trang trước
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="rounded-lg border border-[#6b491f] bg-[#1e150d] px-4 py-2 text-sm font-semibold text-[#f6e7c7] transition hover:bg-[#2a1d11] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => (!open ? closeForm() : setIsFormOpen(true))}>
        <DialogContent
          className="max-w-3xl border-[#6b491f] bg-[#120d09] p-0 text-white shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
          showCloseButton={false}
        >
          <DialogHeader className="border-b border-white/10 px-5 py-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e3b76a]">
              Service Form
            </p>
            <DialogTitle className="mt-2 text-xl font-black text-[#f6e7c7]">
              {formMode === "create" ? "Thêm dịch vụ" : "Cập nhật dịch vụ"}
            </DialogTitle>
            <DialogDescription className="text-sm text-white/55">
              {formMode === "create"
                ? "Nhập thông tin dịch vụ mới để thêm vào hệ thống."
                : "Cập nhật thông tin dịch vụ đang có trong hệ thống."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 px-5 py-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="service-name">Tên dịch vụ</Label>
              <Input
                id="service-name"
                value={formValues.name}
                onChange={(event) => handleFormChange("name", event.target.value)}
                placeholder="Nhập tên dịch vụ"
              />
              {formErrors.name ? <p className="text-xs text-red-300">{formErrors.name}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-category">Danh mục</Label>
              <Input
                id="service-category"
                value={formValues.category}
                onChange={(event) => handleFormChange("category", event.target.value)}
                placeholder="Ví dụ: Cắt tóc, Combo"
              />
              {formErrors.category ? <p className="text-xs text-red-300">{formErrors.category}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="service-price">Giá</Label>
              <Input
                id="service-price"
                type="number"
                min="0"
                value={formValues.price}
                onChange={(event) => handleFormChange("price", event.target.value)}
                placeholder="Nhập giá dịch vụ"
              />
              {formErrors.price ? <p className="text-xs text-red-300">{formErrors.price}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="service-description">Mô tả</Label>
              <Textarea
                id="service-description"
                value={formValues.description}
                onChange={(event) => handleFormChange("description", event.target.value)}
                placeholder="Nhập mô tả dịch vụ"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 px-5 py-4 sm:justify-end">
            <Button type="button" variant="outline" disabled={isSubmittingForm} onClick={closeForm}>
              Hủy
            </Button>
            <Button type="button" disabled={isSubmittingForm} onClick={handleSubmitService}>
              {isSubmittingForm ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {formMode === "create" ? "Tạo dịch vụ" : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setDetailService(null);
          }
        }}
      >
        <DialogContent
          className="max-w-2xl border-[#6b491f] bg-[#120d09] p-0 text-white shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
          showCloseButton={false}
        >
          <DialogHeader className="border-b border-white/10 px-5 py-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e3b76a]">
              Service Detail
            </p>
            <DialogTitle className="mt-2 text-xl font-black text-[#f6e7c7]">
              {detailService?.name || "Chi tiết dịch vụ"}
            </DialogTitle>
            <DialogDescription className="text-sm text-white/55">
              Thông tin chi tiết của dịch vụ đang được chọn trong hệ thống quản trị.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#100b08]/95 p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">Mã dịch vụ</p>
              <p className="mt-2 text-sm font-semibold text-[#f6e7c7]">
                #{detailService?.id ?? "--"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#100b08]/95 p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">Danh mục</p>
              <p className="mt-2 text-sm font-semibold text-[#f6e7c7]">
                {detailService?.category || "--"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#100b08]/95 p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">Giá</p>
              <p className="mt-2 text-sm font-semibold text-[#f6e7c7]">
                {detailService?.price != null ? formatCurrency(detailService.price) : "--"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#100b08]/95 p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-white/45">Mô tả</p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {detailService?.description || "Dịch vụ này chưa có mô tả."}
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 px-5 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDetailOpen(false);
                setDetailService(null);
              }}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ServiceManagerPage;
