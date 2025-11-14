-- Enable RLS on receipts_v2 with proper policies

-- Enable RLS
ALTER TABLE public.receipts_v2 ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert own receipts" ON public.receipts_v2;
DROP POLICY IF EXISTS "Users can view own receipts" ON public.receipts_v2;
DROP POLICY IF EXISTS "Users can update own receipts" ON public.receipts_v2;
DROP POLICY IF EXISTS "Users can delete own receipts" ON public.receipts_v2;

-- Create INSERT policy (allows authenticated users to insert their own receipts)
CREATE POLICY "Enable inserts for authenticated users" 
ON public.receipts_v2 FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Create SELECT policy (allows authenticated users to view their own receipts)
CREATE POLICY "Enable select for own receipts" 
ON public.receipts_v2 FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Create UPDATE policy (allows authenticated users to update their own receipts)
CREATE POLICY "Enable update for own receipts" 
ON public.receipts_v2 FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create DELETE policy (allows authenticated users to delete their own receipts)
CREATE POLICY "Enable delete for own receipts" 
ON public.receipts_v2 FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'receipts_v2'
ORDER BY policyname;
