import { useState, useEffect } from 'react';
import { useAuth } from '../auth/SupabaseAuthContext';
import { settingsService } from '../services/settingsService';
import type { UserSettings } from '../services/settingsService';

const DEFAULT_SETTINGS: UserSettings = {
  userId: '',
  emailNotifications: true,
  pushNotifications: true,
  notificationSms: false,
  currency: 'USD',
  language: 'en-US',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  darkMode: false,
  twoFactorEnabled: false,
  autoScan: true,
  defaultReceiptCurrency: 'USD',
  defaultTaxRate: 0,
  defaultExportFormat: 'pdf',
  includeReceiptImages: true,
  compressUploads: true,
  autoDeleteAfterDays: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function useSettings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Temporarily disabled - using default settings until backend is ready
    setSettings(DEFAULT_SETTINGS);
    setLoading(false);
  }, [currentUser]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    // Temporarily store locally until backend is ready
    const updatedSettings = { ...settings, ...updates };
    setSettings(updatedSettings);
    return updatedSettings;
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
}
