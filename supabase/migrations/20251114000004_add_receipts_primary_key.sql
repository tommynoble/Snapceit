-- CRITICAL FIX: Add proper primary key to receipts table
-- This fixes Postgres error 42P10: "no unique or exclusion constraint matching the ON CONFLICT specification"
-- The receipts table was missing a primary key, causing Supabase's internal ON CONFLICT path to fail

-- Step 1: Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Add id column with default UUID (if it doesn't already exist)
ALTER TABLE public.receipts
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- Step 3: Fill any NULL ids with generated UUIDs (defensive measure)
UPDATE public.receipts
SET id = gen_random_uuid()
WHERE id IS NULL;

-- Step 4: Ensure id is NOT NULL
ALTER TABLE public.receipts
ALTER COLUMN id SET NOT NULL;

-- Step 5: Drop existing primary key if it exists (to avoid conflicts)
ALTER TABLE public.receipts DROP CONSTRAINT IF EXISTS receipts_pkey CASCADE;

-- Step 6: Add primary key constraint on id
ALTER TABLE public.receipts
ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);

-- Step 7: Create unique index on id (redundant with PK but ensures it exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_receipts_id ON public.receipts(id);

-- VERIFICATION (run these queries to confirm the fix):
-- SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'receipts';
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename='receipts';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name='receipts';
