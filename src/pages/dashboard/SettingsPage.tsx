import React, { useState } from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { User, Bell, Database, FileText, Trash2, Download, DollarSign } from 'lucide-react';
import { useAuth } from '../../auth/CognitoAuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import defaultAvatar from '../../assets/default-avatar.svg';

export function SettingsPage() {
  const { currentUser } = useAuth();
  const { currency, setCurrency, loading } = useCurrency();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoCategories: true
  });
  const [uploading, setUploading] = useState(false);

  const handleSettingChange = (setting: string) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      await setCurrency(newCurrency);
    } catch (error) {
      console.error('Error updating currency:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      if (!currentUser?.idToken) throw new Error('No auth token');

      // Get upload URL
      const { uploadUrl, url } = await api.profile.getUploadUrl(
        file.name,
        file.type,
        currentUser.idToken
      );

      // Upload to S3
      await api.upload.uploadToS3(uploadUrl, file);

      // Update profile with new photo URL
      await api.profile.updateProfile(url, currentUser.idToken);

      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to update profile photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader userName="Thomas" onProfileClick={() => {}} />
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-[#00E5FF]" />
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col items-center p-6 bg-white/5 rounded-lg">
              <div className="relative group">
                <img
                  src={currentUser?.photoURL || defaultAvatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover bg-gray-700"
                />
                <label
                  className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-full 
                           opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity
                           ${uploading ? 'cursor-wait' : 'cursor-pointer'}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                  />
                  <div className="text-white text-sm">
                    {uploading ? 'Uploading...' : 'Change Photo'}
                  </div>
                </label>
              </div>
              <div className="mt-4 text-center">
                <p className="text-white">{currentUser?.email}</p>
                <p className="text-white/60 text-sm">
                  Member since {new Date(currentUser?.createdAt || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-[#00E5FF]" />
            <h2 className="text-2xl font-bold text-white">Preferences</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h3 className="text-white font-medium">Email Notifications</h3>
                <p className="text-white/60 text-sm">Receive email updates about your account</p>
              </div>
              <button
                onClick={() => handleSettingChange('emailNotifications')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  settings.emailNotifications ? 'bg-[#00E5FF]' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h3 className="text-white font-medium">Automatic Categories</h3>
                <p className="text-white/60 text-sm">Automatically categorize new receipts</p>
              </div>
              <button
                onClick={() => handleSettingChange('autoCategories')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  settings.autoCategories ? 'bg-[#00E5FF]' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                    settings.autoCategories ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h3 className="text-white font-medium">Currency</h3>
                <p className="text-white/60 text-sm">Select your preferred currency</p>
              </div>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                disabled={loading}
                className={`bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00E5FF] ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-[#00E5FF]" />
            <h2 className="text-2xl font-bold text-white">Data Management</h2>
          </div>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-white/60" />
                <div className="text-left">
                  <p className="text-white">Export Data</p>
                  <p className="text-white/60 text-sm">Download your receipt data</p>
                </div>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-white/60" />
                <div className="text-left">
                  <p className="text-white">Generate Report</p>
                  <p className="text-white/60 text-sm">Create a detailed spending report</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Danger Zone</h2>
          </div>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-400" />
                <div className="text-left">
                  <p className="text-white">Delete Account</p>
                  <p className="text-white/60 text-sm">Permanently delete your account and data</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
