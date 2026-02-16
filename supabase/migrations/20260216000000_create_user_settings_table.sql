-- Create user_settings table for unified storage of onboarding and app preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    account_type TEXT,
    business_name TEXT,
    industry TEXT,
    employee_count TEXT,
    personal_use_case TEXT,
    monthly_receipts TEXT,
    currency TEXT DEFAULT 'USD',
    language TEXT DEFAULT 'en-US',
    timezone TEXT DEFAULT 'UTC',
    dark_mode BOOLEAN DEFAULT FALSE,
    auto_scan BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    notification_sms BOOLEAN DEFAULT FALSE,
    default_receipt_currency TEXT DEFAULT 'USD',
    default_tax_rate NUMERIC(4, 2) DEFAULT 0,
    default_export_format TEXT DEFAULT 'pdf',
    include_receipt_images BOOLEAN DEFAULT TRUE,
    compress_uploads BOOLEAN DEFAULT TRUE,
    auto_delete_after_days INTEGER,
    business_address TEXT,
    tax_id TEXT, -- EIN or SSN
    default_tax_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Migration: Create policies
CREATE POLICY "Users can view own settings" 
ON public.user_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" 
ON public.user_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" 
ON public.user_settings FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
