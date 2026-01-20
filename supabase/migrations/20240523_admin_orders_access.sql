-- Add RLS policies for admin access to orders and order_items

-- Allow service role (admin) to read all orders
CREATE POLICY "Service role can read all orders" ON public.orders
    FOR SELECT
    USING (true);

-- Allow service role (admin) to update all orders
CREATE POLICY "Service role can update all orders" ON public.orders
    FOR UPDATE
    USING (true);

-- Allow service role (admin) to read all order items
CREATE POLICY "Service role can read all order_items" ON public.order_items
    FOR SELECT
    USING (true);
