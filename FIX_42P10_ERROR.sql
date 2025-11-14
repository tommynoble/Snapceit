-- ============================================================================
-- FIX FOR POSTGRES ERROR 42P10: "no unique or exclusion constraint matching ON CONFLICT"
-- ============================================================================
-- This error occurs because the receipts table lacks a primary key
-- Supabase/PostgREST uses ON CONFLICT internally when returning rows
-- Without a PK, Postgres rejects the operation with 42P10

-- ============================================================================
-- RECOMMENDED FIX: Add UUID Primary Key (Safe, Idempotent)
-- ============================================================================
-- Run these 4 statements in Supabase SQL Editor

-- 1) Enable UUID generator if not present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) Add id column with default UUID (only if not exists)
ALTER TABLE public.receipts
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- 3) Populate any NULL ids (defensive measure)
UPDATE public.receipts
SET id = gen_random_uuid()
WHERE id IS NULL;

-- 4) Add primary key constraint (only if not present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'receipts' AND c.contype = 'p'
  ) THEN
    ALTER TABLE public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);
  END IF;
END$$;

-- ============================================================================
-- VERIFICATION: Run these to confirm the fix worked
-- ============================================================================

-- Check constraints (should show receipts_pkey with PRIMARY KEY (id))
SELECT conname, pg_get_constraintdef(c.oid) AS def
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'receipts';

-- Check indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'receipts';

-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'receipts'
ORDER BY ordinal_position;

-- ============================================================================
-- ROLLBACK (only if you need to revert - do NOT run unless necessary)
-- ============================================================================
-- DO NOT RUN THESE unless you want to undo the fix
-- Uncomment only if needed:

-- ALTER TABLE public.receipts DROP CONSTRAINT IF EXISTS receipts_pkey;
-- ALTER TABLE public.receipts DROP COLUMN IF EXISTS id;

-- ============================================================================
-- CLIENT-SIDE TEST (run in browser console after applying fix)
-- ============================================================================
-- const { data, error } = await supabase
--   .from('receipts')
--   .insert([{ user_id: '<your_user_id>', merchant: 'test', amount: 1.23 }]);
-- console.log('insert test', { data, error: error && JSON.stringify(error, null, 2) });
