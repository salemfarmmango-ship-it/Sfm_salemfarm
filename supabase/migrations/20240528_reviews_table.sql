-- Create reviews table with admin approval workflow
CREATE TABLE IF NOT EXISTS public.reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved reviews
CREATE POLICY "Anyone can read approved reviews" ON public.reviews
    FOR SELECT USING (is_approved = true);

-- Allow authenticated users to insert their own reviews
CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow service role full access (admin)
CREATE POLICY "Service role full access reviews" ON public.reviews
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Index for faster product queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);
