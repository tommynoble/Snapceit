import { User, LogOut, Mail, Calendar, X, Shield, CreditCard, Settings, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../../auth/SupabaseAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { getUserDisplayName, getUserAvatarUrl, getUserCreatedAt } from '../../../utils/userHelpers';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => Promise<void>;
}

export function UserProfileModal({ isOpen, onClose, onLogout }: UserProfileModalProps) {
  const { currentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    try {
      await onLogout();
      onClose();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setIsUploading(true);
      // TODO: Implement S3 upload for Cognito
      console.log('Image upload not yet implemented for Cognito');
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm"
        >
          <div className="flex min-h-screen items-center justify-center px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 px-6 py-8 text-white">
                <button 
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full p-1 text-white/80 hover:bg-white/10"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    {getUserAvatarUrl(currentUser) ? (
                      <img
                        src={getUserAvatarUrl(currentUser)!}
                        alt="Profile"
                        className="h-20 w-20 rounded-full border-4 border-white/20 object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 border-4 border-white/20 transition-transform group-hover:scale-105">
                        <User className="h-10 w-10 text-white" />
                      </div>
                    )}
                    
                    <button
                      onClick={triggerImageUpload}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4 text-purple-500" />
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white">
                      {getUserDisplayName(currentUser)}
                    </h3>
                    <p className="text-sm text-white/80">{currentUser?.email}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="divide-y divide-gray-100">
                {/* Account Details */}
                <div className="p-6">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Account Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <Mail className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{currentUser?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Member Since</p>
                        <p className="text-sm text-gray-900">
                          {getUserCreatedAt(currentUser)?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-6">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/settings/billing"
                      className="flex flex-col items-center gap-2 rounded-lg bg-gray-50 p-4 text-gray-700 hover:bg-gray-100"
                    >
                      <CreditCard className="h-6 w-6 text-purple-500" />
                      <span className="text-sm font-medium">Billing</span>
                    </Link>
                    <Link
                      to="/settings/security"
                      className="flex flex-col items-center gap-2 rounded-lg bg-gray-50 p-4 text-gray-700 hover:bg-gray-100"
                    >
                      <Shield className="h-6 w-6 text-purple-500" />
                      <span className="text-sm font-medium">Security</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex flex-col items-center gap-2 rounded-lg bg-gray-50 p-4 text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-6 w-6 text-purple-500" />
                      <span className="text-sm font-medium">Settings</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex flex-col items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600 hover:bg-red-100"
                    >
                      <LogOut className="h-6 w-6" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}