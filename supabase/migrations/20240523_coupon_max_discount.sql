-- Add Maximum Discount Value to Coupons table
ALTER TABLE public.coupons 
ADD COLUMN max_discount_value numeric;
