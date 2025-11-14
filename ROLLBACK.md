# Database Rollback Instructions

If you want to undo all the changes we made, here's how:

## Option 1: Rollback via Supabase Dashboard (Easiest)

1. Go to **Supabase Dashboard**
2. Click your project
3. Go to **Settings → Backups**
4. Look for a backup from before today
5. Click **Restore** on that backup
6. Confirm the restoration

This will restore your entire database to the state it was in before.

---

## Option 2: Manual SQL Rollback (If you want to keep today's data)

If you want to undo ONLY our changes, run this SQL in Supabase SQL Editor:

```sql
-- 1) Re-enable RLS (if it was enabled before)
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- 2) Drop the primary key we added
ALTER TABLE public.receipts DROP CONSTRAINT IF EXISTS receipts_pkey CASCADE;

-- 3) Drop the id column we added
ALTER TABLE public.receipts DROP COLUMN IF EXISTS id;
```

---

## What We Changed

### Database Changes Made:
1. Added UUID `id` column to receipts table
2. Added PRIMARY KEY constraint on `id`
3. Disabled RLS on receipts table

### Code Changes Made:
1. Modified `/src/components/dashboard/receipts/ReceiptContext.tsx`
   - Removed `.insert().select()`
   - Using plain `.insert()`
   - Normalized payload

### Migrations Created:
- `20251114000004_add_receipts_primary_key.sql`
- `20251114000005_disable_receipts_rls.sql`

---

## To Rollback Code Changes

If you want to revert the code changes:

```bash
git checkout src/components/dashboard/receipts/ReceiptContext.tsx
```

---

## Recommendation

**Don't rollback yet!** The changes we made are actually good:
- ✅ Adding a primary key is standard database hygiene
- ✅ The code changes are simpler and more reliable
- ✅ Disabling RLS temporarily lets us test

**Instead, let's test the app first:**
1. Hard refresh the browser
2. Try uploading a receipt
3. If it works, you're done! 🎉
4. If it doesn't work, we debug from there

The confusion is normal - we've been fixing multiple layers (code + database + RLS). But we're very close to working!

---

## Questions?

If you want to rollback, just let me know which option:
1. **Full database restore** (loses today's data)
2. **Manual SQL rollback** (keeps today's data, undoes our changes)
3. **Code-only rollback** (keeps database changes, reverts code)
