USE sfm;

ALTER TABLE products 
ADD COLUMN variations JSON DEFAULT NULL AFTER size;
