-- Add RLS policies for offers table to allow admin access

-- Verify if policies already exist to avoid errors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'offers' AND policyname = 'Allow public read access for offers'
    ) THEN
        CREATE POLICY "Allow public read access for offers" 
        ON public.offers FOR SELECT 
        TO public 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'offers' AND policyname = 'Allow management for offers'
    ) THEN
        CREATE POLICY "Allow management for offers" 
        ON public.offers FOR ALL 
        TO public 
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;
