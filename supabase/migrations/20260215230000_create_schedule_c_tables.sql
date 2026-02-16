-- Create schedule_c_reports table
CREATE TABLE IF NOT EXISTS public.schedule_c_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INT NOT NULL,
  gross_income DECIMAL(10, 2) DEFAULT 0,
  total_deductions DECIMAL(10, 2) DEFAULT 0,
  net_profit DECIMAL(10, 2) DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- Enable RLS for schedule_c_reports
ALTER TABLE public.schedule_c_reports ENABLE ROW LEVEL SECURITY;

-- Policy for viewing own reports
CREATE POLICY "Users can view own reports" 
ON public.schedule_c_reports FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for inserting own reports
CREATE POLICY "Users can insert own reports" 
ON public.schedule_c_reports FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for updating own reports
CREATE POLICY "Users can update own reports" 
ON public.schedule_c_reports FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy for deleting own reports
CREATE POLICY "Users can delete own reports" 
ON public.schedule_c_reports FOR DELETE 
USING (auth.uid() = user_id);

-- Create schedule_c_line_items table
CREATE TABLE IF NOT EXISTS public.schedule_c_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.schedule_c_reports(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  tax_code TEXT NOT NULL, -- e.g., 'Line 8', 'Line 24b'
  amount DECIMAL(10, 2) DEFAULT 0,
  deductible_amount DECIMAL(10, 2) DEFAULT 0,
  deduction_rate DECIMAL(3, 2) DEFAULT 1.0, -- Default 100% deductible
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for schedule_c_line_items
ALTER TABLE public.schedule_c_line_items ENABLE ROW LEVEL SECURITY;

-- Policy for viewing own line items (via report owner check)
CREATE POLICY "Users can view own line items" 
ON public.schedule_c_line_items FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.schedule_c_reports r 
  WHERE r.id = report_id AND r.user_id = auth.uid()
));

-- Policy for inserting own line items
CREATE POLICY "Users can insert own line items" 
ON public.schedule_c_line_items FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.schedule_c_reports r 
  WHERE r.id = report_id AND r.user_id = auth.uid()
));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_schedule_c_updated_at
    BEFORE UPDATE ON public.schedule_c_reports
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
