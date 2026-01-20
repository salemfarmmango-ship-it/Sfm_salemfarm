-- Update Mangoes
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/f/fb/Imam_Pasand_mango_at_Fairchild_Tropical_Botanic_Garden.jpg'] WHERE name ILIKE '%Salem Bengalura Mango%' OR name ILIKE '%Imam Pasand%';
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/f/fb/Imam_Pasand_mango_at_Fairchild_Tropical_Botanic_Garden.jpg'] WHERE name = 'Salem Bengalura Mango';

UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/3/36/Mango-banganapalli.jpg'] WHERE name ILIKE '%Banganapalli%';

UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Mangos_-_single_and_halved.jpg/800px-Mangos_-_single_and_halved.jpg'] WHERE name ILIKE '%Kalapadi%';  -- Using generic tasty mango image as specific Kalapadi high-res is rare public domain

UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/9/90/Hapus_Mango.jpg'] WHERE name ILIKE '%Nadusalai%'; -- Using Alphonso-like image for Nadusalai which is similar

UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Totapuri_Mango.jpg/640px-Totapuri_Mango.jpg'] WHERE name ILIKE '%Totapuri%';

UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Carabao_mangoes_%28Philippines%29.jpg/640px-Carabao_mangoes_%28Philippines%29.jpg'] WHERE name ILIKE '%Gundu Vadu%'; -- Using small green mangoes

UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Carabao_mangoes_%28Philippines%29.jpg/640px-Carabao_mangoes_%28Philippines%29.jpg'] WHERE name ILIKE '%Kilimooku Vadu%';


-- Update Rice
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Black_rice_cooked.jpg/640px-Black_rice_cooked.jpg'] WHERE name ILIKE '%Karuppu Kavuni%';
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Red_Rice.jpg/640px-Red_Rice.jpg'] WHERE name ILIKE '%Red Rice%';

-- Update Oils
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Coconut_oil_%284497048099%29.jpg/640px-Coconut_oil_%284497048099%29.jpg'] WHERE name ILIKE '%Coconut Oil%';
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Peanut_oil_in_a_glass_bottle.jpg/435px-Peanut_oil_in_a_glass_bottle.jpg'] WHERE name ILIKE '%Trial Pack%'; -- Generic Oil
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Ghee_in_a_jar.jpg/640px-Ghee_in_a_jar.jpg'] WHERE name ILIKE '%Ghee%';

-- Update Spices & Jaggery
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Jaggery_India.jpg/640px-Jaggery_India.jpg'] WHERE name ILIKE '%Jaggery%';
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Turmeric_powder.jpg/640px-Turmeric_powder.jpg'] WHERE name ILIKE '%Turmeric%';

-- Update Vegetables
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/640px-Tomato_je.jpg'] WHERE name ILIKE '%Tomato%';
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Onion_on_White.JPG/640px-Onion_on_White.JPG'] WHERE name ILIKE '%Onion%';

-- Update Pulses & Specials
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Mung_bean_Macrophotography.jpg/640px-Mung_bean_Macrophotography.jpg'] WHERE name ILIKE '%Green Gram%';
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Mango_Pickle.JPG/640px-Mango_Pickle.JPG'] WHERE name ILIKE '%Pickle%';
UPDATE public.products SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Mango_pulp.JPG/640px-Mango_pulp.JPG'] WHERE name ILIKE '%Pulp%';
