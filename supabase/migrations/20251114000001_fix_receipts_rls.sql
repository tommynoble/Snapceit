-- Fix RLS policies for receipts table
-- These policies allow authenticated users to manage their own receipts

-- First check if RLS is enabled, if not enable it
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can view their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can update their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON public.receipts;

-- Create proper RLS policies
CREATE POLICY "Users can insert their own receipts" ON public.receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own receipts" ON public.receipts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipts" ON public.receipts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipts" ON public.receipts
  FOR DELETE USING (auth.uid() = user_id);
