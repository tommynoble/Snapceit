import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { 
  KeyIcon,
  CreditCardIcon,
  DocumentIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useReceipts } from '../../components/dashboard/receipts/ReceiptContext';
import JSZip from 'jszip';

export function SettingsNew() {
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const { receipts } = useReceipts();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  // Account Settings State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [emailData, setEmailData] = useState({ new: '' });
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  // Receipt Preferences State
  const [currency, setCurrency] = useState('USD');
  const [autoScan, setAutoScan] = useState(true);
  const [defaultCategory, setDefaultCategory] = useState('');

  // Billing State
  const [plan, setPlan] = useState('free');

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.new || !passwordData.confirm) {
      showToast('Please fill in all password fields', 'error');
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (passwordData.new.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsLoadingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;

      showToast('Password updated successfully', 'success');
      setPasswordData({ current: '', new: '', confirm: '' });
      setShowChangePassword(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  // Change Email Handler
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailData.new) {
      showToast('Please enter a new email', 'error');
      return;
    }

    setIsLoadingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: emailData.new
      });

      if (error) throw error;

      showToast('Confirmation email sent to your new email address', 'success');
      setEmailData({ new: '' });
      setShowChangeEmail(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update email', 'error');
    } finally {
      setIsLoadingEmail(false);
    }
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone. All your data will be permanently deleted.')) {
      return;
    }

    try {
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(currentUser?.id || '');
      
      if (error) throw error;

      showToast('Account deleted successfully', 'success');
      navigate('/login');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete account', 'error');
    }
  };

  // Upgrade Plan Handler
  const handleUpgradePlan = () => {
    navigate('/dashboard/pricing');
  };

  // Download Data Handler
  const handleDownloadData = async () => {
    if (!receipts || receipts.length === 0) {
      showToast('No receipts to download', 'error');
      return;
    }

    setIsDownloading(true);
    try {
      showToast('Creating ZIP file with your receipts...', 'success');

      const zip = new JSZip();
      const receiptsFolder = zip.folder('receipts');
      
      // Add receipt info JSON
      const receiptInfo = receipts.map(r => ({
        id: r.id,
        merchant: r.merchant,
        total: r.total,
        date: r.created_at,
        category: r.category_id,
        status: r.status,
        image_url: r.image_url,
      }));
      
      receiptsFolder?.file('receipts_info.json', JSON.stringify(receiptInfo, null, 2));

      // Add receipt images
      let imageCount = 0;
      for (const receipt of receipts) {
        if (receipt.image_url) {
          try {
            const response = await fetch(receipt.image_url);
            const blob = await response.blob();
            const fileName = `${receipt.merchant || 'receipt'}-${receipt.id}.jpg`;
            receiptsFolder?.file(fileName, blob);
            imageCount++;
          } catch (err) {
            console.error(`Failed to fetch image for receipt ${receipt.id}:`, err);
          }
        }
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download ZIP
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `snapceit-receipts-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      showToast(`Downloaded ${imageCount} receipt(s) in ZIP file`, 'success');
    } catch (err: any) {
      console.error('Download error:', err);
      showToast('Failed to download receipts', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Settings"
        description="Manage your account and preferences"
        addDesktopTopPadding={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Account Settings */}
        <div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <KeyIcon className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Account Settings</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Current Email */}
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/60 mb-1">Current Email</p>
                <p className="text-white font-medium">{currentUser?.email}</p>
              </div>

              {/* Change Password Button */}
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {showChangePassword ? 'Cancel' : 'Change Password'}
              </button>

              {/* Change Password Form */}
              {showChangePassword && (
                <form onSubmit={handleChangePassword} className="space-y-3 pt-3 border-t border-white/10">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoadingPassword}
                    className="w-full bg-green-500/30 hover:bg-green-500/40 disabled:bg-gray-600 text-green-300 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {isLoadingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}

              {/* Change Email Button */}
              <button
                onClick={() => setShowChangeEmail(!showChangeEmail)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {showChangeEmail ? 'Cancel' : 'Change Email'}
              </button>

              {/* Change Email Form */}
              {showChangeEmail && (
                <form onSubmit={handleChangeEmail} className="space-y-3 pt-3 border-t border-white/10">
                  <input
                    type="email"
                    placeholder="New Email"
                    value={emailData.new}
                    onChange={(e) => setEmailData({ new: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoadingEmail}
                    className="w-full bg-green-500/30 hover:bg-green-500/40 disabled:bg-gray-600 text-green-300 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {isLoadingEmail ? 'Updating...' : 'Update Email'}
                  </button>
                </form>
              )}

              {/* Delete Account Button */}
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Receipt Preferences */}
        <div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <DocumentIcon className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Receipt Preferences</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>

              {/* Default Category */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Default Category
                </label>
                <select
                  value={defaultCategory}
                  onChange={(e) => setDefaultCategory(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a category</option>
                  <option value="food">Food & Dining</option>
                  <option value="transport">Transportation</option>
                  <option value="shopping">Shopping</option>
                  <option value="utilities">Utilities</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="health">Health & Medical</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Auto-Scan Toggle */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div>
                  <h3 className="text-sm font-medium text-white">Auto-Categorize</h3>
                  <p className="text-xs text-white/60">Automatically categorize receipts</p>
                </div>
                <button
                  onClick={() => setAutoScan(!autoScan)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoScan ? 'bg-purple-600' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoScan ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <CreditCardIcon className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Billing</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Current Plan */}
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/60 mb-1">Current Plan</p>
                <p className="text-white font-medium capitalize">{plan}</p>
              </div>

              {/* Plan Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-white/80">
                  <span>Receipts per month</span>
                  <span className="font-medium">Unlimited</span>
                </div>
                <div className="flex items-center justify-between text-white/80">
                  <span>Storage</span>
                  <span className="font-medium">5 GB</span>
                </div>
                <div className="flex items-center justify-between text-white/80">
                  <span>OCR Processing</span>
                  <span className="font-medium">Included</span>
                </div>
              </div>

              {/* Upgrade Button */}
              {plan === 'free' && (
                <button 
                  onClick={handleUpgradePlan}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                >
                  Upgrade Plan
                </button>
              )}

              {/* Manage Billing Button */}
              <button className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-white/20">
                Manage Billing
              </button>
            </div>
          </div>
        </div>

        {/* Data Download */}
        <div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <ArrowDownTrayIcon className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Data & Privacy</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Download Data */}
              <div>
                <p className="text-sm text-white/80 mb-3">Download all your data in a portable format</p>
                <button
                  onClick={handleDownloadData}
                  disabled={isDownloading}
                  className="w-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-white/20 flex items-center justify-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  {isDownloading ? 'Downloading...' : 'Download My Data'}
                </button>
                <p className="text-xs text-white/60 mt-2">Includes receipts, settings, and account info</p>
              </div>

              {/* Data Info */}
              <div className="bg-white/5 rounded-lg p-3 space-y-2">
                <p className="text-sm text-white/80">
                  <span className="font-semibold">Your Privacy:</span>
                </p>
                <ul className="text-xs text-white/60 space-y-1">
                  <li>✓ Your data is encrypted</li>
                  <li>✓ We never sell your data</li>
                  <li>✓ You can export anytime</li>
                  <li>✓ GDPR compliant</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
