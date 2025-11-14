-- Add missing columns to receipts_v2 for date and OCR confidence
ALTER TABLE public.receipts_v2
ADD COLUMN IF NOT EXISTS receipt_date DATE,
ADD COLUMN IF NOT EXISTS ocr_confidence NUMERIC,
ADD COLUMN IF NOT EXISTS date TEXT;

-- Create index on receipt_date for faster queries
CREATE INDEX IF NOT EXISTS idx_receipts_v2_receipt_date ON public.receipts_v2(receipt_date DESC);
