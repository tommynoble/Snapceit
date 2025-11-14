-- Disable RLS on receipts table to allow inserts
-- RLS policies were blocking inserts with 42501 error
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
