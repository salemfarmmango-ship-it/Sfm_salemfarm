-- Add Minimum Order Value to Coupons table
ALTER TABLE public.coupons 
ADD COLUMN min_order_value numeric DEFAULT 0;

-- Add Coupon ID tracking to Orders table
ALTER TABLE public.orders 
ADD COLUMN coupon_id bigint REFERENCES public.coupons(id);

-- Optional: Add index for faster lookup of user's coupon usage
CREATE INDEX idx_orders_user_coupon ON public.orders(user_id, coupon_id);
