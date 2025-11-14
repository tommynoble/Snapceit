-- Production-Grade Queue Pattern with DLQ and Idempotency
-- This is the ultimate reliable setup recommended by senior dev
-- Atomic enqueue, durable artifacts, idempotent processing, easy recovery

-- ============================================================================
-- 1) Main Queue Table (with unique constraint for idempotency)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.receipt_queue (
  id SERIAL PRIMARY KEY,
  receipt_id UUID NOT NULL UNIQUE REFERENCES public.receipts(id) ON DELETE CASCADE,
  s3_key TEXT NOT NULL,
  enqueued_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  last_error TEXT,
  processor TEXT,
  processed_at TIMESTAMPTZ,
  
  -- Indexes for efficient polling
  CONSTRAINT receipt_queue_unique_receipt UNIQUE (receipt_id)
);

CREATE INDEX IF NOT EXISTS idx_receipt_queue_unprocessed 
  ON public.receipt_queue(enqueued_at) 
  WHERE processed = FALSE;

CREATE INDEX IF NOT EXISTS idx_receipt_queue_for_update
  ON public.receipt_queue(id)
  WHERE processed = FALSE AND attempts < 5;

-- ============================================================================
-- 2) Dead Letter Queue (DLQ) - for failed receipts after max retries
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.receipt_queue_dlq (
  id SERIAL PRIMARY KEY,
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  s3_key TEXT,
  error_message TEXT,
  attempts INT,
  failed_at TIMESTAMPTZ DEFAULT NOW(),
  moved_from_queue_id INT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_receipt_queue_dlq_receipt_id
  ON public.receipt_queue_dlq(receipt_id);

CREATE INDEX IF NOT EXISTS idx_receipt_queue_dlq_failed_at
  ON public.receipt_queue_dlq(failed_at DESC);

-- ============================================================================
-- 3) Enqueue Trigger Function (Idempotent)
-- ============================================================================
-- This function is called AFTER INSERT on receipts table
-- It atomically inserts into receipt_queue and sends pg_notify
-- ON CONFLICT DO NOTHING ensures idempotency (no duplicate queue entries)

CREATE OR REPLACE FUNCTION public.enqueue_receipt()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into queue (idempotent: do not duplicate if receipt_id already exists)
  INSERT INTO public.receipt_queue (receipt_id, s3_key)
  VALUES (new.id, new.image_url)
  ON CONFLICT (receipt_id) DO NOTHING;
  
  -- Send real-time notification to workers
  PERFORM pg_notify(
    'receipt_channel',
    json_build_object(
      'receipt_id', new.id,
      'action', 'enqueued',
      'timestamp', NOW()::TEXT
    )::TEXT
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4) Attach Trigger to Receipts Table
-- ============================================================================
DROP TRIGGER IF EXISTS receipts_enqueue ON public.receipts;
CREATE TRIGGER receipts_enqueue
  AFTER INSERT ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.enqueue_receipt();

-- ============================================================================
-- 5) Helper Function: Mark Receipt Processed
-- ============================================================================
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
    processed_at = CASE WHEN p_error_message IS NULL THEN NOW() ELSE NULL END,
    last_error = p_error_message
  WHERE receipt_id = p_receipt_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6) Helper Function: Move to DLQ (after max retries)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.move_to_dlq(
  p_queue_id INT,
  p_reason TEXT DEFAULT 'max attempts exceeded'
)
RETURNS VOID AS $$
DECLARE
  v_receipt_id UUID;
  v_s3_key TEXT;
  v_last_error TEXT;
  v_attempts INT;
