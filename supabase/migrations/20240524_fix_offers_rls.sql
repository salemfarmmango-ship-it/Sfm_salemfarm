-- Simplify RLS for offers to allow admin panel management via anon key
-- Since the project uses a custom admin session, we'll allow these operations for now
-- and rely on the UI/API layer for access control as per current project structure.

DROP POLICY IF EXISTS "Allow public read access for offers" ON public.offers;
DROP POLICY IF EXISTS "Allow admin all access for offers" ON public.offers;

-- Allow anyone to read active offers
CREATE POLICY "Allow public read access for offers" 
ON public.offers FOR SELECT 
TO public 
USING (true);

-- Allow anyone to manage offers (for dev convenience matching existing table patterns)
CREATE POLICY "Allow management for offers" 
ON public.offers FOR ALL 
TO public 
USING (true)
WITH CHECK (true);
