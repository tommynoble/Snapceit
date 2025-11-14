-- Supabase Schema Phase 2: Intelligent Categorization Pipeline
-- Run this AFTER supabase-schema.sql
-- This adds vendor management, predictions, corrections, and enhanced receipt tracking

-- ============================================================================
-- 1) CREATE ENUMS
-- ============================================================================

CREATE TYPE public.prediction_subject AS ENUM ('receipt', 'line_item');
CREATE TYPE public.prediction_method AS ENUM ('rule', 'ml', 'llm', 'ensemble');

-- ============================================================================
-- 2) CREATE REFERENCE TABLES
-- ============================================================================

-- Vendor canonicalization & aliases
CREATE TABLE IF NOT EXISTS public.vendors (
  id BIGSERIAL PRIMARY KEY,
  name_norm TEXT NOT NULL UNIQUE,        -- canonical, lowercase, no punctuation
  aliases TEXT[] DEFAULT '{}',           -- e.g., ['Tesco PLC', 'TESCO', 'Tesco Stores']
  website TEXT,
  country TEXT,                          -- ISO-3166-1 alpha-2 (e.g., 'GB', 'US')
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3) UPDATE EXISTING TABLES
-- ============================================================================

-- Update categories table with tax & hierarchy
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS tax_code TEXT;                    -- e.g., 'HMRC:CostOfGoods' or 'IRS:Meals'
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_deductible BOOLEAN DEFAULT TRUE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 0;         -- ordering

-- Update receipts table with enhanced fields
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS vendor_text TEXT;                   -- raw on-paper vendor name
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS vendor_id BIGINT REFERENCES public.vendors(id) ON DELETE SET NULL;
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2);         -- standardized amount field
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';        -- ISO-4217
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US';          -- ISO-3166-1 alpha-2
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS vendor_normalized TEXT;             -- canonicalized vendor name
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS ocr_confidence NUMERIC(4,3);        -- 0..1 OCR quality
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS category_confidence NUMERIC(4,3);   -- 0..1 prediction confidence
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS quality_score NUMERIC(4,3);         -- image/ocr quality 0..1

-- Update status enum to match Phase 2 workflow
-- Note: existing values (pending, processing, completed) will be migrated
-- New values: ingested, ocr_done, categorized, error
-- Status flow: ingested → ocr_done → categorized

-- ============================================================================
-- 4) CREATE CORE TABLES
-- ============================================================================

-- Individual line items from receipts (normalized, not JSONB)
CREATE TABLE IF NOT EXISTS public.line_items (
  id BIGSERIAL PRIMARY KEY,
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  description TEXT,
  qty NUMERIC(12,3),
  unit_price NUMERIC(12,4),
  total NUMERIC(12,2),
  ocr_span_ref JSONB,                    -- region/blocks from OCR (for debugging)
  category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5) CREATE ML + RULES PLUMBING TABLES
-- ============================================================================

-- Categorization predictions with confidence & method tracking
CREATE TABLE IF NOT EXISTS public.predictions (
  id BIGSERIAL PRIMARY KEY,
  subject_type public.prediction_subject NOT NULL,
  subject_id TEXT NOT NULL,              -- store uuid or bigint as text
  category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  method public.prediction_method NOT NULL,
  version TEXT NOT NULL,                 -- e.g., 'rules@2025-11-08' or 'xgb@1.3.0'
  details JSONB,                         -- optional: feature dumps, reasoning, rule hits
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User corrections for retraining (human-in-the-loop)
CREATE TABLE IF NOT EXISTS public.corrections (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_type public.prediction_subject NOT NULL,
  subject_id TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ML feature cache (optional, for batch scoring)
CREATE TABLE IF NOT EXISTS public.features (
  id BIGSERIAL PRIMARY KEY,
  subject_type public.prediction_subject NOT NULL,
  subject_id TEXT NOT NULL,
  feature_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6) CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_receipts_user ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_vendor_id ON public.receipts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_receipts_category_id ON public.receipts(category_id);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON public.receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON public.receipts(created_at);

CREATE INDEX IF NOT EXISTS idx_line_items_receipt ON public.line_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_line_items_category ON public.line_items(category_id);

CREATE INDEX IF NOT EXISTS idx_predictions_subject ON public.predictions(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_predictions_method ON public.predictions(method);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON public.predictions(created_at);

CREATE INDEX IF NOT EXISTS idx_corrections_user ON public.corrections(user_id);
CREATE INDEX IF NOT EXISTS idx_corrections_subject ON public.corrections(subject_type, subject_id);

CREATE INDEX IF NOT EXISTS idx_vendors_name_norm ON public.vendors(name_norm);
CREATE INDEX IF NOT EXISTS idx_vendors_country ON public.vendors(country);

CREATE INDEX IF NOT EXISTS idx_features_subject ON public.features(subject_type, subject_id);

-- ============================================================================
-- 7) ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8) CREATE RLS POLICIES
-- ============================================================================

-- Line items: follow parent receipt ownership
CREATE POLICY "line_items_select_via_receipt"
  ON public.line_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.receipts r
    WHERE r.id = line_items.receipt_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "line_items_insert_via_receipt"
  ON public.line_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.receipts r
    WHERE r.id = line_items.receipt_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "line_items_update_via_receipt"
  ON public.line_items FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.receipts r
    WHERE r.id = line_items.receipt_id AND r.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.receipts r
    WHERE r.id = line_items.receipt_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "line_items_delete_via_receipt"
  ON public.line_items FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.receipts r
    WHERE r.id = line_items.receipt_id AND r.user_id = auth.uid()
  ));

