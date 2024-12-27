import React, { useState } from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import {
  PencilIcon,
  DocumentIcon,
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/CognitoAuthContext';
import { useSettings } from '../../hooks/useSettings';
import { useCurrency } from '../../hooks/useCurrency';
import { ContentContainer } from '../../components/template/ContentContainer';
import toast from 'react-hot-toast';
import type { UserProfile } from '../../types/user';
import { settingsService } from '../../services/settingsService';

interface ProfileState extends UserProfile {
  // Additional fields can be added here
}

interface EditableField {
  field: keyof ProfileState;
  value: string;
}

export const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings } = useSettings();
  const { formatCurrency } = useCurrency();
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [profile, setProfile] = useState<ProfileState>({
    userId: currentUser?.uid || '',
    email: currentUser?.email || '',
    firstName: '',
    lastName: '',
    accountStatus: 'active',
    emailVerified: false,
    twoFactorEnabled: false,
    preferredCurrency: settings?.currency || 'USD',
    language: settings?.language || 'en-US',
    timezone: settings?.timezone || 'UTC',
    subscriptionPlan: 'free',
    subscriptionStatus: 'active',
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
      receiptScanned: true,
      monthlyReport: true,
      budgetAlerts: true,
    },
    defaultCategories: [],
    customCategories: [],
    exportPreferences: {
      format: 'pdf',
      includeImages: true,
      compression: true,
    },
    totalReceiptsScanned: 0,
    totalExpenseAmount: 0,
    storageUsed: 0,
    lastLoginDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEdit = (field: keyof ProfileState) => {
    setEditing({ field, value: String(profile[field]) });
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      // Update DynamoDB using settingsService
      const updatedSettings = await settingsService.updateUserSettings(currentUser.uid, {
        [editing.field]: editing.value,
      });

      setProfile(prev => ({
        ...prev,
        [editing.field]: editing.value,
        updatedAt: new Date().toISOString(),
      }));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setEditing(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
  };

  const handleToggleNotification = async (key: string) => {
    try {
      const updatedPreferences = {
        ...profile.notificationPreferences,
        [key]: !profile.notificationPreferences[key as keyof typeof profile.notificationPreferences],
      };
      
      // Update DynamoDB using settingsService
      await settingsService.updateUserSettings(currentUser.uid, {
        notificationPreferences: updatedPreferences,
      });
      
      setProfile(prev => ({
        ...prev,
        notificationPreferences: updatedPreferences,
        updatedAt: new Date().toISOString(),
      }));
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update notification preferences');
      console.error('Error updating notification preferences:', error);
    }
  };

  const renderEditableField = (label: string, field: keyof ProfileState) => (
    <div>
      <label className="block text-sm text-white/60 mb-1">{label}</label>
      <div className="relative">
        {editing?.field === field ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={editing.value}
              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={String(profile[field])}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
              readOnly
            />
            <button
              onClick={() => handleEdit(field)}
              className="p-2 bg-white/5 text-white/40 rounded-lg hover:bg-white/10 hover:text-white/60"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Profile" 
        description="Manage your personal information and preferences"
      />
      
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 flex items-center gap-4">
            <div className="bg-purple-500/40 p-3 rounded-lg">
              <DocumentIcon className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Receipts</p>
              <p className="text-lg font-semibold text-white">{profile.totalReceiptsScanned}</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 flex items-center gap-4">
            <div className="bg-blue-500/40 p-3 rounded-lg">
              <UserCircleIcon className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Expenses</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(profile.totalExpenseAmount)}
              </p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 flex items-center gap-4">
            <div className="bg-green-500/40 p-3 rounded-lg">
              <DocumentIcon className="w-6 h-6 text-green-200" />
            </div>
            <div>
              <p className="text-sm text-white/60">Storage Used</p>
              <p className="text-lg font-semibold text-white">{formatBytes(profile.storageUsed)}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <ContentContainer
          title="Personal Information"
          icon={<UserCircleIcon className="w-6 h-6 text-white" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {renderEditableField('First Name', 'firstName')}
              <div>
                <label className="block text-sm text-white/60 mb-1">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                    readOnly
                  />
                  {profile.emailVerified && (
                    <div className="absolute right-2 top-2 text-green-500">
                      <ShieldCheckIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {renderEditableField('Last Name', 'lastName')}
              <div>
                <label className="block text-sm text-white/60 mb-1">Account Status</label>
                <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg inline-block">
                  {profile.accountStatus.charAt(0).toUpperCase() + profile.accountStatus.slice(1)}
                </div>
              </div>
            </div>
          </div>
        </ContentContainer>

        {/* Notification Preferences */}
        <ContentContainer
          title="Notification Preferences"
          icon={<BellIcon className="w-6 h-6 text-white" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(profile.notificationPreferences).map(([key, enabled]) => (
              <button
                key={key}
                onClick={() => handleToggleNotification(key)}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="text-sm text-white/60 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className={`w-4 h-4 rounded-full ${
                  enabled ? 'bg-green-500' : 'bg-white/20'
                }`} />
              </button>
            ))}
          </div>
        </ContentContainer>

        {/* Account History */}
        <ContentContainer
          title="Account History"
          icon={<ClockIcon className="w-6 h-6 text-white" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/60 mb-1">Account Created</label>
              <div className="px-4 py-2 bg-white/5 text-white rounded-lg">
                {formatDate(profile.createdAt)}
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Last Login</label>
              <div className="px-4 py-2 bg-white/5 text-white rounded-lg">
                {formatDate(profile.lastLoginDate)}
              </div>
            </div>
          </div>
        </ContentContainer>
      </div>
    </div>
  );
};
