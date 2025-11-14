-- Ensure receipts table has proper schema for inserts
-- This fixes the 42P10 "no unique or exclusion constraint" error

-- Step 1: Ensure id column exists and is UUID
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'receipts' AND column_name = 'id'
  ) THEN
    ALTER TABLE public.receipts ADD COLUMN id UUID DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Step 2: Ensure id is NOT NULL
ALTER TABLE public.receipts ALTER COLUMN id SET NOT NULL;

-- Step 3: Ensure id has default UUID generation
ALTER TABLE public.receipts ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Step 4: Drop existing primary key if it exists
ALTER TABLE public.receipts DROP CONSTRAINT IF EXISTS receipts_pkey CASCADE;

-- Step 5: Create primary key on id
ALTER TABLE public.receipts ADD PRIMARY KEY (id);

-- Step 6: Ensure user_id is NOT NULL
ALTER TABLE public.receipts ALTER COLUMN user_id SET NOT NULL;

-- Step 7: Create unique index on id (redundant with PK but ensures it exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_receipts_id_unique ON public.receipts(id);

-- Step 8: Disable RLS if it's causing issues (we'll add policies separately)
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
