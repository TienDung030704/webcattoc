-- Add manual payment confirmation timestamp for orders so revenue can include paid orders.
ALTER TABLE `orders`
  ADD COLUMN `paymentConfirmedAt` DATETIME(3) NULL AFTER `paymentStatus`;

CREATE INDEX `orders_paymentConfirmedAt_idx` ON `orders`(`paymentConfirmedAt`);
