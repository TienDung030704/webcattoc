const prisma = require("@/libs/prisma");

const BRANCH_SEED_DATA = [
  {
    name: "Quận 1",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    address: "48 Nguyễn Trãi, P. Bến Thành, Quận 1, TP. Hồ Chí Minh",
    sortOrder: 1,
  },
  {
    name: "Quận 3",
    city: "TP. Hồ Chí Minh",
    district: "Quận 3",
    address: "214 Nguyễn Đình Chiểu, P. 6, Quận 3, TP. Hồ Chí Minh",
    sortOrder: 2,
  },
  {
    name: "Quận 5",
    city: "TP. Hồ Chí Minh",
    district: "Quận 5",
    address: "102 Trần Hưng Đạo, P. 7, Quận 5, TP. Hồ Chí Minh",
    sortOrder: 3,
  },
  {
    name: "Quận 7",
    city: "TP. Hồ Chí Minh",
    district: "Quận 7",
    address: "36 Nguyễn Thị Thập, P. Tân Hưng, Quận 7, TP. Hồ Chí Minh",
    sortOrder: 4,
  },
  {
    name: "Quận Bình Thạnh",
    city: "TP. Hồ Chí Minh",
    district: "Quận Bình Thạnh",
    address: "219 Xô Viết Nghệ Tĩnh, P. 17, Quận Bình Thạnh, TP. Hồ Chí Minh",
    sortOrder: 5,
  },
  {
    name: "TP. Thủ Đức",
    city: "TP. Hồ Chí Minh",
    district: "TP. Thủ Đức",
    address: "22 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh",
    sortOrder: 6,
  },
  {
    name: "Quận Ba Đình",
    city: "Hà Nội",
    district: "Quận Ba Đình",
    address: "126 Nguyễn Trường Tộ, Q. Ba Đình, Hà Nội",
    sortOrder: 7,
  },
  {
    name: "Quận Đống Đa",
    city: "Hà Nội",
    district: "Quận Đống Đa",
    address: "58 Tôn Đức Thắng, Q. Đống Đa, Hà Nội",
    sortOrder: 8,
  },
  {
    name: "Quận Cầu Giấy",
    city: "Hà Nội",
    district: "Quận Cầu Giấy",
    address: "102 Trần Thái Tông, Q. Cầu Giấy, Hà Nội",
    sortOrder: 9,
  },
  {
    name: "Quận Hoàn Kiếm",
    city: "Hà Nội",
    district: "Quận Hoàn Kiếm",
    address: "86 Hàng Bông, Q. Hoàn Kiếm, Hà Nội",
    sortOrder: 10,
  },
  {
    name: "Quận Hai Bà Trưng",
    city: "Hà Nội",
    district: "Quận Hai Bà Trưng",
    address: "148 Phố Huế, Q. Hai Bà Trưng, Hà Nội",
    sortOrder: 11,
  },
  {
    name: "Quận Thanh Xuân",
    city: "Hà Nội",
    district: "Quận Thanh Xuân",
    address: "231 Nguyễn Trãi, Q. Thanh Xuân, Hà Nội",
    sortOrder: 12,
  },
];

class BranchService {
  mapBranch(branch) {
    // Chuẩn hóa payload chi nhánh để booking page và stores page dùng chung 1 shape dữ liệu.
    return {
      id: branch.id,
      name: branch.name,
      city: branch.city,
      district: branch.district,
      address: branch.address,
      isActive: branch.isActive,
      sortOrder: branch.sortOrder,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    };
  }

  normalizeBranchId(branchId) {
    if (branchId == null || String(branchId).trim() === "") {
      throw new Error("Chi nhánh không hợp lệ");
    }

    const normalizedBranchId = String(branchId).trim();
    if (!/^\d+$/.test(normalizedBranchId)) {
      throw new Error("Chi nhánh không hợp lệ");
    }

    return BigInt(normalizedBranchId);
  }

  buildBranchWhere(query = {}) {
    const where = {
      isActive: true,
    };
    const city = String(query.city || "").trim();

    if (city) {
      where.city = city;
    }

    return where;
  }

  async ensureDefaultBranches() {
    const totalBranches = await prisma.branch.count();
    if (totalBranches > 0) {
      return;
    }

    // Tự seed danh sách chi nhánh mặc định từ dữ liệu website hiện tại nếu DB chưa có bản ghi nào.
    await prisma.branch.createMany({
      data: BRANCH_SEED_DATA,
    });
  }

  async getBranches(query = {}) {
    await this.ensureDefaultBranches();

    const items = await prisma.branch.findMany({
      where: this.buildBranchWhere(query),
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          id: "asc",
        },
      ],
    });

    return {
      items: items.map((item) => this.mapBranch(item)),
    };
  }

  async getActiveBranchByIdOrThrow(branchId) {
    await this.ensureDefaultBranches();

    const normalizedBranchId = this.normalizeBranchId(branchId);
    const branch = await prisma.branch.findFirst({
      where: {
        id: normalizedBranchId,
        isActive: true,
      },
    });

    if (!branch) {
      throw new Error("Không tìm thấy chi nhánh");
    }

    return branch;
  }
}

module.exports = new BranchService();
