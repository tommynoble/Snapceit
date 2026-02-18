-- Fix RLS Error by making the queue function Security Definer
-- This allows the function to bypass RLS on receipt_queue while inserting

-- 1. Modify the function to run with the privileges of the creator (postgres/admin)
-- This is safer than opening up RLS on the queue table directly
CREATE OR REPLACE FUNCTION public.enqueue_receipt()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into queue table (Bypasses RLS because of SECURITY DEFINER)
  INSERT INTO public.receipt_queue (receipt_id, s3_key) 
  VALUES (new.id, new.image_url);
  
  -- Send notification for real-time processing
  PERFORM pg_notify(
    'receipt_channel',
    json_build_object('receipt_id', new.id, 'action', 'enqueued')::text
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure search_path is set (Critical for SECURITY DEFINER functions)
ALTER FUNCTION public.enqueue_receipt() SET search_path = public;

-- 3. (Optional) Cleanup the previous policy if it exists, as it's no longer needed for INSERT
-- We keep the SELECT policy so users can view their own queue items if needed
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.receipt_queue;
