import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  LoaderCircle,
  Newspaper,
  PencilLine,
  Plus,
  Search,
  SquarePen,
  Trash2,
  X,
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

const PUBLISH_FILTER_OPTIONS = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Đã publish", value: "true" },
  { label: "Bản nháp", value: "false" },
];

const INITIAL_FORM_VALUES = {
  title: "",
  slug: "",
  summary: "",
  thumbnail: "",
  content: "",
  isPublished: false,
};

function createThumbnailPreviewItem({ id, url, source, file = null }) {
  return {
    id,
    url,
    source,
    file,
  };
}
const INITIAL_SUMMARY = {
  totalNews: 0,
  publishedNews: 0,
  draftNews: 0,
};

const INITIAL_PAGINATION = {
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 1,
};
function formatDateTime(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildStatusBadgeClass(isPublished) {
  return isPublished
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    : "border-amber-400/20 bg-amber-500/10 text-amber-100";
}

function AdminNewsManagerPage() {
  // Đồng bộ bộ lọc của trang tin tức với query backend để tìm kiếm, lọc trạng thái và phân trang thật.
  const [filters, setFilters] = useState({
    search: "",
    isPublished: "",
    page: 1,
    limit: 8,
  });
  const [newsItems, setNewsItems] = useState([]);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingNews, setEditingNews] = useState(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [detailNews, setDetailNews] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState("");
  const [deleteLoadingId, setDeleteLoadingId] = useState("");
  const [toggleLoadingId, setToggleLoadingId] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.isPublished) {
      params.set("isPublished", filters.isPublished);
    }

    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));

    return params.toString();
  }, [filters]);

  const fetchNews = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await http.get(`admin/news?${queryString}`);
      setNewsItems(response?.data?.items || []);
      setSummary(response?.data?.summary || INITIAL_SUMMARY);
      setPagination(
        response?.data?.pagination || {
          ...INITIAL_PAGINATION,
          limit: filters.limit,
        },
      );
    } catch (error) {
      setNewsItems([]);
      setSummary(INITIAL_SUMMARY);
      setPagination({
        ...INITIAL_PAGINATION,
        limit: filters.limit,
      });
      setErrorMessage("Không thể tải danh sách bài viết.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
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

  const revokeThumbnailPreview = (previewItem) => {
    if (previewItem?.source === "new" && previewItem?.url) {
      window.URL.revokeObjectURL(previewItem.url);
    }
  };

  const openCreateForm = () => {
    // Reset form về trạng thái mặc định để tạo bài viết mới không bị dính dữ liệu cũ.
    revokeThumbnailPreview(thumbnailPreview);
    setFormMode("create");
    setEditingNews(null);
    setFormValues(INITIAL_FORM_VALUES);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (news) => {
    // Prefill form từ bài viết đang chọn để admin chỉnh sửa ngay trong cùng một modal.
    revokeThumbnailPreview(thumbnailPreview);
    setFormMode("edit");
    setEditingNews(news);
    setFormValues({
      title: news?.title || "",
      slug: news?.slug || "",
      summary: news?.summary || "",
      thumbnail: news?.thumbnail || "",
      content: news?.content || "",
      isPublished: Boolean(news?.isPublished),
    });
    setThumbnailFile(null);
    setThumbnailPreview(
      news?.thumbnail
        ? createThumbnailPreviewItem({
            id: `existing-${news.id}`,
            url: news.thumbnail,
            source: "existing",
          })
        : null,
    );
    setFormErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    revokeThumbnailPreview(thumbnailPreview);
    setIsFormOpen(false);
    setEditingNews(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
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

  const handleThumbnailUrlChange = (value) => {
    revokeThumbnailPreview(thumbnailPreview);
    setThumbnailFile(null);
    setThumbnailPreview(
      value.trim()
        ? createThumbnailPreviewItem({
            id: `url-${Date.now()}`,
            url: value.trim(),
            source: "existing",
          })
        : null,
    );
    handleFormChange("thumbnail", value);
  };

  const handleSelectThumbnail = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    revokeThumbnailPreview(thumbnailPreview);

    const nextPreview = createThumbnailPreviewItem({
      id: `new-${Date.now()}-${selectedFile.name}`,
      url: window.URL.createObjectURL(selectedFile),
      source: "new",
      file: selectedFile,
    });

    // Khi admin chọn file mới thì ưu tiên file upload và clear giá trị URL cũ trong form.
    setThumbnailFile(selectedFile);
    setThumbnailPreview(nextPreview);
    setFormValues((prev) => ({
      ...prev,
      thumbnail: "",
    }));
    setFormErrors((prev) => ({
      ...prev,
      thumbnail: "",
    }));
    event.target.value = "";
  };

  const handleRemoveThumbnail = () => {
    revokeThumbnailPreview(thumbnailPreview);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setFormValues((prev) => ({
      ...prev,
      thumbnail: "",
    }));
  };

  useEffect(() => {
    return () => {
      revokeThumbnailPreview(thumbnailPreview);
    };
    // Chỉ cleanup khi unmount để không revoke nhầm preview đang còn hiển thị trong modal.
  }, [thumbnailPreview]);

  const validateNewsForm = () => {
    const nextErrors = {};

    // Validate sớm ở frontend để admin nhận phản hồi nhanh trước khi gọi API.
    if (!formValues.title.trim()) {
      nextErrors.title = "Tiêu đề bài viết là bắt buộc";
    }

    if (
      formValues.slug.trim() &&
      !/^[a-z0-9-]+$/.test(formValues.slug.trim().toLowerCase())
    ) {
      nextErrors.slug = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang";
    }

    if (!formValues.content.trim()) {
      nextErrors.content = "Nội dung bài viết là bắt buộc";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildNewsPayload = () => {
    const payload = new FormData();

    // Chuẩn hóa payload trước khi gửi để backend nhận đúng kiểu dữ liệu mong muốn.
    payload.append("title", formValues.title.trim());
    payload.append("summary", formValues.summary.trim());
    payload.append("content", formValues.content.trim());
    payload.append("isPublished", String(Boolean(formValues.isPublished)));

    if (formValues.slug.trim()) {
      payload.append("slug", formValues.slug.trim());
    }

    if (thumbnailFile) {
      payload.append("thumbnailFile", thumbnailFile);
    } else {
      payload.append("thumbnail", formValues.thumbnail.trim());
    }

    return payload;
  };

  const handleSubmitNews = async () => {
    if (!validateNewsForm()) {
      return;
    }

    const payload = buildNewsPayload();
    setIsSubmittingForm(true);

    try {
      if (formMode === "create") {
        await http.post("admin/news", payload);
      } else {
        await http.patch(`admin/news/${editingNews?.id}`, payload);
      }

      await fetchNews();
      closeForm();
      toast.success(
        formMode === "create"
          ? "Thêm bài viết thành công"
          : "Cập nhật bài viết thành công",
        {
          position: "top-right",
        },
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          (formMode === "create"
            ? "Không thể thêm bài viết"
            : "Không thể cập nhật bài viết"),
        {
          position: "top-right",
        },
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleOpenDetail = async (newsId) => {
    setDetailLoadingId(String(newsId));

    try {
      const response = await http.get(`admin/news/${newsId}`);
      setDetailNews(response?.data || null);
      setIsDetailOpen(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Không thể tải chi tiết bài viết",
        {
          position: "top-right",
        },
      );
    } finally {
      setDetailLoadingId("");
    }
  };

  const handleDeleteNews = async (news) => {
    const isConfirmed = window.confirm(
      `Mày có chắc muốn xóa bài viết \"${news.title}\" không?`,
    );
    if (!isConfirmed) {
      return;
    }

    setDeleteLoadingId(String(news.id));

    try {
      await http.del(`admin/news/${news.id}`);
      await fetchNews();
      toast.success("Xóa bài viết thành công", {
        position: "top-right",
      });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Không thể xóa bài viết", {
        position: "top-right",
      });
    } finally {
      setDeleteLoadingId("");
    }
  };

  const handleTogglePublish = async (news) => {
    setToggleLoadingId(String(news.id));

    try {
      await http.patch(`admin/news/${news.id}`, {
        isPublished: !news.isPublished,
      });
      await fetchNews();
      toast.success(
        news.isPublished
          ? "Đã chuyển bài viết về bản nháp"
          : "Đã publish bài viết",
        {
          position: "top-right",
        },
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Không thể cập nhật trạng thái bài viết",
        {
          position: "top-right",
        },
      );
    } finally {
      setToggleLoadingId("");
    }
  };

  return (
    <>
      <div className="admin-card-reveal rounded-2xl border border-[#5a3e1d] bg-[#120d09]/82 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:p-5">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[0.25em] text-[#e3b76a] uppercase">
              News Manager
            </p>
            <h1 className="mt-2 text-2xl font-black text-[#f6e7c7] md:text-3xl">
              Quản lý tin tức
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Theo dõi bài viết thật từ hệ thống, tạo bản nháp, publish bài viết
              và cập nhật nội dung trực tiếp ngay trong trang quản trị.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#6b491f] bg-[#1a120c] px-4 py-3 text-sm text-white/70">
              <Newspaper className="h-4 w-4 text-[#e8cf9d]" />
              <span>Đang hiển thị {pagination.total} bài viết</span>
            </div>
            <Button
              type="button"
              onClick={openCreateForm}
              className="px-4 py-3"
            >
              <Plus className="h-4 w-4" />
              Thêm bài viết
            </Button>
          </div>
        </div>

        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Tổng bài viết</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
              {summary.totalNews}
            </p>
            <p className="mt-2 text-xs text-white/45">
              Tổng số bài viết hiện có trong hệ thống.
            </p>
          </div>
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Đã publish</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
              {summary.publishedNews}
            </p>
            <p className="mt-2 text-xs text-white/45">
              Các bài viết đang hiển thị ở trang tin tức public.
            </p>
          </div>
          <div className="rounded-2xl border border-[#6b491f] bg-[#1b130d] p-4">
            <p className="text-sm text-white/50">Bản nháp</p>
            <p className="mt-2 text-3xl font-black text-[#f6e7c7]">
              {summary.draftNews}
            </p>
            <p className="mt-2 text-xs text-white/45">
              Các bài viết chưa publish để admin tiếp tục biên tập.
            </p>
          </div>
        </section>

        <section className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_220px]">
          <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-white/45 uppercase">
              <Search className="h-4 w-4" />
              Tìm kiếm bài viết
            </span>
            <input
              value={filters.search}
              onChange={(event) =>
                handleFilterChange("search", event.target.value)
              }
              placeholder="Tiêu đề, slug, tóm tắt hoặc id"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            />
          </label>

          <label className="rounded-xl border border-white/10 bg-[#100b08]/95 px-3 py-2 text-sm text-white/70">
            <span className="mb-2 block text-xs font-semibold tracking-wide text-white/45 uppercase">
              Trạng thái
            </span>
            <select
              value={filters.isPublished}
              onChange={(event) =>
                handleFilterChange("isPublished", event.target.value)
              }
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              {PUBLISH_FILTER_OPTIONS.map((option) => (
                <option
                  key={option.value || "all-publish"}
                  value={option.value}
                  className="bg-[#120d09]"
                >
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
            <table className="w-full min-w-[1400px] text-left text-sm">
              <thead className="bg-[#17100b] text-white/55">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3">Mã bài viết</th>
                  <th className="px-4 py-3">Tiêu đề</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ảnh đại diện</th>
                  <th className="px-4 py-3">Tóm tắt</th>
                  <th className="px-4 py-3">Cập nhật lần cuối</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-white/85">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-white/60"
                    >
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Đang tải danh sách bài viết...
                      </span>
                    </td>
                  </tr>
                ) : newsItems.length > 0 ? (
                  newsItems.map((item) => {
                    const isDeleting = deleteLoadingId === String(item.id);
                    const isLoadingDetail = detailLoadingId === String(item.id);
                    const isToggling = toggleLoadingId === String(item.id);

                    return (
                      <tr
                        key={String(item.id)}
                        className="border-b border-white/5 last:border-b-0"
                      >
                        <td className="px-4 py-3 font-semibold text-[#e8cf9d]">
                          #{item.id}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-white">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                              Tạo lúc {formatDateTime(item.createdAt)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/70">
                          /{item.slug}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${buildStatusBadgeClass(item.isPublished)}`}
                          >
                            {item.isPublished ? "Đã publish" : "Bản nháp"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="h-14 w-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-20 items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/5 text-[11px] text-white/35">
                              Chưa có ảnh
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/65">
                          <p className="line-clamp-3 max-w-[320px]">
                            {item.summary || "Chưa có tóm tắt bài viết"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-white/65">
                          {formatDateTime(item.updatedAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex min-w-max items-center gap-2 whitespace-nowrap">
                            <button
                              type="button"
                              disabled={isLoadingDetail}
                              onClick={() => handleOpenDetail(item.id)}
                              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs whitespace-nowrap text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
                              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#6b491f] bg-[#1e150d] px-3 py-2 text-xs font-semibold whitespace-nowrap text-[#f6e7c7] transition hover:bg-[#2a1d11]"
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                              Sửa
                            </button>
                            <button
                              type="button"
                              disabled={isToggling}
                              onClick={() => handleTogglePublish(item)}
                              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold whitespace-nowrap text-amber-100 transition hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {isToggling ? (
                                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <SquarePen className="h-3.5 w-3.5" />
                              )}
                              {item.isPublished ? "Chuyển nháp" : "Publish"}
                            </button>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDeleteNews(item)}
                              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold whitespace-nowrap text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
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
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-white/55"
                    >
                      Không có bài viết nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/55">
            Trang {pagination.page} / {pagination.totalPages} • Hiển thị{" "}
            {newsItems.length} bài viết
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

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => (!open ? closeForm() : setIsFormOpen(true))}
      >
        <DialogContent
          className="max-h-[90vh] max-w-4xl overflow-y-auto border-[#6b491f] bg-[#120d09] p-0 text-white shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
          showCloseButton={false}
        >
          <DialogHeader className="border-b border-white/10 px-5 py-4 text-left">
            <p className="text-xs font-semibold tracking-[0.25em] text-[#e3b76a] uppercase">
              News Form
            </p>
            <DialogTitle className="mt-2 text-xl font-black text-[#f6e7c7]">
              {formMode === "create" ? "Thêm bài viết" : "Cập nhật bài viết"}
            </DialogTitle>
            <DialogDescription className="text-sm text-white/55">
              {formMode === "create"
                ? "Nhập thông tin bài viết mới để thêm vào hệ thống."
                : "Cập nhật nội dung bài viết đang có trong hệ thống."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 px-5 py-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="news-title">Tiêu đề</Label>
              <Input
                id="news-title"
                value={formValues.title}
                onChange={(event) =>
                  handleFormChange("title", event.target.value)
                }
                placeholder="Nhập tiêu đề bài viết"
              />
              {formErrors.title ? (
                <p className="text-xs text-red-300">{formErrors.title}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="news-slug">Slug</Label>
              <Input
                id="news-slug"
                value={formValues.slug}
                onChange={(event) =>
                  handleFormChange("slug", event.target.value.toLowerCase())
                }
                placeholder="de-trong-de-backend-tu-sinh-theo-tieu-de"
              />
              {formErrors.slug ? (
                <p className="text-xs text-red-300">{formErrors.slug}</p>
              ) : null}
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#100b08]/95 p-4">
                <div>
                  <Label htmlFor="news-thumbnail-file">Ảnh đại diện</Label>
                  <p className="mt-1 text-xs text-white/45">
                    Có thể upload ảnh trực tiếp hoặc nhập URL ảnh có sẵn.
                  </p>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="space-y-3">
                    <Input
                      id="news-thumbnail-file"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleSelectThumbnail}
                      className="cursor-pointer"
                    />

                    <div className="space-y-2">
                      <Label htmlFor="news-thumbnail">URL ảnh đại diện</Label>
                      <Input
                        id="news-thumbnail"
                        value={formValues.thumbnail}
                        onChange={(event) =>
                          handleThumbnailUrlChange(event.target.value)
                        }
                        placeholder="Nhập URL ảnh đại diện nếu không upload file"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-3">
                    <p className="text-xs font-semibold tracking-wide text-white/45 uppercase">
                      Xem trước ảnh
                    </p>

                    {thumbnailPreview?.url ? (
                      <div className="mt-3 space-y-3">
                        <img
                          src={thumbnailPreview.url}
                          alt="Thumbnail preview"
                          className="h-40 w-full rounded-xl object-cover"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <p className="line-clamp-2 text-xs text-white/55">
                            {thumbnailFile?.name ||
                              formValues.thumbnail ||
                              "Ảnh hiện tại"}
                          </p>
                          <button
                            type="button"
                            onClick={handleRemoveThumbnail}
                            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-400/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/15"
                          >
                            <X className="h-3.5 w-3.5" />
                            Gỡ ảnh
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex h-40 items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#120d09] text-center text-xs text-white/35">
                        Chưa có ảnh đại diện được chọn.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="news-summary">Tóm tắt</Label>
              <Textarea
                id="news-summary"
                value={formValues.summary}
                onChange={(event) =>
                  handleFormChange("summary", event.target.value)
                }
                placeholder="Nhập tóm tắt ngắn cho bài viết"
                rows={4}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="news-content">Nội dung</Label>
              <Textarea
                id="news-content"
                value={formValues.content}
                onChange={(event) =>
                  handleFormChange("content", event.target.value)
                }
                placeholder="Nhập nội dung bài viết"
                rows={12}
              />
              {formErrors.content ? (
                <p className="text-xs text-red-300">{formErrors.content}</p>
              ) : null}
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#100b08]/95 px-4 py-3 md:col-span-2">
              <input
                type="checkbox"
                checked={formValues.isPublished}
                onChange={(event) =>
                  handleFormChange("isPublished", event.target.checked)
                }
                className="h-4 w-4 accent-[#c8a96e]"
              />
              <span className="text-sm text-white/80">
                Publish bài viết ngay sau khi lưu
              </span>
            </label>
          </div>

          <DialogFooter className="border-t border-white/10 px-5 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmittingForm}
              onClick={closeForm}
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={isSubmittingForm}
              onClick={handleSubmitNews}
            >
              {isSubmittingForm ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : null}
              {formMode === "create" ? "Tạo bài viết" : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setDetailNews(null);
          }
        }}
      >
        <DialogContent
          className="max-h-[90vh] max-w-4xl overflow-y-auto border-[#6b491f] bg-[#120d09] p-0 text-white shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
          showCloseButton={false}
        >
          <DialogHeader className="border-b border-white/10 px-5 py-4 text-left">
            <p className="text-xs font-semibold tracking-[0.25em] text-[#e3b76a] uppercase">
              News Detail
            </p>
            <DialogTitle className="mt-2 text-xl font-black text-[#f6e7c7]">
              {detailNews?.title || "Chi tiết bài viết"}
            </DialogTitle>
            <DialogDescription className="text-sm text-white/55">
              Thông tin chi tiết của bài viết đang được chọn trong hệ thống quản
              trị.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#100b08]/95 p-4">
              <p className="text-xs tracking-wide text-white/45 uppercase">
                Mã bài viết
              </p>
              <p className="mt-2 text-sm font-semibold text-[#f6e7c7]">
                #{detailNews?.id ?? "--"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#100b08]/95 p-4">
              <p className="text-xs tracking-wide text-white/45 uppercase">
                Trạng thái
              </p>
              <p className="mt-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${buildStatusBadgeClass(detailNews?.isPublished)}`}
                >
                  {detailNews?.isPublished ? "Đã publish" : "Bản nháp"}
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#100b08]/95 p-4 md:col-span-2">
              <p className="text-xs tracking-wide text-white/45 uppercase">
                Slug
              </p>
              <p className="mt-2 text-sm font-semibold break-all text-[#f6e7c7]">
                /{detailNews?.slug || "--"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#100b08]/95 p-4 md:col-span-2">
              <p className="text-xs tracking-wide text-white/45 uppercase">
                Ảnh đại diện
              </p>
              {detailNews?.thumbnail ? (
                <img
                  src={detailNews.thumbnail}
                  alt={detailNews.title}
                  className="mt-3 h-52 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="mt-3 flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 text-sm text-white/35">
                  Bài viết này chưa có ảnh đại diện
                </div>
              )}
            </div>
            <div className="rounded-xl border border-white/10 bg-[#100b08]/95 p-4 md:col-span-2">
              <p className="text-xs tracking-wide text-white/45 uppercase">
                Tóm tắt
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {detailNews?.summary || "Bài viết này chưa có phần tóm tắt."}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#100b08]/95 p-4 md:col-span-2">
              <p className="text-xs tracking-wide text-white/45 uppercase">
                Nội dung
              </p>
              <div className="mt-2 text-sm leading-7 whitespace-pre-wrap text-white/80">
                {detailNews?.content || "Bài viết này chưa có nội dung."}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#100b08]/95 p-4">
              <p className="text-xs tracking-wide text-white/45 uppercase">
                Ngày tạo
              </p>
              <p className="mt-2 text-sm font-semibold text-[#f6e7c7]">
                {formatDateTime(detailNews?.createdAt)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#100b08]/95 p-4">
              <p className="text-xs tracking-wide text-white/45 uppercase">
                Cập nhật lần cuối
              </p>
              <p className="mt-2 text-sm font-semibold text-[#f6e7c7]">
                {formatDateTime(detailNews?.updatedAt)}
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 px-5 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDetailOpen(false);
                setDetailNews(null);
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

export default AdminNewsManagerPage;
