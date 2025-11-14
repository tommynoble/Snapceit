-- Final fix for receipts table primary key
-- This ensures the primary key exists and is properly recognized

-- Step 1: Check if primary key exists
SELECT 'Checking primary key...' as step;

-- Step 2: Drop existing primary key if it exists (safe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'receipts' AND c.contype = 'p'
  ) THEN
    ALTER TABLE public.receipts DROP CONSTRAINT receipts_pkey;
    RAISE NOTICE 'Dropped existing primary key';
  END IF;
END$$;

-- Step 3: Ensure id column exists and is UUID
ALTER TABLE public.receipts 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Step 4: Ensure id is NOT NULL
ALTER TABLE public.receipts 
ALTER COLUMN id SET NOT NULL;

-- Step 5: Add primary key constraint
ALTER TABLE public.receipts 
ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);

-- Step 6: Verify primary key was created
SELECT 'Primary key verification:' as step;
SELECT conname, pg_get_constraintdef(c.oid) AS constraint_def
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'receipts' AND c.contype = 'p';

-- Step 7: Verify table structure
SELECT 'Table structure:' as step;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'receipts' AND column_name = 'id';
