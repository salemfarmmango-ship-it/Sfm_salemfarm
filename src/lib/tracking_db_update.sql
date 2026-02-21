-- Database Migration for Order Tracking
-- Please run this statement in your Supabase SQL Editor

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_id TEXT,
ADD COLUMN IF NOT EXISTS courier_partner TEXT;
