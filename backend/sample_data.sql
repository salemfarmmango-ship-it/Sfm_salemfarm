-- sample_data.sql
-- Run this script to populate the SFM database with test data.
-- WARNING: This will NOT delete existing data, but it will add new rows.

USE sfm;

-- 1. Insert Categories
INSERT IGNORE INTO `categories` (`id`, `name`, `slug`, `image_url`) VALUES
(101, 'Premium Mangoes', 'premium-mangoes', 'https://example.com/alphonso.jpg'),
(102, 'Organic Mangoes', 'organic-mangoes', 'https://example.com/banganapalli.jpg'),
(103, 'Gift Boxes', 'gift-boxes', 'https://example.com/gift-box.jpg');

-- 2. Insert Products
INSERT IGNORE INTO `products` (`id`, `category_id`, `name`, `description`, `price`, `original_price`, `stock`, `images`, `size`, `is_featured`, `season_over`) VALUES
(201, 101, 'Alphonso Mango', 'The King of Mangoes, known for its rich taste.', 1200.00, 1500.00, 50, '["https://example.com/img1.jpg", "https://example.com/img2.jpg"]', '1 Dozen', 1, 0),
(202, 101, 'Salem Malgoa', 'Famous Salem Malgoa, exceptionally sweet.', 850.00, 1000.00, 100, '["https://example.com/img3.jpg"]', '1 kg', 1, 0),
(203, 102, 'Imam Pasand', 'The King of Taste, large and juicy.', 1400.00, null, 25, '[]', '1 kg', 0, 1),
(204, 103, 'Corporate Gift Box', 'Assorted premium mangoes in a wooden box.', 2500.00, 2800.00, 10, '[]', '5 kg box', 1, 0);

-- 3. Insert Users (Customers)
INSERT IGNORE INTO `users` (`id`, `email`, `full_name`, `role`) VALUES
('uuid-customer-1', 'john.doe@example.com', 'John Doe', 'customer'),
('uuid-customer-2', 'jane.smith@example.com', 'Jane Smith', 'customer');

-- 4. Insert Addresses for Customers
INSERT IGNORE INTO `addresses` (`id`, `user_id`, `full_name`, `phone`, `address_line1`, `city`, `state`, `postal_code`, `is_default`) VALUES
(301, 'uuid-customer-1', 'John Doe', '9876543210', '123 Main Street', 'Chennai', 'Tamil Nadu', '600001', 1),
(302, 'uuid-customer-2', 'Jane Smith', '9876543211', '456 MG Road', 'Bangalore', 'Karnataka', '560001', 1);

-- 5. Insert Orders
INSERT IGNORE INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `payment_status`, `shipping_address`, `tracking_id`, `courier_partner`, `is_delhivery_automated`) VALUES
(401, 'uuid-customer-1', 1200.00, 'pending', 'unpaid', '{"full_name":"John Doe","phone":"9876543210","address_line1":"123 Main Street","city":"Chennai","state":"Tamil Nadu","postal_code":"600001"}', null, null, 0),
(402, 'uuid-customer-2', 2500.00, 'processing', 'paid', '{"full_name":"Jane Smith","phone":"9876543211","address_line1":"456 MG Road","city":"Bangalore","state":"Karnataka","postal_code":"560001"}', null, null, 0),
(403, 'uuid-customer-1', 850.00, 'shipped', 'paid', '{"full_name":"John Doe","phone":"9876543210","address_line1":"123 Main Street","city":"Chennai","state":"Tamil Nadu","postal_code":"600001"}', 'AWB123456789', 'Delhivery', 1);

-- 6. Insert Order Items
INSERT IGNORE INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(501, 401, 201, 1, 1200.00),
(502, 402, 204, 1, 2500.00),
(503, 403, 202, 1, 850.00);

-- 7. Insert Coupons
INSERT IGNORE INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `is_active`) VALUES
(601, 'SUMMER20', 'percentage', 20.00, 1),
(602, 'WELCOME500', 'fixed', 500.00, 1),
(603, 'EXPIRED10', 'percentage', 10.00, 0);

-- 8. Insert Reviews
INSERT IGNORE INTO `reviews` (`id`, `product_id`, `user_id`, `reviewer_name`, `rating`, `comment`, `is_approved`) VALUES
(701, 201, 'uuid-customer-1', 'John Doe', 5, 'The best Alphonso I have ever tasted!', 1),
(702, 202, 'uuid-customer-2', 'Jane Smith', 4, 'Very sweet, perfectly ripe when delivered.', 1),
(703, 201, null, 'Anonymous Guest', 2, 'Arrived slightly damaged.', 0);

-- 9. Insert Enquiries (Bulk & Corporate)
INSERT IGNORE INTO `bulk_enquiries` (`id`, `name`, `phone`, `quantity`, `message`, `status`) VALUES
(801, 'Ramesh Trader', '9876500001', '1000 kg', 'Looking for wholesale Alphonso rates.', 'new'),
(802, 'Suresh Organics', '9876500002', '500 kg', 'Need organic banganapalli.', 'contacted');

INSERT IGNORE INTO `corporate_enquiries` (`id`, `company_name`, `contact_person`, `phone`, `requirements`, `status`) VALUES
(901, 'Tech Solutions Ltd', 'Ankit Sharma', '9876500003', 'Need 200 gift boxes for employees.', 'in-progress');

-- 10. Insert Newsletter Subscribers
INSERT IGNORE INTO `newsletter_subscribers` (`id`, `email`) VALUES
(1001, 'subscriber1@example.com'),
(1002, 'deals_hunter@example.com');
