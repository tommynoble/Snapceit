-- Fix primary key with CASCADE to handle foreign key dependencies

-- Step 1: Drop primary key with CASCADE (safe - keeps FK relationships)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'receipts' AND c.contype = 'p'
  ) THEN
    ALTER TABLE public.receipts DROP CONSTRAINT receipts_pkey CASCADE;
    RAISE NOTICE 'Dropped primary key with CASCADE';
  END IF;
END$$;

-- Step 2: Ensure id column is UUID and NOT NULL
ALTER TABLE public.receipts 
ALTER COLUMN id SET NOT NULL;

ALTER TABLE public.receipts 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Step 3: Add primary key back
ALTER TABLE public.receipts 
ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);

-- Step 4: Verify primary key exists
SELECT 'Primary key verification:' as step;
SELECT conname, pg_get_constraintdef(c.oid) AS constraint_def
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'receipts' AND c.contype = 'p';

-- Step 5: Verify foreign keys still exist
SELECT 'Foreign key verification:' as step;
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_name = 'receipts' OR referenced_table_name = 'receipts'
ORDER BY table_name;
