import { useState, useEffect } from 'react';
import { useAuth } from '../auth/CognitoAuthContext';
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
    async function loadSettings() {
      if (!currentUser) {
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
        return;
      }

      try {
        const userSettings = await settingsService.getUserSettings(currentUser.uid);
        if (userSettings) {
          setSettings(userSettings);
        } else {
          // Create default settings if none exist
          const defaultSettings = await settingsService.createUserSettings(currentUser.uid, DEFAULT_SETTINGS);
          setSettings(defaultSettings);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load settings'));
        // Still use default settings on error
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [currentUser]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!currentUser) return;

    try {
      const updatedSettings = await settingsService.updateUserSettings(currentUser.uid, updates);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update settings'));
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
}
