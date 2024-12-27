import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { CompleteUserProfile } from '../types/UserProfile';
import { userProfileService } from '../services/rds/UserProfileService';

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompleteUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let userProfile = await userProfileService.getUserById(user.uid);
        
        // If profile doesn't exist, create it
        if (!userProfile && user.email) {
          userProfile = await userProfileService.createUser({
            email: user.email,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            phoneNumber: user.phoneNumber || undefined,
            profileImageUrl: user.photoURL || undefined,
            accountStatus: 'active',
            emailVerified: user.emailVerified
          });
        }

        if (mounted) {
          setProfile(userProfile);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load profile'));
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  const updateProfile = async (updates: Partial<CompleteUserProfile>) => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      setError(null);

      // Update user data if present
      if (updates.user) {
        await userProfileService.updateUser(user.uid, updates.user);
      }

      // Update settings if present
      if (updates.settings) {
        // Add settings update logic
      }

      // Update subscription if present
      if (updates.subscription) {
        await userProfileService.updateSubscription(user.uid, updates.subscription);
      }

      // Reload the complete profile
      const updatedProfile = await userProfileService.getUserById(user.uid);
      setProfile(updatedProfile);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile
  };
}