-- Predictions: readable by owner; inserts/updates typically done by service key
CREATE POLICY "predictions_select_owner"
  ON public.predictions FOR SELECT
  TO authenticated
  USING (
    (subject_type = 'receipt' AND EXISTS (
      SELECT 1 FROM public.receipts r
      WHERE r.id::text = predictions.subject_id AND r.user_id = auth.uid()
    ))
    OR
    (subject_type = 'line_item' AND EXISTS (
      SELECT 1 FROM public.line_items li
      JOIN public.receipts r ON r.id = li.receipt_id
      WHERE li.id::text = predictions.subject_id AND r.user_id = auth.uid()
    ))
  );

-- Service role can insert predictions (bypasses RLS)
CREATE POLICY "predictions_insert_service"
  ON public.predictions FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Corrections: only by owner
CREATE POLICY "corrections_select_owner"
  ON public.corrections FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "corrections_insert_owner"
  ON public.corrections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "corrections_update_owner"
  ON public.corrections FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Features: readable by owner
CREATE POLICY "features_select_owner"
  ON public.features FOR SELECT
  TO authenticated
  USING (
    (subject_type = 'receipt' AND EXISTS (
      SELECT 1 FROM public.receipts r
      WHERE r.id::text = features.subject_id AND r.user_id = auth.uid()
    ))
    OR
    (subject_type = 'line_item' AND EXISTS (
      SELECT 1 FROM public.line_items li
      JOIN public.receipts r ON r.id = li.receipt_id
      WHERE li.id::text = features.subject_id AND r.user_id = auth.uid()
    ))
  );

-- Service role can insert features
CREATE POLICY "features_insert_service"
  ON public.features FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================================
-- 9) INSERT DEFAULT VENDORS (OPTIONAL)
-- ============================================================================

INSERT INTO public.vendors (name_norm, aliases, country) VALUES
('tesco', ARRAY['Tesco PLC', 'TESCO', 'Tesco Stores'], 'GB'),
('sainsburys', ARRAY['Sainsbury''s', 'SAINSBURYS', 'J Sainsbury'], 'GB'),
('asda', ARRAY['ASDA', 'Asda Stores'], 'GB'),
('aldi', ARRAY['ALDI', 'Aldi Stores'], 'GB'),
('lidl', ARRAY['LIDL', 'Lidl GB'], 'GB'),
('shell', ARRAY['Shell', 'SHELL', 'Shell UK'], 'GB'),
('bp', ARRAY['BP', 'British Petroleum'], 'GB'),
('uber', ARRAY['UBER', 'Uber B.V.'], 'US'),
('amazon', ARRAY['AMAZON', 'Amazon.com', 'Amazon UK'], 'US'),
('aws', ARRAY['AWS', 'Amazon Web Services'], 'US')
ON CONFLICT (name_norm) DO NOTHING;

-- ============================================================================
-- 10) UPDATE CATEGORIES WITH TAX CODES (OPTIONAL)
-- ============================================================================

UPDATE public.categories SET tax_code = 'HMRC:CostOfGoods', is_deductible = true WHERE name = 'Food & Dining';
UPDATE public.categories SET tax_code = 'HMRC:Motor', is_deductible = true WHERE name = 'Transportation';
UPDATE public.categories SET tax_code = 'HMRC:Supplies', is_deductible = true WHERE name = 'Business';
UPDATE public.categories SET tax_code = 'HMRC:Utilities', is_deductible = true WHERE name = 'Utilities';
UPDATE public.categories SET tax_code = 'HMRC:Meals', is_deductible = true WHERE name = 'Meals';
UPDATE public.categories SET tax_code = 'HMRC:Travel', is_deductible = true WHERE name = 'Travel';
UPDATE public.categories SET tax_code = 'HMRC:Other', is_deductible = false WHERE name = 'Other';

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- 1. Existing receipts will have NULL for new columns (safe)
-- 2. Status values: migrate pending/processing/completed to ingested/ocr_done/categorized as needed
-- 3. Service role key needed for Edge Functions to insert predictions
-- 4. Run this script with Supabase admin/service role
-- ============================================================================
