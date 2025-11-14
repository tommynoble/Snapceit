-- Add triggers to receipts_v2 table for automatic processing

-- Trigger 1: Enqueue receipts for processing
CREATE TRIGGER receipts_v2_enqueue
  AFTER INSERT ON public.receipts_v2
  FOR EACH ROW
  EXECUTE FUNCTION enqueue_receipt();

-- Trigger 2: Call Lambda directly (if enqueue_receipt function exists)
-- Note: This assumes the enqueue_receipt function handles the Lambda call
-- If not, uncomment below:
-- CREATE TRIGGER receipt_v2_textract_trigger
--   AFTER INSERT ON public.receipts_v2
--   FOR EACH ROW
--   EXECUTE FUNCTION supabase_functions.http_request('https://k5hrkbdnr3l53wllyhtrrduqqm0qvkzm.lambda-url.us-east-1.on.aws/', 'POST', '{"Content-type":"application/json"}', '{}', '5000');

-- Verify triggers were created
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'receipts_v2'
ORDER BY trigger_name;
