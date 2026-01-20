-- Add highlights column to products table
ALTER TABLE products 
ADD COLUMN highlights text[] DEFAULT '{}';

-- Optional: Update existing products with some default highlights if needed
-- UPDATE products SET highlights = ARRAY['Premium Quality', 'Farm Fresh'] WHERE highlights IS NULL;
