-- Add original_price column to products table
ALTER TABLE public.products 
ADD COLUMN original_price NUMERIC;

comment on column public.products.original_price is 'The regular price before sale/discount';
