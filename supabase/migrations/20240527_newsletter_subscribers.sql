-- Create newsletter subscribers table
create table public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.newsletter_subscribers enable row level security;

-- Only admins can view the table
create policy "Admins can view subscribers." 
on public.newsletter_subscribers for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Public can insert (subscribe)
create policy "Anyone can subscribe." 
on public.newsletter_subscribers for insert with check (true);
