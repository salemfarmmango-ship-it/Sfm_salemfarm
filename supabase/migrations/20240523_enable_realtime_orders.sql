-- Enable Realtime for the orders table
-- This allows Supabase to broadcast INSERT events for new orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
