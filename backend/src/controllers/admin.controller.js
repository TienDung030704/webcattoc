const adminService = require("@/services/admin.service");

const getTotalAppointmentsToday = async (req, res) => {
  const data = await adminService.getTotalAppointmentsToday();
  res.success(data);
};

const getNewCustomersToday = async (req, res) => {
  const data = await adminService.getNewCustomersToday();
  res.success(data);
};

const getTodayRevenue = async (req, res) => {
  const data = await adminService.getTodayRevenue();
  res.success(data);
};

const getMostPopularService = async (req, res) => {
  const data = await adminService.getMostPopularService();
  res.success(data);
};

const getTodayAppointmentsList = async (req, res) => {
  const appointments = await adminService.getTodayAppointmentsList();

  // Chuẩn hóa field trả về để frontend admin render trực tiếp bảng lịch hôm nay.
  const data = appointments.map((item) => ({
    id: item.id,
    customerName: item.user?.username || "Khách lẻ",
    serviceName: item.serviceName,
    appointmentTime: item.appointmentAt,
    status: item.status,
  }));

  res.success(data);
};

const getAppointments = async (req, res) => {
  // Forward toàn bộ query filter/pagination xuống service xử lý.
  const data = await adminService.getAppointments(req.query);
  res.success(data);
};

const getUsers = async (req, res) => {
  // Forward toàn bộ query filter/pagination của trang khách hàng xuống service.
  const data = await adminService.getUsers(req.query);
  res.success(data);
};

const getAppointmentById = async (req, res) => {
  try {
    // Parse id sang BigInt trước khi truy vấn chi tiết lịch hẹn.
    const appointmentId = BigInt(req.params.id);
    const data = await adminService.getAppointmentById(appointmentId);

    if (!data) {
      return res.error("Không tìm thấy lịch hẹn", 404);
    }

    res.success(data);
  } catch (error) {
    res.error("Id lịch hẹn không hợp lệ", 400);
  }
};

const createAppointment = async (req, res) => {
  try {
    const data = await adminService.createAppointment(req.body);
    res.success(data, 201);
  } catch (error) {
    // Map lỗi nghiệp vụ sang mã HTTP phù hợp cho form admin.
    const message = error?.message || "Không thể tạo lịch hẹn";
    const status = message === "Không tìm thấy khách hàng" ? 404 : 400;
    res.error(message, status);
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    // Parse id sang BigInt rồi cập nhật trạng thái lịch hẹn.
    const appointmentId = BigInt(req.params.id);
    const data = await adminService.updateAppointmentStatus(
      appointmentId,
      req.body?.status,
    );
    res.success(data);
  } catch (error) {
    // Phân biệt lỗi không tìm thấy với lỗi dữ liệu/trạng thái không hợp lệ.
    const message = error?.message || "Không thể cập nhật trạng thái lịch hẹn";
    const status = message === "Không tìm thấy lịch hẹn" ? 404 : 400;
    res.error(message, status);
  }
};

module.exports = {
  getTotalAppointmentsToday,
  getNewCustomersToday,
  getTodayRevenue,
  getMostPopularService,
  getTodayAppointmentsList,
  getAppointments,
  getUsers,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
};
