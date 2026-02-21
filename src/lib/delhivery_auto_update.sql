-- Database Migration for Automated Tracking
-- Please run this statement in your Supabase SQL Editor

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS label_url TEXT,
ADD COLUMN IF NOT EXISTS is_delhivery_automated BOOLEAN DEFAULT false;
