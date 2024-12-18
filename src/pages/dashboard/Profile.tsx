import React, { useState } from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { UserProfile } from '../../types/user';
import { Switch } from '@headlessui/react';
import { PencilIcon, BellIcon, DocumentIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    userId: 'user-123',
    email: 'user@example.com',
    firstName: 'Thomas',
    lastName: 'Asante',
    accountStatus: 'active',
    emailVerified: false,
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
  });

  const toggleNotification = (key: keyof typeof profile.notificationPreferences) => {
    setProfile(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key]
      }
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <DashboardHeader title="Profile Settings" />
      
      <div className="p-6 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-lg p-4 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <DocumentIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Receipts</p>
              <p className="text-lg font-semibold text-gray-900">{profile.totalReceiptsScanned}</p>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-xl rounded-lg p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <UserCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Type</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{profile.subscriptionPlan}</p>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-xl rounded-lg p-4 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DocumentIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-lg font-semibold text-gray-900">{formatBytes(profile.storageUsed)}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <section>
          <SectionHeader 
            icon={<UserCircleIcon className="w-6 h-6 text-white" />}
            title="Personal Information"
          />
          <div className="bg-white/90 backdrop-blur-xl rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">First Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.firstName}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900"
                      readOnly
                    />
                    <button className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900"
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.lastName}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900"
                      readOnly
                    />
                    <button className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Timezone</label>
                  <select
                    value={profile.timezone}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900"
                  >
                    <option value={profile.timezone}>{profile.timezone}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notification Preferences */}
        <section>
          <SectionHeader 
            icon={<BellIcon className="w-6 h-6 text-white" />}
            title="Notification Preferences"
          />
          <div className="bg-white/90 backdrop-blur-xl rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(profile.notificationPreferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-gray-900 font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <p className="text-sm text-gray-600">
                      {value ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onChange={() => toggleNotification(key as keyof typeof profile.notificationPreferences)}
                    className={`${
                      value ? 'bg-purple-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                  >
                    <span
                      className={`${
                        value ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Export Preferences */}
        <section>
          <SectionHeader 
            icon={<DocumentIcon className="w-6 h-6 text-white" />}
            title="Export Settings"
          />
          <div className="bg-white/90 backdrop-blur-xl rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Export Format</label>
                  <select
                    value={profile.exportPreferences.format}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900"
                  >
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Export Frequency</label>
                  <select
                    value={profile.exportPreferences.frequency}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Include in Export</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={profile.exportPreferences.includeReceipts}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-gray-700">Receipt Images</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={profile.exportPreferences.includeSummary}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-gray-700">Summary Report</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Activity */}
        <section>
          <SectionHeader 
            icon={<UserCircleIcon className="w-6 h-6 text-white" />}
            title="Account Activity"
          />
          <div className="bg-white/90 backdrop-blur-xl rounded-lg divide-y divide-gray-100">
            <div className="p-4">
              <p className="text-sm text-gray-600">Last Login</p>
              <p className="text-gray-900 font-medium">{formatDate(profile.lastLoginDate)}</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">Account Created</p>
              <p className="text-gray-900 font-medium">{formatDate(profile.createdAt)}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
