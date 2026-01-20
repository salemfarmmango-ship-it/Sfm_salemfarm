-- Add season_over column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS season_over BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN public.products.season_over IS 'Indicates if the product is no longer available due to season ending';
