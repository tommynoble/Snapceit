import { useState, useEffect } from 'react';
import { useAuth } from '../auth/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

export interface UserSettings {
  userId: string;
  accountType?: string;
  businessName?: string;
  industry?: string;
  employeeCount?: string;
  personalUseCase?: string;
  monthlyReceipts?: string;

  // Notification Preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationSms: boolean;

  // Display Preferences
  currency: string;
  language: string;
  timezone: string;
  darkMode: boolean;

  // App Settings
  autoScan: boolean;

  // Receipt Preferences
  defaultReceiptCurrency: string;
  defaultTaxRate: number;

  // Export Settings
  defaultExportFormat: string;
  includeReceiptImages: boolean;

  // Storage Settings
  compressUploads: boolean;
  autoDeleteAfterDays: number | null;

  // Tax & Business Settings
  businessAddress?: string;
  taxId?: string;
  defaultTaxYear?: number;

  // Metadata
  createdAt?: string;
  updatedAt: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  userId: '',
  emailNotifications: true,
  pushNotifications: true,
  notificationSms: false,
  currency: 'USD',
  language: 'en-US',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  darkMode: false,
  autoScan: true,
  defaultReceiptCurrency: 'USD',
  defaultTaxRate: 0,
  defaultExportFormat: 'pdf',
  includeReceiptImages: true,
  compressUploads: true,
  autoDeleteAfterDays: null,
  businessName: '',
  businessAddress: '',
  taxId: '',
  defaultTaxYear: new Date().getFullYear(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function useSettings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // 1. Try to load from Supabase first (Source of Truth)
        const { data, error: fetchError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (data) {
          // Map snake_case from DB to camelCase for the app
          const dbSettings: UserSettings = {
            ...DEFAULT_SETTINGS,
            userId: currentUser.id,
            accountType: data.account_type,
            businessName: data.business_name,
            industry: data.industry,
            employeeCount: data.employee_count,
            personalUseCase: data.personal_use_case,
            monthlyReceipts: data.monthly_receipts,
            currency: data.currency || DEFAULT_SETTINGS.currency,
            language: data.language || DEFAULT_SETTINGS.language,
            timezone: data.timezone || DEFAULT_SETTINGS.timezone,
            darkMode: data.dark_mode ?? DEFAULT_SETTINGS.darkMode,
            autoScan: data.auto_scan ?? DEFAULT_SETTINGS.autoScan,
            emailNotifications: data.email_notifications ?? DEFAULT_SETTINGS.emailNotifications,
            pushNotifications: data.push_notifications ?? DEFAULT_SETTINGS.pushNotifications,
            notificationSms: data.notification_sms ?? DEFAULT_SETTINGS.notificationSms,
            defaultReceiptCurrency: data.default_receipt_currency || DEFAULT_SETTINGS.defaultReceiptCurrency,
            defaultTaxRate: Number(data.default_tax_rate) || DEFAULT_SETTINGS.defaultTaxRate,
            defaultExportFormat: data.default_export_format || DEFAULT_SETTINGS.defaultExportFormat,
            includeReceiptImages: data.include_receipt_images ?? DEFAULT_SETTINGS.includeReceiptImages,
            compressUploads: data.compress_uploads ?? DEFAULT_SETTINGS.compressUploads,
            autoDeleteAfterDays: data.auto_delete_after_days,
            businessAddress: data.business_address,
            taxId: data.tax_id,
            defaultTaxYear: data.default_tax_year || DEFAULT_SETTINGS.defaultTaxYear,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };

          setSettings(dbSettings);
          localStorage.setItem('user_settings', JSON.stringify(dbSettings));
        } else {
          // 2. Fallback to LocalStorage if no Supabase record yet
          const cached = localStorage.getItem('user_settings');
          if (cached) {
            const parsed = JSON.parse(cached);
            setSettings({ ...DEFAULT_SETTINGS, ...parsed, userId: currentUser.id });
          } else {
            setSettings({ ...DEFAULT_SETTINGS, userId: currentUser.id });
          }
        }
      } catch (err: any) {
        console.error('Error loading settings:', err);
        setError(err);
        // Fallback to local storage on error
        const cached = localStorage.getItem('user_settings');
        if (cached) {
          const parsed = JSON.parse(cached);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed, userId: currentUser.id });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!currentUser) return settings;

    const updatedSettings = { ...settings, ...updates, userId: currentUser.id };
    setSettings(updatedSettings);

    try {
      // 1. Update LocalStorage for immediate UI feedback/offline
      localStorage.setItem('user_settings', JSON.stringify(updatedSettings));

      // 2. Update Supabase
      const dbUpdates: any = {};
      if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.autoScan !== undefined) dbUpdates.auto_scan = updates.autoScan;
      if (updates.taxId !== undefined) dbUpdates.tax_id = updates.taxId;
      if (updates.defaultTaxYear !== undefined) dbUpdates.default_tax_year = updates.defaultTaxYear;
      if (updates.accountType !== undefined) dbUpdates.account_type = updates.accountType;
      if (updates.industry !== undefined) dbUpdates.industry = updates.industry;
      // ... add more mappings as needed

      const { error: updateError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: currentUser.id,
          ...dbUpdates,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setError(err);
    }
    return updatedSettings;
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
}
