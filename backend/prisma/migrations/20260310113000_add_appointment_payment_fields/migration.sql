-- Add manual payment fields for appointment cashier/admin confirmation flow.
ALTER TABLE `appointments`
  ADD COLUMN `paymentMethod` ENUM('BANK_TRANSFER', 'COD') NOT NULL DEFAULT 'COD' AFTER `status`,
  ADD COLUMN `paymentStatus` ENUM('PENDING', 'PAID') NOT NULL DEFAULT 'PENDING' AFTER `paymentMethod`,
  ADD COLUMN `paymentConfirmedAt` DATETIME(3) NULL AFTER `paymentStatus`;

CREATE INDEX `appointments_paymentStatus_idx` ON `appointments`(`paymentStatus`);
CREATE INDEX `appointments_paymentConfirmedAt_idx` ON `appointments`(`paymentConfirmedAt`);
