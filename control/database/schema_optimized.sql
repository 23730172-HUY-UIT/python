-- =====================================================
-- SQL SCRIPT FOR DATABASE SCHEMA OPTIMIZATION
-- =====================================================

-- Step 1: Add Foreign Key Constraints for Data Integrity
-- -----------------------------------------------------
ALTER TABLE `product` ADD CONSTRAINT `fk_product_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`brand_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `product` ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`categories_id`) REFERENCES `categories`(`categories_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `order_item` ADD CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `order_item` ADD CONSTRAINT `fk_order_item_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `transactions` ADD CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;


-- Step 2: Add Indexes for Query Performance
-- -----------------------------------------
-- Note: Foreign keys automatically create indexes in InnoDB, but we add explicit ones for clarity and for non-FK columns.

CREATE INDEX `idx_product_name` ON `product` (`product_name`);

CREATE INDEX `idx_orders_order_date` ON `orders` (`order_date`);
CREATE INDEX `idx_orders_client_name` ON `orders` (`client_name`);

-- A composite index is often better for junction tables
CREATE INDEX `idx_order_item_order_product` ON `order_item` (`order_id`, `product_id`);

CREATE INDEX `idx_transactions_entity` ON `transactions` (`entity_type`, `entity_id`);


-- Step 3: Optimize Data Types
-- ---------------------------

-- Change integer flags to TINYINT(1) for boolean-like values
ALTER TABLE `brands` MODIFY COLUMN `brand_active` TINYINT(1) NOT NULL DEFAULT 0, MODIFY COLUMN `brand_status` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `categories` MODIFY COLUMN `categories_active` TINYINT(1) NOT NULL DEFAULT 0, MODIFY COLUMN `categories_status` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `product` MODIFY COLUMN `active` TINYINT(1) NOT NULL DEFAULT 0, MODIFY COLUMN `status` TINYINT(1) NOT NULL DEFAULT 0;

-- Use ENUM for columns with a fixed, small set of possible values.
-- The values are inferred from the provided data.sql file and common use cases. Please adjust if incorrect.
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('supervisor', 'manager', 'technician') NOT NULL;
ALTER TABLE `users` MODIFY COLUMN `status` ENUM('Active', 'Inactive') DEFAULT 'Active';

-- For the `orders` table, we infer the meaning of integer values.
-- payment_type: 1=Cash, 2=Card, 3=Bank Transfer
-- payment_status: 1=Paid, 2=Due/Unpaid
-- order_status: 0=Pending/Incomplete, 1=Completed/Delivered
-- It is highly recommended to confirm these mappings with the application logic.
-- ALTER TABLE `orders` MODIFY COLUMN `payment_type` ENUM('Cash', 'Card', 'Bank Transfer');
-- ALTER TABLE `orders` MODIFY COLUMN `payment_status` ENUM('Paid', 'Due');
-- ALTER TABLE `orders` MODIFY COLUMN `order_status` ENUM('Incomplete', 'Completed');


-- Step 4: Recommendations for Redundant Tables
-- --------------------------------------------

-- The `issue` table is marked as legacy. If it is no longer in use by the application,
-- it is recommended to back it up and drop it to simplify the schema.
-- Example: DROP TABLE `issue`;

-- The `onHandItems` table appears to duplicate data from the `product` table (name, image).
-- It is recommended to refactor this table to only store a `product_id` and quantity-related fields
-- to avoid data inconsistency. This would require changes in the application code.
-- Example Alteration:
-- ALTER TABLE `onHandItems` ADD COLUMN `product_id` INT NOT NULL;
-- -- (Then, populate product_id and drop redundant columns)
-- -- ALTER TABLE `onHandItems` ADD CONSTRAINT `fk_onhand_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`);
-- -- ALTER TABLE `onHandItems` DROP COLUMN `name`, DROP COLUMN `image`, DROP COLUMN `model`;


-- =====================================================
-- END OF SCRIPT
-- =====================================================
