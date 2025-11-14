# Fix Postgres Error 42P10 - Receipt Upload

## The Problem (In Plain English)
Your `receipts` table has no primary key. When Supabase tries to do anything that needs uniqueness (insert with return, upsert, etc.), Postgres says "I don't know what you mean by conflict — there's no unique index" → **42P10 error**.

This is the ONLY real problem. Everything else (code changes, .select(), etc.) was just different ways of triggering it.

## The Solution (One SQL Block)
Copy this entire block and run it in **Supabase SQL Editor** (one time):

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.receipts
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

UPDATE public.receipts
SET id = gen_random_uuid()
WHERE id IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'receipts' AND c.contype = 'p'
  ) THEN
    ALTER TABLE public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);
  END IF;
END$$;
```

That's it. This:
- ✅ Adds a UUID `id` column to every row
- ✅ Generates UUIDs for any existing rows
- ✅ Makes `id` the primary key
- ✅ Tells Postgres "this is what you use for uniqueness"

## Verify It Worked
Run this in SQL Editor:
```sql
SELECT conname, pg_get_constraintdef(c.oid) AS def
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'receipts';
```

You should see: `receipts_pkey | PRIMARY KEY (id)`

## Test It
In browser console:
```javascript
const { data, error } = await supabase
  .from('receipts')
  .insert([{ 
    user_id: '<your_user_id>', 
    merchant: 'test',
    amount: 1.23 
  }]);

console.log('test insert', { data, error });
```

If no error: **you're done**. The table is fixed.

## Then Test the App
1. Hard refresh (`Cmd+Shift+R`)
2. Upload a receipt
3. Should work! 🎉

---

## Why This Happened
- Supabase/PostgREST uses `ON CONFLICT` internally for certain operations
- Your table had no primary key for Postgres to use
- Result: 42P10 error every time
- Fix: Give the table a primary key
- Result: No more 42P10

## That's It
No more code changes needed. Just run the SQL once and you're done.
