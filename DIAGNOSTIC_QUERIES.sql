-- DIAGNOSTIC QUERIES FOR RECEIPTS TABLE

-- 1) Check constraints (especially PRIMARY KEY)
SELECT conname, pg_get_constraintdef(c.oid) AS def
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'receipts';

-- 2) Check indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'receipts';

-- 3) Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'receipts'
ORDER BY ordinal_position;

-- 4) Check for duplicate values on potential unique columns
SELECT user_id, COUNT(*) FROM public.receipts GROUP BY user_id HAVING COUNT(*) > 1;
