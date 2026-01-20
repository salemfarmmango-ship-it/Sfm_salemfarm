create table public.store_settings (
  key text primary key,
  value jsonb not null,
  description text
);

-- RLS
alter table public.store_settings enable row level security;

create policy "Settings are viewable by everyone." 
on public.store_settings for select using (true);

create policy "Admins can manage settings." 
on public.store_settings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Seed Data (Default COD to false)
INSERT INTO public.store_settings (key, value, description) VALUES
('payment_cod_enabled', 'false'::jsonb, 'Enable or disable Cash on Delivery'),
('top_bar_content', '"Grand Opening Offer: Flat 20% OFF on all Mango pre-orders! Use Code: MANGO20"'::jsonb, 'Banner text displayed at the top of the site')
ON CONFLICT (key) DO NOTHING;
add this