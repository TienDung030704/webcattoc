const adminServiceService = require("@/services/admin.service.service");

const parseServiceId = (value) => {
  try {
    // Parse id sang BigInt để khớp kiểu id bigint hiện dùng ở backend.
    return BigInt(value);
  } catch {
    throw new Error("Id dịch vụ không hợp lệ");
  }
};

const getServiceErrorStatus = (message) => {
  return message === "Không tìm thấy dịch vụ" ? 404 : 400;
};

const getServices = async (req, res) => {
  const data = await adminServiceService.getServices(req.query);
  res.success(data);
};

const getServiceById = async (req, res) => {
  try {
    const serviceId = parseServiceId(req.params.id);
    const data = await adminServiceService.getServiceByIdOrThrow(serviceId);
    res.success(adminServiceService.mapService(data));
  } catch (error) {
    const message = error?.message || "Không thể lấy chi tiết dịch vụ";
    res.error(message, getServiceErrorStatus(message));
  }
};

const createService = async (req, res) => {
  try {
    const data = await adminServiceService.createService(req.body);
    res.success(data, 201);
  } catch (error) {
    // Chuẩn hóa message/status để frontend dễ xử lý lỗi tạo dịch vụ.
    const message = error?.message || "Không thể tạo dịch vụ";
    res.error(message, getServiceErrorStatus(message));
  }
};

const updateService = async (req, res) => {
  try {
    const serviceId = parseServiceId(req.params.id);
    const data = await adminServiceService.updateService(serviceId, req.body);
    res.success(data);
  } catch (error) {
    // Chuẩn hóa message/status để frontend dễ xử lý lỗi cập nhật dịch vụ.
    const message = error?.message || "Không thể cập nhật dịch vụ";
    res.error(message, getServiceErrorStatus(message));
  }
};

const deleteService = async (req, res) => {
  try {
    const serviceId = parseServiceId(req.params.id);
    const data = await adminServiceService.deleteService(serviceId);
    res.success(data);
  } catch (error) {
    // Chuẩn hóa message/status để frontend dễ xử lý lỗi xóa dịch vụ.
    const message = error?.message || "Không thể xóa dịch vụ";
    res.error(message, getServiceErrorStatus(message));
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
