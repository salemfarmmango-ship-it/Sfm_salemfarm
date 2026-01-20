-- Enable pg_net for HTTP requests (needed for SQL-based Cron jobs invoking Edge Functions)
create extension if not exists pg_net with schema extensions;

-- Enable pg_cron for scheduling jobs (if not already enabled)
create extension if not exists pg_cron with schema extensions;
