-- Supabase Schema for Snapceit
-- Run this in your Supabase SQL Editor

-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS tags_id_seq;
CREATE SEQUENCE IF NOT EXISTS exchange_rates_id_seq;

-- 1. Tables with no dependencies
CREATE TABLE IF NOT EXISTS public.categories (
  id integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  description text,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.currencies (
  code text NOT NULL,
  name text NOT NULL,
  symbol text NOT NULL,
  CONSTRAINT currencies_pkey PRIMARY KEY (code)
);

-- 2. Tables that depend on auth.users
CREATE TABLE IF NOT EXISTS public.receipts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  merchant text,
  amount numeric,
  amount_currency text DEFAULT 'USD'::text,
  category text,
  is_deductible boolean DEFAULT false,
  tax_amount numeric,
  receipt_date date,
  status text DEFAULT 'pending'::text,
  items jsonb,
  image_url text,
  raw_ocr jsonb,
  processing_logs jsonb,
  notes text,
  business_category text,
  tax_deductible boolean DEFAULT false,
  total numeric,
  tax jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT receipts_pkey PRIMARY KEY (id),
  CONSTRAINT receipts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT receipts_amount_currency_fkey FOREIGN KEY (amount_currency) REFERENCES public.currencies(code),
  CONSTRAINT receipts_category_fkey FOREIGN KEY (category) REFERENCES public.categories(name)
);

CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text,
  amount numeric NOT NULL,
  period text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT budgets_pkey PRIMARY KEY (id),
  CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT budgets_category_fkey FOREIGN KEY (category) REFERENCES public.categories(name)
);

CREATE TABLE IF NOT EXISTS public.tags (
  id integer NOT NULL DEFAULT nextval('tags_id_seq'::regclass),
  user_id uuid NOT NULL,
  name text NOT NULL,
  CONSTRAINT tags_pkey PRIMARY KEY (id),
  CONSTRAINT tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text NOT NULL,
  remind_at timestamp with time zone NOT NULL,
  is_sent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reminders_pkey PRIMARY KEY (id),
  CONSTRAINT reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  file_url text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  receipt_id uuid,
  file_url text NOT NULL,
  file_type text,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT files_pkey PRIMARY KEY (id),
  CONSTRAINT files_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT files_receipt_id_fkey FOREIGN KEY (receipt_id) REFERENCES public.receipts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.tax_summaries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  year integer NOT NULL,
  total_income numeric,
  total_deductions numeric,
  calculated_tax numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tax_summaries_pkey PRIMARY KEY (id),
  CONSTRAINT tax_summaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid NOT NULL,
  theme text DEFAULT 'light'::text,
  notification_email text,
  preferred_currency text DEFAULT 'USD'::text,
  CONSTRAINT user_settings_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.user_usage_stats (
  user_id uuid NOT NULL,
  total_receipts_scanned integer DEFAULT 0,
  total_expense_amount numeric DEFAULT 0,
  storage_used_mb numeric DEFAULT 0,
  CONSTRAINT user_usage_stats_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_usage_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.login_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  login_timestamp timestamp with time zone DEFAULT now(),
  ip_address text,
  CONSTRAINT login_history_pkey PRIMARY KEY (id),
  CONSTRAINT login_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id integer NOT NULL DEFAULT nextval('exchange_rates_id_seq'::regclass),
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  rate numeric NOT NULL,
  fetched_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exchange_rates_pkey PRIMARY KEY (id),
  CONSTRAINT exchange_rates_from_currency_fkey FOREIGN KEY (from_currency) REFERENCES public.currencies(code),
  CONSTRAINT exchange_rates_to_currency_fkey FOREIGN KEY (to_currency) REFERENCES public.currencies(code)
);

-- 3. Junction tables (after main tables exist)
CREATE TABLE IF NOT EXISTS public.receipt_tags (
  receipt_id uuid NOT NULL,
  tag_id integer NOT NULL,
  CONSTRAINT receipt_tags_pkey PRIMARY KEY (receipt_id, tag_id),
  CONSTRAINT receipt_tags_receipt_id_fkey FOREIGN KEY (receipt_id) REFERENCES public.receipts(id) ON DELETE CASCADE,
  CONSTRAINT receipt_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE
);

-- 4. Insert default data
INSERT INTO public.currencies (code, name, symbol) VALUES
('USD', 'US Dollar', '$'),
('EUR', 'Euro', '€'),
('GBP', 'British Pound', '£'),
('JPY', 'Japanese Yen', '¥'),
('CAD', 'Canadian Dollar', '$'),
('AUD', 'Australian Dollar', '$')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, description) VALUES
('Food & Dining', 'Restaurants, groceries, food delivery'),
('Transportation', 'Gas, parking, public transit, rideshare'),
('Shopping', 'Retail, clothing, household items'),
('Entertainment', 'Movies, events, subscriptions'),
('Utilities', 'Electricity, water, internet, phone'),
('Healthcare', 'Medical, pharmacy, wellness'),
('Travel', 'Hotels, flights, vacation'),
('Business', 'Office supplies, equipment'),
('Other', 'Miscellaneous expenses')
ON CONFLICT DO NOTHING;

-- 5. Enable Row Level Security
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_tags ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
-- Receipts policies
CREATE POLICY "Users can view own receipts" ON public.receipts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON public.receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receipts" ON public.receipts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receipts" ON public.receipts
  FOR DELETE USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can manage own budgets" ON public.budgets
  FOR ALL USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can manage own tags" ON public.tags
  FOR ALL USING (auth.uid() = user_id);

-- Reminders policies
CREATE POLICY "Users can manage own reminders" ON public.reminders
  FOR ALL USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can manage own documents" ON public.documents
  FOR ALL USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can manage own files" ON public.files
  FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Tax summaries policies
CREATE POLICY "Users can manage own tax summaries" ON public.tax_summaries
  FOR ALL USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- User usage stats policies
CREATE POLICY "Users can view own stats" ON public.user_usage_stats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.user_usage_stats
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.user_usage_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Login history policies
CREATE POLICY "Users can view own login history" ON public.login_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert login history" ON public.login_history
  FOR INSERT WITH CHECK (true);

-- Audit logs policies (admins only, but allow system inserts)
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Receipt tags policies
CREATE POLICY "Users can manage tags for own receipts" ON public.receipt_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.receipts 
      WHERE receipts.id = receipt_tags.receipt_id 
      AND receipts.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON public.receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_receipts_category ON public.receipts(category);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_files_receipt_id ON public.files(receipt_id);
