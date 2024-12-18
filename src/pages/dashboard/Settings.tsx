import React, { useEffect, useState } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import { UserSettings } from '../../types/settings';
import { 
  Bell, 
  Globe, 
  Languages, 
  CreditCard, 
  Shield, 
  FileText, 
  Tags,
  Download,
  HardDrive,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

export function Settings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentUser) return;
      
      try {
        // TODO: Replace with actual API call to fetch user settings
        const userSettings: UserSettings = {
          userId: currentUser.uid,
          email: currentUser.email || '',
          firstName: currentUser.displayName?.split(' ')[0] || '',
          lastName: currentUser.displayName?.split(' ')[1] || '',
          accountStatus: 'active',
          emailVerified: currentUser.emailVerified,
          twoFactorEnabled: false,
          preferredCurrency: 'USD',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          subscriptionPlan: 'free',
          subscriptionStatus: 'active',
          notificationPreferences: {
            email: true,
            push: true,
            sms: false,
            receiptScanned: true,
            monthlyReport: true,
            budgetAlerts: true
          },
          defaultCategories: ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Bills'],
          customCategories: [],
          exportPreferences: {
            format: 'pdf',
            frequency: 'monthly',
            includeReceipts: true,
            includeSummary: true
          },
          totalReceiptsScanned: 0,
          totalExpenseAmount: 0,
          storageUsed: 0,
          lastLoginDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setSettings(userSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!settings) {
    return <div>Error loading settings</div>;
  }

  const SettingsSection = ({ 
    title, 
    icon: Icon, 
    children 
  }: { 
    title: string; 
    icon: React.ElementType; 
    children: React.ReactNode; 
  }) => (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Information */}
        <SettingsSection title="Account Information" icon={Shield}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70">Email</label>
              <p className="text-white">{settings.email}</p>
            </div>
            <div>
              <label className="block text-sm text-white/70">Name</label>
              <p className="text-white">{`${settings.firstName} ${settings.lastName}`}</p>
            </div>
            <div>
              <label className="block text-sm text-white/70">Account Status</label>
              <p className="text-white capitalize">{settings.accountStatus}</p>
            </div>
            <div>
              <label className="block text-sm text-white/70">Email Verification</label>
              <p className="text-white">{settings.emailVerified ? 'Verified' : 'Not Verified'}</p>
            </div>
            <div>
              <label className="block text-sm text-white/70">Two-Factor Authentication</label>
              <p className="text-white">{settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title="Preferences" icon={Globe}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70">Preferred Currency</label>
              <p className="text-white">{settings.preferredCurrency}</p>
            </div>
            <div>
              <label className="block text-sm text-white/70">Language</label>
              <p className="text-white capitalize">{settings.language}</p>
            </div>
            <div>
              <label className="block text-sm text-white/70">Timezone</label>
              <p className="text-white">{settings.timezone}</p>
            </div>
          </div>
        </SettingsSection>

        {/* Subscription */}
        <SettingsSection title="Subscription" icon={CreditCard}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70">Current Plan</label>
              <p className="text-white capitalize">{settings.subscriptionPlan}</p>
            </div>
            <div>
              <label className="block text-sm text-white/70">Status</label>
              <p className="text-white capitalize">{settings.subscriptionStatus}</p>
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" icon={Bell}>
          <div className="space-y-4">
            {Object.entries(settings.notificationPreferences).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    checked={value}
                    onChange={() => {}} // TODO: Implement change handler
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
            ))}
          </div>
        </SettingsSection>

        {/* Categories */}
        <SettingsSection title="Categories" icon={Tags}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70">Default Categories</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {settings.defaultCategories.map(category => (
                  <span key={category} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                    {category}
                  </span>
                ))}
              </div>
            </div>
            {settings.customCategories.length > 0 && (
              <div>
                <label className="block text-sm text-white/70">Custom Categories</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.customCategories.map(category => (
                    <span key={category} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SettingsSection>

        {/* Export Preferences */}
        <SettingsSection title="Export Preferences" icon={Download}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70">Format</label>
              <p className="text-white uppercase">{settings.exportPreferences.format}</p>
            </div>
            <div>
              <label className="block text-sm text-white/70">Frequency</label>
              <p className="text-white capitalize">{settings.exportPreferences.frequency}</p>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-white">Include Receipts</label>
              <input 
                type="checkbox" 
                checked={settings.exportPreferences.includeReceipts}
                onChange={() => {}} // TODO: Implement change handler
                className="form-checkbox h-5 w-5 text-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-white">Include Summary</label>
              <input 
                type="checkbox" 
                checked={settings.exportPreferences.includeSummary}
                onChange={() => {}} // TODO: Implement change handler
                className="form-checkbox h-5 w-5 text-blue-500"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Usage Statistics */}
        <SettingsSection title="Usage Statistics" icon={HardDrive}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70">Total Receipts Scanned</label>
              <p className="text-white">{settings.totalReceiptsScanned}</p>
            </div>
            <div>
              <label className="block text-sm text-white/70">Total Expense Amount</label>
              <p className="text-white">
                ${settings.totalExpenseAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm text-white/70">Storage Used</label>
              <p className="text-white">
                {(settings.storageUsed / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Account Activity */}
        <SettingsSection title="Account Activity" icon={Clock}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70">Last Login</label>
              <p className="text-white">
                {format(new Date(settings.lastLoginDate), 'PPpp')}
              </p>
            </div>
            <div>
              <label className="block text-sm text-white/70">Account Created</label>
              <p className="text-white">
                {format(new Date(settings.createdAt), 'PPpp')}
              </p>
            </div>
            <div>
              <label className="block text-sm text-white/70">Last Updated</label>
              <p className="text-white">
                {format(new Date(settings.updatedAt), 'PPpp')}
              </p>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
