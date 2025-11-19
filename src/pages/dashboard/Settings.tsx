import React, { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { useToast } from '../../hooks/useToast';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { 
  BellIcon, 
  GlobeAltIcon, 
  DocumentIcon, 
  ClockIcon,
  CloudArrowUpIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { settingsService, UserSettings } from '../../services/settingsService';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function Settings() {
  const { showToast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    emailNotifications: true,
    pushNotifications: true,
    notificationSms: false,
    currency: 'USD',
    language: 'English',
    darkMode: false,
    autoScan: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    defaultTaxRate: 0,
    defaultExportFormat: 'pdf',
    includeReceiptImages: true,
    compressUploads: true,
    autoDeleteAfterDays: null,
  });

  useEffect(() => {
    // Wait for auth to be initialized
    if (authLoading) return;

    // Redirect if not logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const loadSettings = async () => {
      try {
        console.log('Loading settings for user:', currentUser.uid);
        const userSettings = await settingsService.getUserSettings(currentUser.uid);
        console.log('Fetched settings:', userSettings);
        
        if (userSettings) {
          setSettings(userSettings);
        } else {
          console.log('No existing settings found, creating defaults');
          const defaultSettings = await settingsService.createUserSettings(currentUser.uid, settings);
          console.log('Created default settings:', defaultSettings);
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Failed to load settings', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [currentUser, authLoading, navigate]);

  const handleSettingChange = async (key: string, value: boolean | string | number | null) => {
    if (!currentUser) {
      showToast('Please log in to save settings', 'error');
      return;
    }

    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      await settingsService.updateUserSettings(currentUser.uid, { [key]: value });
      showToast('Settings updated successfully', 'success');
    } catch (error) {
      console.error('Error updating setting:', error);
      showToast('Failed to update settings', 'error');
      // Revert the setting if update failed
      setSettings(prev => ({ ...prev, [key]: settings[key as keyof UserSettings] }));
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-4">
        <DashboardHeader
          title="Settings"
          description="Loading your preferences..."
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <DashboardHeader
        title="Settings"
        description="Customize your receipt scanner experience"
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Account & Notifications */}
          <div className="bg-white/10 backdrop-blur-xl shadow-xl rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors duration-300 h-[400px]">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                  <BellIcon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Account & Notifications</h2>
                  <p className="text-purple-200/80 text-sm">Manage how you receive updates</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(400px-4rem)]">
              {/* Notification Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors duration-300">
                  <div>
                    <h3 className="text-base font-medium text-white">Email Notifications</h3>
                    <p className="text-purple-200/80 text-xs mt-1">Get updates via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications || false}
                    onChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    className={`${
                      settings.emailNotifications ? 'bg-purple-600' : 'bg-white/10'
                    } relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none`}
                  >
                    <span className="sr-only">Enable email notifications</span>
                    <span
                      className={`${
                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors duration-300">
                  <div>
                    <h3 className="text-base font-medium text-white">Push Notifications</h3>
                    <p className="text-purple-200/80 text-xs mt-1">Instant updates on your device</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications || false}
                    onChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    className={`${
                      settings.pushNotifications ? 'bg-purple-600' : 'bg-white/10'
                    } relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none`}
                  >
                    <span className="sr-only">Enable push notifications</span>
                    <span
                      className={`${
                        settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors duration-300">
                  <div>
                    <h3 className="text-base font-medium text-white">SMS Notifications</h3>
                    <p className="text-purple-200/80 text-xs mt-1">Get text message updates</p>
                  </div>
                  <Switch
                    checked={settings.notificationSms || false}
                    onChange={(checked) => handleSettingChange('notificationSms', checked)}
                    className={`${
                      settings.notificationSms ? 'bg-purple-600' : 'bg-white/10'
                    } relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none`}
                  >
                    <span className="sr-only">Enable SMS notifications</span>
                    <span
                      className={`${
                        settings.notificationSms ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance & Region */}
          <div className="bg-white/10 backdrop-blur-xl shadow-xl rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors duration-300 h-[400px]">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                  <GlobeAltIcon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Appearance & Region</h2>
                  <p className="text-purple-200/80 text-sm">Customize your display preferences</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(400px-4rem)]">
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg border border-white/5 p-3 hover:border-purple-500/30 transition-colors duration-300">
                  <label htmlFor="language" className="block text-base font-medium text-white mb-1">
                    Language
                  </label>
                  <select
                    id="language"
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 text-base"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>

                <div className="bg-white/5 rounded-lg border border-white/5 p-3 hover:border-purple-500/30 transition-colors duration-300">
                  <label htmlFor="timezone" className="block text-base font-medium text-white mb-1">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 text-base"
                  >
                    {[
                      'America/New_York',
                      'America/Chicago',
                      'America/Denver',
                      'America/Los_Angeles',
                      'Europe/London',
                      'Europe/Paris',
                      'Asia/Tokyo',
                      'Australia/Sydney'
                    ].map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors duration-300">
                  <div>
                    <h3 className="text-base font-medium text-white">Dark Mode</h3>
                    <p className="text-purple-200/80 text-xs mt-1">Use dark theme</p>
                  </div>
                  <Switch
                    checked={settings.darkMode || false}
                    onChange={(checked) => handleSettingChange('darkMode', checked)}
                    className={`${
                      settings.darkMode ? 'bg-purple-600' : 'bg-white/10'
                    } relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none`}
                  >
                    <span className="sr-only">Enable dark mode</span>
                    <span
                      className={`${
                        settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Receipt Settings */}
          <div className="bg-white/10 backdrop-blur-xl shadow-xl rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors duration-300 h-[400px]">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                  <DocumentIcon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Receipt Settings</h2>
                  <p className="text-purple-200/80 text-sm">Configure receipt processing preferences</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(400px-4rem)]">
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg border border-white/5 p-3 hover:border-purple-500/30 transition-colors duration-300">
                  <label htmlFor="currency" className="block text-base font-medium text-white mb-1">
                    Default Currency
                  </label>
                  <select
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 text-base"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>

                <div className="bg-white/5 rounded-lg border border-white/5 p-3 hover:border-purple-500/30 transition-colors duration-300">
                  <label htmlFor="taxRate" className="block text-base font-medium text-white mb-1">
                    Default Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    id="taxRate"
                    value={settings.defaultTaxRate}
                    onChange={(e) => handleSettingChange('defaultTaxRate', parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 text-base"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors duration-300">
                  <div>
                    <h3 className="text-base font-medium text-white">Auto-Scan Receipts</h3>
                    <p className="text-purple-200/80 text-xs mt-1">Automatically process new receipts</p>
                  </div>
                  <Switch
                    checked={settings.autoScan || false}
                    onChange={(checked) => handleSettingChange('autoScan', checked)}
                    className={`${
                      settings.autoScan ? 'bg-purple-600' : 'bg-white/10'
                    } relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none`}
                  >
                    <span className="sr-only">Enable auto-scan</span>
                    <span
                      className={`${
                        settings.autoScan ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
          </div>

          {/* Storage & Export */}
          <div className="bg-white/10 backdrop-blur-xl shadow-xl rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors duration-300 h-[400px]">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                  <CloudArrowUpIcon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Storage & Export</h2>
                  <p className="text-purple-200/80 text-sm">Manage storage and export options</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(400px-4rem)]">
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg border border-white/5 p-3 hover:border-purple-500/30 transition-colors duration-300">
                  <label htmlFor="exportFormat" className="block text-base font-medium text-white mb-1">
                    Default Export Format
                  </label>
                  <select
                    id="exportFormat"
                    value={settings.defaultExportFormat}
                    onChange={(e) => handleSettingChange('defaultExportFormat', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 text-base"
                  >
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors duration-300">
                  <div>
                    <h3 className="text-base font-medium text-white">Include Receipt Images</h3>
                    <p className="text-purple-200/80 text-xs mt-1">Add images to exports</p>
                  </div>
                  <Switch
                    checked={settings.includeReceiptImages || false}
                    onChange={(checked) => handleSettingChange('includeReceiptImages', checked)}
                    className={`${
                      settings.includeReceiptImages ? 'bg-purple-600' : 'bg-white/10'
                    } relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none`}
                  >
                    <span className="sr-only">Include receipt images in exports</span>
                    <span
                      className={`${
                        settings.includeReceiptImages ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors duration-300">
                  <div>
                    <h3 className="text-base font-medium text-white">Compress Uploads</h3>
                    <p className="text-purple-200/80 text-xs mt-1">Reduce storage usage</p>
                  </div>
                  <Switch
                    checked={settings.compressUploads || false}
                    onChange={(checked) => handleSettingChange('compressUploads', checked)}
                    className={`${
                      settings.compressUploads ? 'bg-purple-600' : 'bg-white/10'
                    } relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none`}
                  >
                    <span className="sr-only">Enable upload compression</span>
                    <span
                      className={`${
                        settings.compressUploads ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="bg-white/5 rounded-lg border border-white/5 p-3 hover:border-purple-500/30 transition-colors duration-300">
                  <label htmlFor="autoDelete" className="block text-base font-medium text-white mb-1">
                    Auto-Delete After Days
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="autoDelete"
                      value={settings.autoDeleteAfterDays || ''}
                      onChange={(e) => handleSettingChange('autoDeleteAfterDays', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 pr-14 text-base"
                      min="0"
                      placeholder="Never"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-purple-200 text-sm">days</span>
                    </div>
                  </div>
                  <p className="text-purple-200/80 text-xs mt-1">Leave empty to never auto-delete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
