-- CreateTable
CREATE TABLE `branches` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `branches_city_idx`(`city`),
    INDEX `branches_district_idx`(`district`),
    INDEX `branches_isActive_idx`(`isActive`),
    INDEX `branches_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- SeedData
INSERT INTO `branches` (`name`, `city`, `district`, `address`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`) VALUES
    ('Quận 1', 'TP. Hồ Chí Minh', 'Quận 1', '48 Nguyễn Trãi, P. Bến Thành, Quận 1, TP. Hồ Chí Minh', true, 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Quận 3', 'TP. Hồ Chí Minh', 'Quận 3', '214 Nguyễn Đình Chiểu, P. 6, Quận 3, TP. Hồ Chí Minh', true, 2, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Quận 5', 'TP. Hồ Chí Minh', 'Quận 5', '102 Trần Hưng Đạo, P. 7, Quận 5, TP. Hồ Chí Minh', true, 3, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Quận 7', 'TP. Hồ Chí Minh', 'Quận 7', '36 Nguyễn Thị Thập, P. Tân Hưng, Quận 7, TP. Hồ Chí Minh', true, 4, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Quận Bình Thạnh', 'TP. Hồ Chí Minh', 'Quận Bình Thạnh', '219 Xô Viết Nghệ Tĩnh, P. 17, Quận Bình Thạnh, TP. Hồ Chí Minh', true, 5, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('TP. Thủ Đức', 'TP. Hồ Chí Minh', 'TP. Thủ Đức', '22 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh', true, 6, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Quận Ba Đình', 'Hà Nội', 'Quận Ba Đình', '126 Nguyễn Trường Tộ, Q. Ba Đình, Hà Nội', true, 7, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Quận Đống Đa', 'Hà Nội', 'Quận Đống Đa', '58 Tôn Đức Thắng, Q. Đống Đa, Hà Nội', true, 8, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Quận Cầu Giấy', 'Hà Nội', 'Quận Cầu Giấy', '102 Trần Thái Tông, Q. Cầu Giấy, Hà Nội', true, 9, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Quận Hoàn Kiếm', 'Hà Nội', 'Quận Hoàn Kiếm', '86 Hàng Bông, Q. Hoàn Kiếm, Hà Nội', true, 10, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Quận Hai Bà Trưng', 'Hà Nội', 'Quận Hai Bà Trưng', '148 Phố Huế, Q. Hai Bà Trưng, Hà Nội', true, 11, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Quận Thanh Xuân', 'Hà Nội', 'Quận Thanh Xuân', '231 Nguyễn Trãi, Q. Thanh Xuân, Hà Nội', true, 12, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

-- AlterTable
ALTER TABLE `appointments`
    ADD COLUMN `branchId` BIGINT NULL;

-- Backfill legacy appointments
UPDATE `appointments`
SET `branchId` = (
    SELECT `id`
    FROM `branches`
    WHERE `sortOrder` = 1
    LIMIT 1
)
WHERE `branchId` IS NULL;

-- AlterColumn
ALTER TABLE `appointments`
    MODIFY `branchId` BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX `appointments_branchId_idx` ON `appointments`(`branchId`);

-- AddForeignKey
ALTER TABLE `appointments`
    ADD CONSTRAINT `appointments_branchId_fkey`
    FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
