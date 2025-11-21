import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import {
  User,
  Mail,
  Calendar,
  Receipt,
  DollarSign,
  Bell,
  Shield,
  LogOut,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { useReceipts } from '../../components/dashboard/receipts/ReceiptContext';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { receipts } = useReceipts();
  const [profilePicture, setProfilePicture] = useState<string | null>(() => 
    currentUser?.user_metadata?.avatar_url || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const firstName = currentUser?.user_metadata?.first_name || 'User';
  const lastName = currentUser?.user_metadata?.last_name || '';
  const email = currentUser?.email || '';
  const totalReceipts = receipts?.length || 0;
  const totalExpenses = receipts?.reduce((sum, r) => sum + (r.total || 0), 0) || 0;
  const emailVerified = currentUser?.email_confirmed_at ? true : false;
  const createdAt = currentUser?.created_at || new Date().toISOString();

  // Generate initials
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Sync profile picture when avatar_url changes
  useEffect(() => {
    const avatarUrl = currentUser?.user_metadata?.avatar_url;
    if (avatarUrl && avatarUrl !== profilePicture) {
      setProfilePicture(avatarUrl);
    }
  }, [currentUser?.user_metadata?.avatar_url]);

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${currentUser.id}-${Date.now()}.jpg`;
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = publicData.publicUrl;

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setProfilePicture(publicUrl);
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!currentUser) return;

    try {
      // Update user metadata to remove avatar_url
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      if (error) throw error;

      setProfilePicture(null);
      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture');
    }
  };

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

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Profile" 
        description="Manage your account and view your receipt statistics"
        addDesktopTopPadding={true}
      />
      
      {/* User Header Card */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Profile Picture with Upload */}
          <div className="relative group">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/50"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center border-2 border-purple-500/50">
                <span className="text-white font-bold text-2xl">{initials}</span>
              </div>
            )}
            
            {/* Upload Button Overlay */}
            <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                disabled={isUploading}
                className="hidden"
              />
              <Upload className="w-5 h-5 text-white" />
            </label>

            {/* Remove Button - Only show on hover */}
            {profilePicture && (
              <button
                onClick={handleRemoveProfilePicture}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{firstName} {lastName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Mail className="w-4 h-4 text-white/60" />
              <p className="text-white/60">{email}</p>
              {emailVerified && (
                <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-green-500/20 rounded-full">
                  <Shield className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">Verified</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full md:w-auto px-6 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg flex items-center justify-center md:justify-start gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/40 p-3 rounded-lg">
              <Receipt className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Receipts</p>
              <p className="text-3xl font-bold text-white">{totalReceipts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/40 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Expenses</p>
              <p className="text-3xl font-bold text-white">${totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="bg-green-500/40 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-green-200" />
            </div>
            <div>
              <p className="text-sm text-white/60">Member Since</p>
              <p className="text-lg font-bold text-white">{formatDate(createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-[#00E5FF]" />
          <h2 className="text-2xl font-bold text-white">Account Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-white/60 mb-2">Email Address</label>
            <div className="px-4 py-3 bg-white/5 rounded-lg text-white">{email}</div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Account Status</label>
            <div className="px-4 py-3 bg-green-500/10 text-green-400 rounded-lg inline-block">
              ✓ Active
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Member Since</label>
            <div className="px-4 py-3 bg-white/5 rounded-lg text-white">{formatDate(createdAt)}</div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Email Verification</label>
            <div className={`px-4 py-3 rounded-lg inline-block ${emailVerified ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
              {emailVerified ? '✓ Verified' : '⚠ Pending'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
