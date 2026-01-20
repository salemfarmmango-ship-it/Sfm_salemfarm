-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (admin operations are server-side only)
CREATE POLICY "Allow service role full access admin_users" ON public.admin_users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Insert default admin user (password: Admin@123)
-- Password hash generated with bcrypt rounds=10
INSERT INTO public.admin_users (email, password_hash, name)
VALUES ('admin@salemfarmmango.com', '$2b$10$/SKf4FLF8P6CwOaUMSKGOtutYI.BP/h8gr07R9W9wARRca', 'Admin User')
ON CONFLICT (email) DO NOTHING;
