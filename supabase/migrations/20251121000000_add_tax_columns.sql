-- Add tax extraction columns to receipts_v2
ALTER TABLE public.receipts_v2
ADD COLUMN IF NOT EXISTS subtotal NUMERIC,
ADD COLUMN IF NOT EXISTS tax NUMERIC,
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_receipts_v2_subtotal ON public.receipts_v2(subtotal DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_v2_tax ON public.receipts_v2(tax DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.receipts_v2.subtotal IS 'Subtotal amount before tax (extracted by Lambda)';
COMMENT ON COLUMN public.receipts_v2.tax IS 'Tax amount (extracted by Lambda)';
COMMENT ON COLUMN public.receipts_v2.tax_rate IS 'Tax rate as decimal (0.06 = 6%, extracted by Lambda)';