BEGIN
  -- Get queue row details
  SELECT receipt_id, s3_key, last_error, attempts
  INTO v_receipt_id, v_s3_key, v_last_error, v_attempts
  FROM public.receipt_queue
  WHERE id = p_queue_id;

  -- Insert into DLQ
  INSERT INTO public.receipt_queue_dlq (receipt_id, s3_key, error_message, attempts, moved_from_queue_id, notes)
  VALUES (v_receipt_id, v_s3_key, v_last_error, v_attempts, p_queue_id, p_reason);

  -- Delete from main queue
  DELETE FROM public.receipt_queue WHERE id = p_queue_id;

  -- Notify ops team (optional: send alert)
  PERFORM pg_notify(
    'receipt_dlq',
    json_build_object(
      'receipt_id', v_receipt_id,
      'reason', p_reason,
      'attempts', v_attempts
    )::TEXT
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7) Helper Function: Safe Polling with FOR UPDATE SKIP LOCKED
-- ============================================================================
-- This function is called by workers to fetch a batch of unprocessed receipts
-- FOR UPDATE SKIP LOCKED ensures safe concurrent processing (no double-processing)

CREATE OR REPLACE FUNCTION public.fetch_and_lock_queue_batch(
  p_limit INT DEFAULT 10,
  p_max_attempts INT DEFAULT 5
)
RETURNS TABLE(id INT, receipt_id UUID, s3_key TEXT) AS $$
BEGIN
  RETURN QUERY
  WITH locked_rows AS (
    SELECT q.id, q.receipt_id, q.s3_key
    FROM public.receipt_queue q
    WHERE q.processed = FALSE
      AND q.attempts < p_max_attempts
    ORDER BY q.enqueued_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.receipt_queue q
  SET attempts = q.attempts + 1
  FROM locked_rows lr
  WHERE q.id = lr.id
  RETURNING lr.id, lr.receipt_id, lr.s3_key;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8) Monitoring Views
-- ============================================================================

-- Queue status overview
CREATE OR REPLACE VIEW public.vw_receipt_queue_status AS
SELECT
  'pending' AS status,
  COUNT(*) AS count,
  AVG(EXTRACT(EPOCH FROM (NOW() - enqueued_at))) AS avg_age_seconds,
  MAX(EXTRACT(EPOCH FROM (NOW() - enqueued_at))) AS max_age_seconds
FROM public.receipt_queue
WHERE processed = FALSE
UNION ALL
SELECT
  'processed' AS status,
  COUNT(*) AS count,
  AVG(EXTRACT(EPOCH FROM (processed_at - enqueued_at))) AS avg_processing_time_seconds,
  MAX(EXTRACT(EPOCH FROM (processed_at - enqueued_at))) AS max_processing_time_seconds
FROM public.receipt_queue
WHERE processed = TRUE
UNION ALL
SELECT
  'dlq' AS status,
  COUNT(*) AS count,
  AVG(EXTRACT(EPOCH FROM (NOW() - failed_at))) AS avg_age_seconds,
  MAX(EXTRACT(EPOCH FROM (NOW() - failed_at))) AS max_age_seconds
FROM public.receipt_queue_dlq;

-- Failed receipts requiring attention
CREATE OR REPLACE VIEW public.vw_receipt_queue_failures AS
SELECT
  qd.receipt_id,
  qd.s3_key,
  qd.error_message,
  qd.attempts,
  qd.failed_at,
  qd.notes,
  r.status AS receipt_status,
  r.vendor_text
FROM public.receipt_queue_dlq qd
LEFT JOIN public.receipts r ON qd.receipt_id = r.id
ORDER BY qd.failed_at DESC;

-- ============================================================================
-- 9) Grants (if using RLS)
-- ============================================================================
-- Uncomment if you have RLS enabled and need to grant service role access
-- GRANT SELECT, INSERT, UPDATE ON public.receipt_queue TO service_role;
-- GRANT SELECT, INSERT ON public.receipt_queue_dlq TO service_role;
-- GRANT EXECUTE ON FUNCTION public.mark_receipt_processed TO service_role;
-- GRANT EXECUTE ON FUNCTION public.move_to_dlq TO service_role;
-- GRANT EXECUTE ON FUNCTION public.fetch_and_lock_queue_batch TO service_role;
