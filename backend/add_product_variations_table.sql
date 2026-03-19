-- ============================================================
-- Variable Products: Product Variations Table
-- Run this SQL in phpMyAdmin to enable variable products.
-- ============================================================
-- Each row represents ONE variation of a product.
-- Variation 1 (the base product) lives in the `products` table.
-- Variation 2, 3, ... live in this table.
-- ============================================================

CREATE TABLE IF NOT EXISTS `product_variations` (
  `id`             BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id`     BIGINT NOT NULL,                            -- Parent product (base / variation 1)
  `variation_label` VARCHAR(100) NOT NULL,                     -- e.g. "3kg", "5kg", "1 Litre" (button text)
  `size`           VARCHAR(100),                               -- Display size/weight e.g. "3 Kg" (shown on card)
  `name`           VARCHAR(255),                               -- Override name (optional, falls back to parent)
  `description`    TEXT,                                       -- Override description
  `price`          DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2),                              -- Strikeout price
  `stock`          INT DEFAULT 0,
  `stock_status`   VARCHAR(50) DEFAULT 'In Stock',
  `images`         JSON,                                       -- Array of image URLs
  `highlights`     JSON,                                       -- Array of highlight bullet strings
  `specifications` JSON,                                       -- Array of {label, value} objects
  `sort_order`     INT DEFAULT 0,                              -- Display order (lower = first)
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Index for fast lookup by parent product
CREATE INDEX IF NOT EXISTS idx_product_variations_product_id ON product_variations(product_id, sort_order);

-- ============================================================
-- If table already exists (from previous run), add size column:
-- ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS `size` VARCHAR(100) AFTER `variation_label`;
-- ============================================================
