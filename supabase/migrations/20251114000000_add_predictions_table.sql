-- Create predictions table for storing categorization predictions
CREATE TABLE IF NOT EXISTS public.predictions (
  id BIGSERIAL PRIMARY KEY,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('receipt', 'line_item')),
  subject_id UUID NOT NULL,
  category_id INTEGER NOT NULL,
  confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  method TEXT NOT NULL CHECK (method IN ('rule', 'ml', 'llm', 'ensemble')),
  version TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_predictions_subject ON public.predictions(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_predictions_category ON public.predictions(category_id);
CREATE INDEX IF NOT EXISTS idx_predictions_method ON public.predictions(method);
CREATE INDEX IF NOT EXISTS idx_predictions_confidence ON public.predictions(confidence);

-- Add category_id and category_confidence columns to receipts if they don't exist
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS category_id INTEGER,
ADD COLUMN IF NOT EXISTS category_confidence NUMERIC(3,2);

-- Add status column if it doesn't exist
ALTER TABLE public.receipts
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ocr_done', 'categorized', 'completed'));

-- Create index on receipts status for batch processing
CREATE INDEX IF NOT EXISTS idx_receipts_status ON public.receipts(status);
