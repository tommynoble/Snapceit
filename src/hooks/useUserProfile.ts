import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { UserProfile } from '../types/UserProfile';
import { UserProfileService } from '../services/firebase/UserProfileService';

const userProfileService = new UserProfileService();

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
        
        let userProfile = await userProfileService.getProfile(user.uid);
        
        // If profile doesn't exist, create it
        if (!userProfile && user.email) {
          await userProfileService.createProfile(user.uid, {
            email: user.email,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            profileImageUrl: user.photoURL || undefined,
          });
          userProfile = await userProfileService.getProfile(user.uid);
        }

        if (mounted) {
          setProfile(userProfile);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load profile'));
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await userProfileService.updateProfile(user.uid, updates);
      const updatedProfile = await userProfileService.getProfile(user.uid);
      setProfile(updatedProfile);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update profile');
    }
  };

  const updateProfileImage = async (imageUrl: string) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await userProfileService.updateProfileImage(user.uid, imageUrl);
      const updatedProfile = await userProfileService.getProfile(user.uid);
      setProfile(updatedProfile);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update profile image');
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateProfileImage,
  };
}
