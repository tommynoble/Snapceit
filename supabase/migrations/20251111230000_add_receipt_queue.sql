-- Receipt Queue Pattern for Reliable Processing (Pattern B: S3-first + DB ingestion)
-- This creates a durable queue table and atomic trigger that does NOT rely on Supabase webhooks
-- Uses pg_notify for near real-time processing

-- Create queue table
CREATE TABLE IF NOT EXISTS public.receipt_queue (
  id SERIAL PRIMARY KEY,
  receipt_id UUID NOT NULL UNIQUE REFERENCES public.receipts(id) ON DELETE CASCADE,
  s3_key TEXT,
  enqueued_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  last_error TEXT,
  processor TEXT,
  processed_at TIMESTAMPTZ
);

-- Add missing columns if they don't exist (for idempotent migration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipt_queue' AND column_name='attempts') THEN
    ALTER TABLE public.receipt_queue ADD COLUMN attempts INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='receipt_queue' AND column_name='last_error') THEN
    ALTER TABLE public.receipt_queue ADD COLUMN last_error TEXT;
  END IF;
END $$;

-- Create index for efficient polling
CREATE INDEX IF NOT EXISTS idx_receipt_queue_unprocessed 
  ON public.receipt_queue(enqueued_at) 
  WHERE processed = FALSE;

-- Create index for concurrent safe processing
CREATE INDEX IF NOT EXISTS idx_receipt_queue_for_update
  ON public.receipt_queue(id)
  WHERE processed = FALSE AND attempts < 5;

-- Create function to enqueue receipts (atomic with INSERT)
CREATE OR REPLACE FUNCTION public.enqueue_receipt()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into queue table
  INSERT INTO public.receipt_queue (receipt_id, s3_key) 
  VALUES (new.id, new.image_url);
  
  -- Send notification for real-time processing
  PERFORM pg_notify(
    'receipt_channel',
    json_build_object('receipt_id', new.id, 'action', 'enqueued')::text
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on receipts INSERT (atomic)
DROP TRIGGER IF EXISTS receipts_enqueue ON public.receipts;
CREATE TRIGGER receipts_enqueue
  AFTER INSERT ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.enqueue_receipt();

-- Function to mark as processed
CREATE OR REPLACE FUNCTION public.mark_receipt_processed(
  p_receipt_id UUID,
  p_processor TEXT DEFAULT 'unknown',
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.receipt_queue
  SET 
    processed = CASE WHEN p_error_message IS NULL THEN TRUE ELSE FALSE END,
    processor = p_processor,
    processed_at = NOW(),
    error_message = p_error_message,
    retry_count = CASE WHEN p_error_message IS NOT NULL THEN retry_count + 1 ELSE retry_count END
  WHERE receipt_id = p_receipt_id;
END;
$$ LANGUAGE plpgsql;
