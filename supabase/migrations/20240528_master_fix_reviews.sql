-- MASTER FIX: RESET REVIEWS SYSTEM COMPLETELY
-- Run this entire script in the Supabase SQL Editor to fix all review issues.

-- 1. CLEANUP: Drop existing objects to start fresh
DROP VIEW IF EXISTS product_review_stats;
DROP TABLE IF EXISTS public.reviews CASCADE;

-- 2. CREATE TABLE: Create the reviews table with all necessary columns
CREATE TABLE public.reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    reviewer_name TEXT, -- Added for anonymous/sample reviews
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES (Access Rules)
-- Allow anyone (public) to see approved reviews
CREATE POLICY "Anyone can read approved reviews" 
ON public.reviews FOR SELECT 
USING (is_approved = true);

-- Allow authenticated users to create reviews
CREATE POLICY "Users can create reviews" 
ON public.reviews FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow Service Role (Admin) full access
CREATE POLICY "Service role full access reviews" 
ON public.reviews FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 5. CREATE STATS VIEW (For Product Page ratings)
CREATE OR REPLACE VIEW product_review_stats AS
SELECT 
    product_id,
    COUNT(*) as review_count,
    ROUND(AVG(rating)::numeric, 1) as avg_rating
FROM reviews
WHERE is_approved = true
GROUP BY product_id;

GRANT SELECT ON product_review_stats TO anon, authenticated, service_role;

-- 6. INSERT SAMPLE DATA (With Names!)
DO $$
DECLARE
    p_id INTEGER;
    reviewer_names TEXT[] := ARRAY[
        'Priya Sharma', 'Rahul Kumar', 'Anita Devi', 'Vijay Singh', 'Meena Patel',
        'Suresh Reddy', 'Lakshmi Iyer', 'Arun Nair', 'Deepa Menon', 'Karthik Rajan',
        'Sneha Gupta', 'Amit Verma', 'Pooja Joshi', 'Ravi Shankar', 'Geeta Krishnan',
        'Mohan Das', 'Kavitha Sundaram', 'Prakash Rao', 'Divya Nayak', 'Sunil Pillai',
        'Rekha Bhat', 'Manoj Tiwari'
    ];
    positive_comments TEXT[] := ARRAY[
        'Absolutely delicious! The best mangoes I have ever tasted.',
        'Amazing quality! Perfectly ripe and so juicy. Will definitely order again.',
        'These mangoes remind me of my childhood in Salem. Authentic taste!',
        'Excellent packaging and super fast delivery. Mangoes were perfectly ripe.',
        'My family loved these mangoes. Kids are asking for more!',
        'Best online mango purchase ever. Very happy with the quality.',
        'Fresh from farm quality. You can taste the difference.',
        'Sweet, juicy and absolutely heavenly. Worth every rupee!'
    ];
    i INTEGER;
    random_rating INTEGER;
    random_comment TEXT;
    random_name TEXT;
BEGIN
    FOR p_id IN SELECT id FROM products LOOP
        -- Insert 15 sample reviews per product
        FOR i IN 1..15 LOOP
            IF random() < 0.7 THEN random_rating := 5;
            ELSEIF random() < 0.9 THEN random_rating := 4;
            ELSE random_rating := 3; END IF;
            
            random_comment := positive_comments[1 + floor(random() * array_length(positive_comments, 1))::int];
            random_name := reviewer_names[1 + floor(random() * array_length(reviewer_names, 1))::int];
            
            INSERT INTO reviews (product_id, rating, comment, is_approved, reviewer_name, created_at)
            VALUES (
                p_id,
                random_rating,
                random_comment,
                true,
                random_name,
                NOW() - (random() * interval '90 days')
            );
        END LOOP;
    END LOOP;
END $$;
