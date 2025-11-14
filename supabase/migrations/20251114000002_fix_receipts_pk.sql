-- Fix receipts table primary key and constraints
-- This ensures the table has a proper primary key for inserts

-- Drop existing primary key if it exists (with cascade to avoid conflicts)
ALTER TABLE public.receipts DROP CONSTRAINT IF EXISTS receipts_pkey CASCADE;

-- Ensure id column exists and is UUID type
ALTER TABLE public.receipts 
ALTER COLUMN id SET NOT NULL,
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Create proper primary key
ALTER TABLE public.receipts 
ADD PRIMARY KEY (id);

-- Ensure user_id is NOT NULL
ALTER TABLE public.receipts
ALTER COLUMN user_id SET NOT NULL;

-- Create unique index on id (redundant with PK but ensures it exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_receipts_id_unique ON public.receipts(id);
