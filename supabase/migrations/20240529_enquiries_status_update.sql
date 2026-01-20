-- Drop existing constraints
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bulk_enquiries_status_check') THEN 
        ALTER TABLE public.bulk_enquiries DROP CONSTRAINT bulk_enquiries_status_check; 
    END IF; 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corporate_enquiries_status_check') THEN 
        ALTER TABLE public.corporate_enquiries DROP CONSTRAINT corporate_enquiries_status_check; 
    END IF; 
END $$;

-- Add new constraints
ALTER TABLE public.bulk_enquiries 
    ADD CONSTRAINT bulk_enquiries_status_check 
    CHECK (status IN ('new', 'read', 'accepted', 'rejected', 'contacted', 'resolved')); 
    -- keeping 'contacted'/'resolved' for legacy safety, ensuring we don't break existing rows if any

ALTER TABLE public.corporate_enquiries 
    ADD CONSTRAINT corporate_enquiries_status_check 
    CHECK (status IN ('new', 'read', 'accepted', 'rejected', 'in-progress', 'completed'));
    -- keeping 'in-progress'/'completed' for legacy safety
