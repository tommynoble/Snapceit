-- Secure Database Tables Migration
-- Run this in the Supabase SQL Editor to address Critical Security Warnings

-- 1. Fix Receipts Table (Policy Exists, RLS Disabled)
-- RLS was likely disabled accidentally. Re-enabling it enforces existing policies.
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- 2. Fix Vendors Table (RLS Disabled)
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policies for Vendors
-- Allow all authenticated users to read vendors (needed for linking receipts)
CREATE POLICY "Enable read access for authenticated users" 
ON public.vendors FOR SELECT 
TO authenticated 
USING (true);

-- Allow service_role (backend/edge functions) full access to manage vendors
CREATE POLICY "Enable all access for service_role" 
ON public.vendors FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 3. Fix Receipt Queue Tables (RLS Disabled)
-- These tables appear to be used for background processing.
-- We enable RLS and restrict access to the service_role only by default for safety.

-- Check if tables exist before altering to prevent errors if they don't
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'receipt_queue') THEN
        ALTER TABLE public.receipt_queue ENABLE ROW LEVEL SECURITY;
        
        -- Policy: Service Role has full access
        CREATE POLICY "Enable full access for service_role" 
        ON public.receipt_queue FOR ALL 
        TO service_role 
        USING (true) 
        WITH CHECK (true);
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'receipt_queue_dlq') THEN
        ALTER TABLE public.receipt_queue_dlq ENABLE ROW LEVEL SECURITY;

        -- Policy: Service Role has full access
        CREATE POLICY "Enable full access for service_role" 
        ON public.receipt_queue_dlq FOR ALL 
        TO service_role 
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;

-- 4. Address Security Definer Views
-- The warnings for 'vw_receipt_queue_failures' and 'vw_receipt_queue_status' indicate 
-- they run with the privileges of the creator (bypassing RLS).
-- 
-- RECOMMENDATION:
-- If these views are intended for admin/system use only, you can leave them as is 
-- but ensure you only query them with the service_role key.
--
-- If users need to query them, you should recreate them as SECURITY INVOKER.
-- Since we don't have the original view definition here, we cannot automatically recreate them.
--
-- To fix manually in Supabase Dashboard:
-- 1. Go to Database > Views
-- 2. Select the view
-- 3. Copy the definition
-- 4. Drop the view
-- 5. Recreate it adding 'WITH (security_invoker = on)' before the 'AS' keyword, 
--    OR simply run: ALTER VIEW public.vw_receipt_queue_status SET (security_invoker = on);
--    (Note: PostgreSQL 15+ supports altering security_invoker directly)

-- Attempt to enforce security_invoker if supported (Postgres 15+)
DO $$
BEGIN
    -- This might fail on older Postgres versions, so we wrap in a block
    BEGIN
        ALTER VIEW public.vw_receipt_queue_failures SET (security_invoker = on);
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not set security_invoker on vw_receipt_queue_failures. Skipping.';
    END;

    BEGIN
        ALTER VIEW public.vw_receipt_queue_status SET (security_invoker = on);
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not set security_invoker on vw_receipt_queue_status. Skipping.';
    END;
END $$;
