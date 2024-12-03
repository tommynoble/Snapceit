import React from 'react';
import { User, LogOut, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../../../firebase/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { currentUser, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" onClick={onClose}></div>

        <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Profile Info */}
            <div className="mb-6 flex items-center gap-4">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <User className="h-8 w-8 text-purple-600" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {currentUser?.displayName || 'User'}
                </h3>
                <p className="text-sm text-gray-500">{currentUser?.email}</p>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">Account Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{currentUser?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Member Since</p>
                      <p className="text-sm text-gray-900">
                        {currentUser?.metadata.creationTime
                          ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">Account Actions</h3>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}