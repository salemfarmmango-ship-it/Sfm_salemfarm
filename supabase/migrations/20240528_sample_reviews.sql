-- Insert 30+ sample reviews for each product with proper reviewer names
DO $$
DECLARE
    p_id INTEGER;
    reviewer_names TEXT[] := ARRAY[
        'Priya Sharma', 'Rahul Kumar', 'Anita Devi', 'Vijay Singh', 'Meena Patel',
        'Suresh Reddy', 'Lakshmi Iyer', 'Arun Nair', 'Deepa Menon', 'Karthik Rajan',
        'Sneha Gupta', 'Amit Verma', 'Pooja Joshi', 'Ravi Shankar', 'Geeta Krishnan',
        'Mohan Das', 'Kavitha Sundaram', 'Prakash Rao', 'Divya Nayak', 'Sunil Pillai',
        'Rekha Bhat', 'Manoj Tiwari', 'Swati Mishra', 'Harish Gowda', 'Nisha Agarwal',
        'Sanjay Deshmukh', 'Asha Kulkarni', 'Rajesh Patil', 'Sunita Jain', 'Ganesh Naik',
        'Preeti Choudhary', 'Dinesh Saxena', 'Madhavi Rao', 'Vinod Kapoor', 'Usha Hegde'
    ];
    positive_comments TEXT[] := ARRAY[
        'Absolutely delicious! The best mangoes I have ever tasted. Fresh and sweet.',
        'Amazing quality! Perfectly ripe and so juicy. Will definitely order again.',
        'These mangoes remind me of my childhood in Salem. Authentic taste!',
        'Excellent packaging and super fast delivery. Mangoes were perfectly ripe.',
        'My family loved these mangoes. Kids are asking for more!',
        'Best online mango purchase ever. Very happy with the quality.',
        'Fresh from farm quality. You can taste the difference.',
        'Sweet, juicy and absolutely heavenly. Worth every rupee!',
        'Premium quality mangoes at reasonable price. Highly recommended.',
        'Ordered for my parents and they loved it. Thank you Salem Farm!',
        'The aroma itself was amazing. Tasted even better!',
        'Perfect ripeness, no bruises, excellent quality control.',
        'Better than the local market mangoes. Much fresher!',
        'Gift wrapped beautifully. Perfect for sending to relatives.',
        'Authentic Alphonso taste. Reminds me of Ratnagiri mangoes.',
        'Ordered 5kg box, got bonus mangoes too. Great service!',
        'Natural sweetness, no artificial ripening. You can tell the difference.',
        'My go-to place for mangoes now. Consistent quality every time.',
        'Mangoes were so sweet, we finished the whole box in 2 days!',
        'Excellent customer service and product quality both.'
    ];
    neutral_comments TEXT[] := ARRAY[
        'Good quality mangoes. Delivery was on time.',
        'Nice mangoes, though a couple were slightly overripe.',
        'Decent quality for the price. Will try again.',
        'Packaging could be better, but mangoes were good.',
        'Average sweetness but good overall. Fair price.',
        'Good mangoes. Expected a bit more sweetness though.',
        'Quality is consistent with what I expected.',
        'Mangoes were okay. Some were better than others.',
        'Fair quality. Delivery took a bit longer than expected.',
        'Good product. Would be great with faster delivery.'
    ];
    i INTEGER;
    random_rating INTEGER;
    random_comment TEXT;
    random_name TEXT;
BEGIN
    -- Optional: Clear existing "broken" sample reviews (null user_id and null reviewer_name)
    -- DELETE FROM reviews WHERE user_id IS NULL AND reviewer_name IS NULL;

    -- Loop through each product
    FOR p_id IN SELECT id FROM products LOOP
        -- Insert 30+ reviews per product
        FOR i IN 1..32 LOOP
            -- Generate random rating (weighted towards positive)
            IF random() < 0.6 THEN
                random_rating := 5;
            ELSIF random() < 0.8 THEN
                random_rating := 4;
            ELSIF random() < 0.9 THEN
                random_rating := 3;
            ELSE
                random_rating := CASE WHEN random() < 0.5 THEN 2 ELSE 3 END;
            END IF;
            
            -- Pick comment based on rating
            IF random_rating >= 4 THEN
                random_comment := positive_comments[1 + floor(random() * array_length(positive_comments, 1))::int];
            ELSE
                random_comment := neutral_comments[1 + floor(random() * array_length(neutral_comments, 1))::int];
            END IF;
            
            -- Pick random reviewer name
            random_name := reviewer_names[1 + floor(random() * array_length(reviewer_names, 1))::int];
            
            -- Insert review with reviewer_name
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
