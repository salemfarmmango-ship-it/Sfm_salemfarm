-- Seed Categories
INSERT INTO public.categories (name, slug) VALUES 
('Mangoes', 'mangoes'),
('Traditional Rice & Ayurvedic', 'rice-ayurvedic'),
('Oil & Ghee', 'oil-ghee'),
('Sugar & Spices', 'sugar-spices'),
('Fruits & Vegetables', 'fruits-vegetables'),
('Cereals & Pulses', 'cereals-pulses'),
('Native Specials', 'native-specials'),
('Mango Extract & Samples', 'mango-extracts');

-- Seed Products
-- Note: Assuming IDs for categories based on insertion order (1 to 8).
-- In a real migration, we would query IDs first. Here we assume clean slate or hardcoded IDs.

-- Mangoes (Cat ID 1)
INSERT INTO public.products (category_id, name, size, price, description, stock_status) VALUES
(1, 'Salem Bengalura Mango', '1 Kg', 199, 'Sweet Salem native mango', 'In Stock'),
(1, 'Salem Bengalura Mango', '3 Kg', 249, 'Sweet Salem native mango', 'In Stock'),
(1, 'Salem Bengalura Mango', '5 Kg', 280, 'Sweet Salem native mango', 'In Stock'),
(1, 'Banganapalli Mango', '1 Kg', 129, 'Fiberless sweet mango', 'In Stock'),
(1, 'Kalapadi Mango', '1 Kg', 179, 'Juicy local mango', 'In Stock'),
(1, 'Nadusalai (Raspuri) Mango', '1 Kg', 149, 'Traditional aromatic mango', 'In Stock'),
(1, 'Totapuri Raw Mango', '1 Kg', 499, 'Best for pickle making', 'In Stock'),
(1, 'Gundu Vadu Mango', '1 Kg', 439, 'Baby mango for pickle', 'In Stock'),
(1, 'Kilimooku Vadu Mango', '1 Kg', 479, 'Tender vadu mango', 'In Stock');

-- Traditional Rice & Ayurvedic (Cat ID 2)
INSERT INTO public.products (category_id, name, size, price, description, stock_status) VALUES
(2, 'Karuppu Kavuni Rice', '1 Kg', 179, 'Traditional black rice', 'In Stock'),
(2, 'Karuppu Kavuni Rice', '5 Kg', 899, 'Traditional black rice bulk pack', 'In Stock'),
(2, 'Karuppu Kavuni Rice', '25 Kg', 2500, 'Wholesale pack', 'In Stock');

-- Oil & Ghee (Cat ID 3)
INSERT INTO public.products (category_id, name, size, price, description, stock_status) VALUES
(3, 'Cold Pressed Oil Trial Pack', '600 ml', 239, 'Groundnut + Coconut + Sesame oils', 'In Stock'),
(3, 'Cold Pressed Coconut Oil', '1 L', 389, 'Wood pressed natural oil', 'In Stock'),
(3, 'Country Cow Ghee', '500 ml', 699, 'Traditional desi ghee', 'In Stock');

-- Sugar & Spices (Cat ID 4)
INSERT INTO public.products (category_id, name, size, price, description, stock_status) VALUES
(4, 'Natural Jaggery', '1 Kg', 89, 'Chemical free jaggery', 'In Stock'),
(4, 'Palm Jaggery', '1 Kg', 129, 'Traditional palm jaggery', 'In Stock'),
(4, 'Turmeric Powder', '250 g', 119, 'Native turmeric powder', 'In Stock');

-- Fruits & Vegetables (Cat ID 5)
INSERT INTO public.products (category_id, name, size, price, description, stock_status) VALUES
(5, 'Fresh Country Tomato', '1 Kg', 119, 'Naturally grown tomato', 'In Stock'),
(5, 'Country Onion', '1 Kg', 139, 'Farm fresh onion', 'In Stock');

-- Cereals & Pulses (Cat ID 6)
INSERT INTO public.products (category_id, name, size, price, description, stock_status) VALUES
(6, 'Traditional Red Rice', '1 Kg', 149, 'Unpolished rice', 'In Stock'),
(6, 'Green Gram', '1 Kg', 179, 'Native pulse variety', 'In Stock');

-- Native Specials (Cat ID 7)
INSERT INTO public.products (category_id, name, size, price, description, stock_status) VALUES
(7, 'Homemade Mango Pickle', '500 g', 179, 'Traditional recipe pickle', 'In Stock'),
(7, 'Wood Pressed Sesame Oil Cake', '1 Kg', 79, 'Cattle feed cake', 'In Stock');

-- Mango Extract & Samples (Cat ID 8)
INSERT INTO public.products (category_id, name, size, price, description, stock_status) VALUES
(8, 'Mango Pulp', '750 ml', 319, 'Fresh mango pulp', 'In Stock'),

-- Seed Reviews
-- Assuming User ID is hard for seeding without knowing UUIDs, but we can assume empty if using dummy data or just create the structure.
-- Since we don't have user UUIDs easily here, we will skip hardcoding reviews with user keys violating constraints unless we have a known user.
-- For the purpose of this demo, we will RELY ON THE FRONTEND to mock the initial display or create a 'guest' profile if needed.
-- actually, let's just create the component to work with 'mock' data if DB is empty, or fetch.

