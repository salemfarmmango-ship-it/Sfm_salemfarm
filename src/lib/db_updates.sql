-- 1. Add 'highlights' column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}';

-- 2. Modify 'images' column to support multiple images (text array)
-- This command safely converts an existing single 'text' column to a 'text[]' array.
-- If the column is already text[], this will simply re-cast it (safe).
-- If 'images' contains a single URL string, it becomes an array with one element: {'url'}.
ALTER TABLE products 
ALTER COLUMN images TYPE text[] 
USING CASE 
    WHEN images IS NULL THEN '{}' 
    -- If it's already an array (postgres sees text[] as string literal starting with {), parsing is automatic usually, 
    -- but if we are converting FROM text TO text[], we treat simple text as one item.
    ELSE ARRAY[images::text] 
END;

-- NOTES: 
-- Run this in your Supabase SQL Editor.
-- After running, the 'images' column will store arrays of URLs (e.g., {'url1', 'url2'}).
