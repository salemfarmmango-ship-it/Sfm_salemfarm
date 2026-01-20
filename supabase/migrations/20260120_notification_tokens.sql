-- Migration: Create notification_tokens table for FCM push notifications
-- Created: 2026-01-20

-- Create the notification_tokens table
CREATE TABLE IF NOT EXISTS notification_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    user_id UUID,
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notification_tokens_user ON notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_tokens_token ON notification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_notification_tokens_created ON notification_tokens(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notification_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (since we use service role key from backend)
CREATE POLICY "Allow all operations" ON notification_tokens
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_token_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS notification_tokens_updated_at ON notification_tokens;
CREATE TRIGGER notification_tokens_updated_at
    BEFORE UPDATE ON notification_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_token_timestamp();

-- Add comment for documentation
COMMENT ON TABLE notification_tokens IS 'Stores FCM tokens for push notifications';
COMMENT ON COLUMN notification_tokens.token IS 'Firebase Cloud Messaging token';
COMMENT ON COLUMN notification_tokens.user_id IS 'Associated user ID (nullable for anonymous users)';
COMMENT ON COLUMN notification_tokens.device_info IS 'Device/browser information for debugging';
