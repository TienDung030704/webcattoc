-- AlterTable
ALTER TABLE `appointments` MODIFY `paymentMethod` ENUM('BANK_TRANSFER', 'COD', 'MOMO') NOT NULL DEFAULT 'COD',
    MODIFY `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `paymentExpiresAt` DATETIME(3) NULL,
    MODIFY `paymentMethod` ENUM('BANK_TRANSFER', 'COD', 'MOMO') NOT NULL,
    MODIFY `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `payment_transactions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `orderId` BIGINT NOT NULL,
    `provider` ENUM('BANK_TRANSFER', 'COD', 'MOMO') NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `providerOrderId` VARCHAR(191) NOT NULL,
    `transId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `resultCode` INTEGER NULL,
    `message` VARCHAR(191) NULL,
    `payUrl` TEXT NULL,
    `deeplink` TEXT NULL,
    `qrCodeUrl` TEXT NULL,
    `expiresAt` DATETIME(3) NULL,
    `confirmedAt` DATETIME(3) NULL,
    `rawCreateResponse` JSON NULL,
    `rawIpnPayload` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_transactions_requestId_key`(`requestId`),
    INDEX `payment_transactions_orderId_idx`(`orderId`),
    INDEX `payment_transactions_provider_idx`(`provider`),
    INDEX `payment_transactions_providerOrderId_idx`(`providerOrderId`),
    INDEX `payment_transactions_status_idx`(`status`),
    INDEX `payment_transactions_transId_idx`(`transId`),
    INDEX `payment_transactions_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `orders_paymentExpiresAt_idx` ON `orders`(`paymentExpiresAt`);

-- AddForeignKey
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
