-- Create a view to get product review statistics
-- This will be used to calculate average rating and review count per product
CREATE OR REPLACE VIEW product_review_stats AS
SELECT 
    product_id,
    COUNT(*) as review_count,
    ROUND(AVG(rating)::numeric, 1) as avg_rating
FROM reviews
WHERE is_approved = true
GROUP BY product_id;

-- Grant access to the view
GRANT SELECT ON product_review_stats TO anon, authenticated;
