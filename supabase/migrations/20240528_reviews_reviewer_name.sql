-- Add reviewer_name column to reviews table
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_name TEXT;

-- Update RLS policies to allow reading reviewer_name
-- (Existing policies cover the whole row, so this should be fine automatically)

-- Update the sample reviews trigger/function logic if it existed (it was a DO block so it's gone)
-- We will rerun the sample data inserter to populate this column.
