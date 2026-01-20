-- Allow authenticated users to insert their own orders
create policy "Users can create their own orders." on public.orders for insert with check (auth.uid() = user_id);

-- Allow authenticated users to insert their own order items
-- The check ensures the linked order belongs to the user
create policy "Users can create their own order items." on public.order_items for insert with check (
  exists (
    select 1 from public.orders
    where public.orders.id = public.order_items.order_id
    and public.orders.user_id = auth.uid()
  )
);
