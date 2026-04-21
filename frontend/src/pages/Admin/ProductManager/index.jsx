import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, LoaderCircle, Package2, PencilLine, Plus, Search, X } from "lucide-react";
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

const STOCK_FILTER_OPTIONS = [
  { label: "Tất cả tồn kho", value: "" },
  { label: "Còn hàng", value: "IN_STOCK" },
  { label: "Sắp hết", value: "LOW_STOCK" },
  { label: "Hết hàng", value: "OUT_OF_STOCK" },
];

const ACTIVE_FILTER_OPTIONS = [
  { label: "Tất cả hiển thị", value: "" },
  { label: "Đang bật", value: "true" },
  { label: "Đang tắt", value: "false" },
];

const INITIAL_FORM_VALUES = {
  name: "",
  description: "",
  price: "",
  stock: "",
};

function normalizeMoneyInput(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function createPreviewItem({ id, url, source, file = null }) {
  return {
    id,
    url,
    source,
    file,
  };
}

function mapStockStatus(stockStatus) {
  if (stockStatus === "OUT_OF_STOCK") {
    return {
      label: "Hết hàng",
      className: "border-red-400/30 bg-red-500/10 text-red-200",
    };
  }

  if (stockStatus === "LOW_STOCK") {
    return {
      label: "Sắp hết",
      className: "border-[#7d5a20] bg-[#3a2914] text-[#f5d18f]",
    };
  }

  return {
    label: "Còn hàng",
    className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
  };
}

function ProductManagerPage() {
  // Đồng bộ bộ lọc của trang sản phẩm với query backend để phân trang và tìm kiếm thật.
  const [filters, setFilters] = useState({
    search: "",
    stockStatus: "",
    isActive: "",
    page: 1,
    limit: 8,
  });
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });
  const [stockInputs, setStockInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [visibilityUpdatingId, setVisibilityUpdatingId] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.stockStatus) {
      params.set("stockStatus", filters.stockStatus);
    }

    if (filters.isActive) {
      params.set("isActive", filters.isActive);
    }

    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));

    return params.toString();
  }, [filters]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await http.get(`admin.product?${queryString}`);
      const items = response?.data?.items || [];

      setProducts(items);
      setSummary(
        response?.data?.summary || {
          totalProducts: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0,
        }
      );
      setPagination(
        response?.data?.pagination || {
          page: 1,
          limit: filters.limit,
          total: 0,
          totalPages: 1,
        }
      );
      // Lưu giá trị stock theo từng dòng để admin sửa trực tiếp trước khi gửi cập nhật.
      setStockInputs(
        Object.fromEntries(items.map((item) => [String(item.id), String(item.stock)]))
      );
    } catch (error) {
      setProducts([]);
      setSummary({
        totalProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
      });
      setPagination({
        page: 1,
        limit: filters.limit,
        total: 0,
        totalPages: 1,
      });
      setErrorMessage("Không thể tải danh sách sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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

  const handleStockInputChange = (productId, value) => {
    setStockInputs((prev) => ({
      ...prev,
      [String(productId)]: value,
    }));
  };

  const openCreateForm = () => {
    // Reset form về trạng thái mặc định để tạo sản phẩm mới không bị dính dữ liệu cũ.
    setFormMode("create");
    setEditingProduct(null);
    setFormValues(INITIAL_FORM_VALUES);
    setExistingImageUrls([]);
    setNewImageFiles([]);
    setImagePreviews([]);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (product) => {
    const nextExistingImageUrls = Array.isArray(product?.imageUrls)
      ? product.imageUrls.filter(Boolean)
      : product?.imageUrl
        ? [product.imageUrl]
        : [];

    // Prefill form từ sản phẩm đang chọn để admin sửa trực tiếp trong cùng 1 modal.
    setFormMode("edit");
    setEditingProduct(product);
    setFormValues({
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price != null ? String(product.price) : "",
      stock: product?.stock != null ? String(product.stock) : "",
    });
    setExistingImageUrls(nextExistingImageUrls);
    setNewImageFiles([]);
    setImagePreviews(
      nextExistingImageUrls.map((imageUrl, index) =>
        createPreviewItem({
          id: `existing-${product?.id || "product"}-${index}`,
          url: imageUrl,
          source: "existing",
        })
      )
    );
    setFormErrors({});
    setIsFormOpen(true);
  };

  const revokeNewImagePreviewUrls = (previewItems = []) => {
    previewItems.forEach((item) => {
      if (item?.source === "new" && item?.url) {
        window.URL.revokeObjectURL(item.url);
      }
    });
  };

  const closeForm = () => {
    revokeNewImagePreviewUrls(imagePreviews);
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormErrors({});
    setFormValues(INITIAL_FORM_VALUES);
    setExistingImageUrls([]);
    setNewImageFiles([]);
    setImagePreviews([]);
  };

  const handleFormChange = (field, value) => {
    const nextValue = field === "price" ? normalizeMoneyInput(value) : value;

    setFormValues((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleSelectImages = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) {
      return;
    }

    const totalImages = existingImageUrls.length + newImageFiles.length + selectedFiles.length;
    if (totalImages > 6) {
      toast.error("Tối đa 6 ảnh cho mỗi sản phẩm", {
        position: "top-right",
      });
      event.target.value = "";
      return;
    }

    const nextPreviewItems = selectedFiles.map((file, index) =>
      createPreviewItem({
        id: `new-${Date.now()}-${index}-${file.name}`,
        url: window.URL.createObjectURL(file),
        source: "new",
        file,
      })
    );

    setNewImageFiles((prev) => [...prev, ...selectedFiles]);
    setImagePreviews((prev) => [...prev, ...nextPreviewItems]);
    setFormErrors((prev) => ({
      ...prev,
      images: "",
    }));
    event.target.value = "";
  };

  const handleRemoveImage = (previewItem) => {
    setImagePreviews((prev) => prev.filter((item) => item.id !== previewItem.id));

    if (previewItem.source === "existing") {
      setExistingImageUrls((prev) => prev.filter((imageUrl) => imageUrl !== previewItem.url));
      return;
    }

    if (previewItem.url) {
      window.URL.revokeObjectURL(previewItem.url);
    }

    setNewImageFiles((prev) => {
      const nextFiles = [...prev];
      const fileIndex = nextFiles.findIndex((file) => file === previewItem.file);
      if (fileIndex !== -1) {
        nextFiles.splice(fileIndex, 1);
      }
      return nextFiles;
    });
  };

  const validateProductForm = () => {
    const nextErrors = {};
    const normalizedName = formValues.name.trim();
    const normalizedPrice = Number(formValues.price);
    const normalizedStock = Number(formValues.stock);
    const totalImages = existingImageUrls.length + newImageFiles.length;

    // Validate sớm ở frontend để admin nhận phản hồi nhanh trước khi gọi API.
    if (!normalizedName) {
      nextErrors.name = "Tên sản phẩm là bắt buộc";
    }

    if (formValues.price === "") {
      nextErrors.price = "Giá sản phẩm là bắt buộc";
    } else if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      nextErrors.price = "Giá sản phẩm phải là số không âm";
    }

    if (formValues.stock === "") {
      nextErrors.stock = "Tồn kho sản phẩm là bắt buộc";
    } else if (!Number.isInteger(normalizedStock) || normalizedStock < 0) {
      nextErrors.stock = "Tồn kho phải là số nguyên không âm";
    }

    if (totalImages > 6) {
      nextErrors.images = "Tối đa 6 ảnh cho mỗi sản phẩm";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildProductPayload = () => {
    const payload = new FormData();

    // Chuẩn hóa payload trước khi gửi để backend nhận đúng kiểu dữ liệu mong muốn.
    payload.append("name", formValues.name.trim());
    payload.append("description", formValues.description.trim());
    payload.append("price", String(Number(formValues.price)));
    payload.append("stock", String(Number(formValues.stock)));
    payload.append("existingImageUrls", JSON.stringify(existingImageUrls));

    newImageFiles.forEach((file) => {
      payload.append("images", file);
    });

    return payload;
  };

  const handleSubmitProduct = async () => {
    if (!validateProductForm()) {
      return;
    }

    const payload = buildProductPayload();
    setIsSubmittingForm(true);

    try {
      if (formMode === "create") {
        await http.post("admin.product", payload);
      } else {
        await http.patch(`admin.product/${editingProduct?.id}`, payload);
      }

      // Refetch lại danh sách để đồng bộ table, summary và stock input theo dữ liệu mới nhất.
      await fetchProducts();
      closeForm();
      toast.success(
        formMode === "create" ? "Thêm sản phẩm thành công" : "Cập nhật sản phẩm thành công",
        {
          position: "top-right",
        }
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          (formMode === "create" ? "Không thể thêm sản phẩm" : "Không thể cập nhật sản phẩm"),
        {
          position: "top-right",
        }
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  useEffect(() => {
    return () => {
      revokeNewImagePreviewUrls(imagePreviews);
    };
    // Chỉ cleanup khi unmount để không revoke nhầm preview đang còn hiển thị sau mỗi lần state đổi.
  }, []);

  const handleToggleVisibility = async (product) => {
    const productId = String(product.id);
    setVisibilityUpdatingId(productId);

    try {
      // Gọi API ẩn/hiện riêng để thay đổi đúng field isActive theo backend contract mới.
      await http.patch(`admin.product/${product.id}/visibility`, {
        isActive: !product.isActive,
      });
      await fetchProducts();
      toast.success(product.isActive ? "Ẩn sản phẩm thành công" : "Hiện sản phẩm thành công", {
        position: "top-right",
      });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Không thể cập nhật trạng thái hiển thị", {
        position: "top-right",
      });
    } finally {
      setVisibilityUpdatingId("");
    }
  };

  const handleUpdateStock = async (productId) => {
    const nextStock = Number(stockInputs[String(productId)]);

    if (!Number.isInteger(nextStock) || nextStock < 0) {
      toast.error("Stock phải là số nguyên không âm", {
        position: "top-right",
      });
      return;
    }

    setUpdatingId(String(productId));
    try {
      await http.patch(`admin.product/${productId}/stock`, {
        stock: nextStock,
      });
      await fetchProducts();
      toast.success("Cập nhật tồn kho thành công", {
        position: "top-right",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Không thể cập nhật tồn kho sản phẩm",
        {
          position: "top-right",
        }
      );
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <>
      <div className="admin-card-reveal min-w-0 rounded-2xl border border-[#5a3e1d] bg-[#120d09]/82 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:p-5">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#e3b76a]">
              Product Manager
            </p>
            <h1 className="mt-2 text-2xl font-black text-[#f6e7c7] md:text-3xl">
              Quản lý sản phẩm
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Theo dõi danh sách sản phẩm thật từ hệ thống, lọc nhanh theo tồn kho và
              cập nhật số lượng ngay trong trang quản trị.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#6b491f] bg-[#1a120c] px-4 py-3 text-sm text-white/70">
              <Package2 className="h-4 w-4 text-[#e8cf9d]" />
              <span>Đang hiển thị {pagination.total} sản phẩm</span>
            </div>
            <Button type="button" onClick={openCreateForm} className="px-4 py-3">
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Button>
          </div>
        </div>

        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Tổng sản phẩm</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">{summary.totalProducts}</p>
            <p className="mt-2 text-xs text-white/45">Số sản phẩm đang có trong hệ thống.</p>
          </div>
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Sản phẩm sắp hết</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">{summary.lowStockProducts}</p>
            <p className="mt-2 text-xs text-white/45">Ưu tiên nhập thêm để tránh hết hàng.</p>
          </div>
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Sản phẩm hết hàng</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">{summary.outOfStockProducts}</p>
            <p className="mt-2 text-xs text-white/45">Các sản phẩm cần cập nhật kho ngay.</p>
          </div>
        </section>

        <section className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_220px_220px]">
          <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/45">
              <Search className="h-4 w-4" />
              Tìm kiếm sản phẩm
            </span>
            <input
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
              placeholder="Tên sản phẩm, mô tả hoặc id"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            />
          </label>

          <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/45">
              Trạng thái kho
            </span>
            <select
              value={filters.stockStatus}
              onChange={(event) => handleFilterChange("stockStatus", event.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              {STOCK_FILTER_OPTIONS.map((option) => (
                <option key={option.value || "all-stock"} value={option.value} className="bg-[#120d09]">
                  {option.label}
                </option>
              ))}
            </select>
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

        <section className="mt-4 min-w-0 overflow-hidden rounded-2xl border border-[#5a3e1d] bg-[#100b08]/95">
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-[#17100b] text-white/55">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3">Mã SP</th>
                  <th className="px-4 py-3">Tên sản phẩm</th>
                  <th className="px-4 py-3">Mô tả</th>
                  <th className="px-4 py-3">Giá</th>
                  <th className="px-4 py-3">Tồn kho</th>
                  <th className="px-4 py-3">Trạng thái kho</th>
                  <th className="px-4 py-3">Hiển thị</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-white/85">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-white/60">
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Đang tải danh sách sản phẩm...
                      </span>
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((item) => {
                    const stockStatus = mapStockStatus(item.stockStatus);
                    const isUpdating = updatingId === String(item.id);
                    const isVisibilityUpdating = visibilityUpdatingId === String(item.id);

                    return (
                      <tr key={String(item.id)} className="border-b border-white/5 last:border-b-0">
                        <td className="px-4 py-3 font-semibold text-[#e8cf9d]">#{item.id}</td>
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3 text-white/65">
                          {item.description || "Chưa có mô tả"}
                        </td>
                        <td className="px-4 py-3">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-3">{item.stock}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${stockStatus.className}`}
                          >
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              item.isActive
                                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                                : "border-white/10 bg-white/5 text-white/65"
                            }`}
                          >
                            {item.isActive ? "Đang bật" : "Đang tắt"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex w-full min-w-[260px] flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(item)}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                              >
                                <PencilLine className="h-3.5 w-3.5" />
                                Sửa
                              </button>
                              <button
                                type="button"
                                disabled={isVisibilityUpdating}
                                onClick={() => handleToggleVisibility(item)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#6b491f] bg-[#1e150d] px-3 py-2 text-xs font-semibold text-[#f6e7c7] transition hover:bg-[#2a1d11] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {isVisibilityUpdating ? (
                                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                ) : item.isActive ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                                {item.isActive ? "Ẩn" : "Hiện"}
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={stockInputs[String(item.id)] ?? String(item.stock)}
                                onChange={(event) =>
                                  handleStockInputChange(item.id, event.target.value)
                                }
                                className="w-24 rounded-lg border border-white/10 bg-[#17100b] px-3 py-2 text-sm text-white outline-none"
                              />
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStock(item.id)}
                                className="rounded-lg bg-[#2a1d11] px-3 py-2 text-xs font-semibold text-[#f6e7c7] transition hover:bg-[#3a2918] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {isUpdating ? "Đang lưu..." : "Lưu kho"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-white/55">
                      Không có sản phẩm nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/55">
            Trang {pagination.page} / {pagination.totalPages} • Hiển thị {products.length} sản phẩm
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
              Product Form
            </p>
            <DialogTitle className="mt-2 text-xl font-black text-[#f6e7c7]">
              {formMode === "create" ? "Thêm sản phẩm" : "Cập nhật sản phẩm"}
            </DialogTitle>
            <DialogDescription className="text-sm text-white/55">
              {formMode === "create"
                ? "Nhập thông tin sản phẩm mới để thêm vào hệ thống."
                : "Cập nhật thông tin sản phẩm đang có trong hệ thống."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 px-5 py-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-name">Tên sản phẩm</Label>
              <Input
                id="product-name"
                value={formValues.name}
                onChange={(event) => handleFormChange("name", event.target.value)}
                placeholder="Nhập tên sản phẩm"
              />
              {formErrors.name ? <p className="text-xs text-red-300">{formErrors.name}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-description">Mô tả</Label>
              <Textarea
                id="product-description"
                value={formValues.description}
                onChange={(event) => handleFormChange("description", event.target.value)}
                placeholder="Nhập mô tả sản phẩm"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-price">Giá</Label>
              <Input
                id="product-price"
                type="text"
                inputMode="numeric"
                value={formValues.price}
                onChange={(event) => handleFormChange("price", event.target.value)}
                placeholder="Nhập giá sản phẩm"
              />
              {formErrors.price ? <p className="text-xs text-red-300">{formErrors.price}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-stock">Tồn kho</Label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                value={formValues.stock}
                onChange={(event) => handleFormChange("stock", event.target.value)}
                placeholder="Nhập tồn kho"
              />
              {formErrors.stock ? <p className="text-xs text-red-300">{formErrors.stock}</p> : null}
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="product-images">Ảnh sản phẩm</Label>
                  <p className="mt-1 text-xs text-white/45">
                    Chọn tối đa 6 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện của sản phẩm.
                  </p>
                </div>
                <Input
                  id="product-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSelectImages}
                  className="h-auto cursor-pointer py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[#2b1d10] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#f6e7c7]"
                />
              </div>

              {imagePreviews.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={preview.id}
                      className="overflow-hidden rounded-xl border border-white/10 bg-[#100b08]/95"
                    >
                      <div className="relative aspect-[4/3] bg-[#17100b]">
                        <img
                          src={preview.url}
                          alt={`Product preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(preview)}
                          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-black/55 text-white transition hover:bg-black/75"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-white/60">
                        <span>{index === 0 ? "Ảnh đại diện" : `Ảnh ${index + 1}`}</span>
                        <span>{preview.source === "existing" ? "Đã có" : "Mới"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-[#100b08]/70 px-4 py-6 text-sm text-white/45">
                  Chưa có ảnh nào được chọn.
                </div>
              )}

              {formErrors.images ? <p className="text-xs text-red-300">{formErrors.images}</p> : null}
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 px-5 py-4 sm:justify-end">
            <Button type="button" variant="outline" disabled={isSubmittingForm} onClick={closeForm}>
              Hủy
            </Button>
            <Button type="button" disabled={isSubmittingForm} onClick={handleSubmitProduct}>
              {isSubmittingForm ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {formMode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProductManagerPage;
