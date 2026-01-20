-- Create otp_verifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL,
    type TEXT NOT NULL, -- 'email' or 'phone'
    code TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create verification_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.verification_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    purpose TEXT NOT NULL, -- 'signup' or 'reset'
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(identifier, purpose)
);

-- Add RLS policies
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Allow public access for now as these are handled by server-side API with service role
CREATE POLICY "Allow service role full access otp" ON public.otp_verifications
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service role full access tokens" ON public.verification_tokens
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
