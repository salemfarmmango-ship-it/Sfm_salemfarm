-- MySQL Schema for Salem Farm Mango (Replacing Supabase)

SET sql_mode = '';

-- 1. Users Table (Replacing Supabase Auth and Profiles)
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) PRIMARY KEY, -- UUID
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255),
  `full_name` VARCHAR(255),
  `avatar_url` VARCHAR(255),
  `role` ENUM('customer', 'admin') DEFAULT 'customer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `image_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `category_id` BIGINT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2),
  `stock` INT DEFAULT 0,
  `images` JSON, -- Arrays in PG become JSON arrays in MySQL
  `size` VARCHAR(255),
  `stock_status` VARCHAR(50) DEFAULT 'In Stock',
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_seasonal` BOOLEAN DEFAULT FALSE,
  `season_over` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
);

-- 4. Coupons Table
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `discount_type` ENUM('percentage', 'fixed') DEFAULT 'percentage',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `max_discount` DECIMAL(10,2),
  `min_order_amount` DECIMAL(10,2),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` CHAR(36),
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  `payment_status` VARCHAR(50) DEFAULT 'unpaid',
  `payment_id` VARCHAR(100),
  `shipping_address` JSON,
  `tracking_id` VARCHAR(100),
  `tracking_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT,
  `product_id` BIGINT,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
);

-- 7. Addresses Table
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` CHAR(36) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `address_line1` TEXT NOT NULL,
  `address_line2` TEXT,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(20) NOT NULL,
  `is_default` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 8. Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT,
  `user_id` CHAR(36),
  `reviewer_name` VARCHAR(255),
  `rating` INT CHECK (rating >= 1 AND rating <= 5),
  `comment` TEXT,
  `is_approved` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- 9. OTP Verifications Table
CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id` CHAR(36) PRIMARY KEY, -- UUID
  `identifier` VARCHAR(255) NOT NULL,
  `type` ENUM('phone', 'email') NOT NULL,
  `code` VARCHAR(10) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `verified` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_identifier ON otp_verifications(identifier, verified, expires_at);

-- 10. Verification Tokens
CREATE TABLE IF NOT EXISTS `verification_tokens` (
  `id` CHAR(36) PRIMARY KEY, -- UUID
  `identifier` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) UNIQUE NOT NULL,
  `purpose` ENUM('signup', 'reset', 'login') NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_token ON verification_tokens(token, used, expires_at);

-- 11. Bulk Enquiries
CREATE TABLE IF NOT EXISTS `bulk_enquiries` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255),
  `phone` VARCHAR(50) NOT NULL,
  `quantity` VARCHAR(100),
  `message` TEXT,
  `status` ENUM('new', 'contacted', 'resolved') DEFAULT 'new',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Corporate Enquiries
CREATE TABLE IF NOT EXISTS `corporate_enquiries` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(255) NOT NULL,
  `contact_person` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255),
  `phone` VARCHAR(50) NOT NULL,
  `requirements` TEXT,
  `status` ENUM('new', 'in-progress', 'completed') DEFAULT 'new',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Offers Table
CREATE TABLE IF NOT EXISTS `offers` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `coupon_code` VARCHAR(50) NOT NULL,
  `image_url` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 14. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Store Settings
CREATE TABLE IF NOT EXISTS `store_settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `announcement_text` TEXT,
  `announcement_active` BOOLEAN DEFAULT FALSE,
  `support_email` VARCHAR(255),
  `support_phone` VARCHAR(50),
  `shipping_base_rate` DECIMAL(10,2) DEFAULT 0.00,
  `free_shipping_threshold` DECIMAL(10,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 16. Hero Slides Table
CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` TEXT,
  `price` VARCHAR(100),
  `cta_link` VARCHAR(255) DEFAULT '/shop',
  `image` VARCHAR(255),
  `bg_image` VARCHAR(255),
  `bg_color` VARCHAR(50) DEFAULT '#F0F4E3',
  `badge` VARCHAR(50),
  `badge_color` VARCHAR(50) DEFAULT '#f59e0b',
  `bg_position_desktop` VARCHAR(100) DEFAULT 'right top',
  `text_width` INT DEFAULT 55,
  `sort_order` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Default Admin User (Password: admin123, hash generated later or can be skipped)
INSERT IGNORE INTO `users` (`id`, `email`, `full_name`, `role`) VALUES 
(UUID(), 'admin@salemfarmmango.com', 'Admin User', 'admin');

-- Insert Default Store Settings
INSERT IGNORE INTO `store_settings` (`id`, `announcement_text`) VALUES 
(1, 'Welcome to Salem Farm Mango!');

-- 17. Notification Tokens Table
CREATE TABLE IF NOT EXISTS `notification_tokens` (
  `token` VARCHAR(255) PRIMARY KEY,
  `user_id` CHAR(36),
  `device_info` JSON,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);
