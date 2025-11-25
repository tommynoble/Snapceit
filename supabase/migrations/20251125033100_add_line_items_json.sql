-- Add line_items_json column to receipts_v2 table
-- This column stores the extracted line items from receipts for better Claude reasoning

ALTER TABLE public.receipts_v2 
ADD COLUMN IF NOT EXISTS line_items_json jsonb;

-- Add category_source column to track which method categorized the receipt (rules or claude)
ALTER TABLE public.receipts_v2 
ADD COLUMN IF NOT EXISTS category_source text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_receipts_v2_category_source ON public.receipts_v2(category_source);
