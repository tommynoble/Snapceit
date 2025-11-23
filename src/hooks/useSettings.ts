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
    const load = async () => {
      try {
        const cached = localStorage.getItem('user_settings');
        if (cached) {
          const parsed = JSON.parse(cached);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed, userId: currentUser?.id || '' });
        } else {
          setSettings({ ...DEFAULT_SETTINGS, userId: currentUser?.id || '' });
        }
      } catch (err: any) {
        setError(err);
        setSettings({ ...DEFAULT_SETTINGS, userId: currentUser?.id || '' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...updates, userId: currentUser?.id || settings.userId };
    setSettings(updatedSettings);
    try {
      localStorage.setItem('user_settings', JSON.stringify(updatedSettings));
    } catch (err: any) {
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
