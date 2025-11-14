import { User } from '@supabase/supabase-js';

/**
 * Get display name from Supabase user
 * Supabase User doesn't have displayName, so we derive from email or user_metadata
 */
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'User';
  
  // Check user_metadata for custom display name
  if (user.user_metadata?.display_name) {
    return user.user_metadata.display_name;
  }
  
  // Check user_metadata for full_name
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }
  
  // Fallback to email username
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user: User | null): string => {
  if (!user) return 'U';
  
  const displayName = getUserDisplayName(user);
  
  // If display name has spaces, get first letter of each word
  if (displayName.includes(' ')) {
    return displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2); // Max 2 letters
  }
  
  // Otherwise just first letter
  return displayName[0]?.toUpperCase() || 'U';
};

/**
 * Get user avatar URL from Supabase user
 * Supabase User doesn't have photoURL, check user_metadata
 */
export const getUserAvatarUrl = (user: User | null): string | null => {
  if (!user) return null;
  
  // Check user_metadata for avatar_url
  if (user.user_metadata?.avatar_url) {
    return user.user_metadata.avatar_url;
  }
  
  // Check user_metadata for picture (OAuth providers)
  if (user.user_metadata?.picture) {
    return user.user_metadata.picture;
  }
  
  return null;
};

/**
 * Get user creation date
 */
export const getUserCreatedAt = (user: User | null): Date | null => {
  if (!user || !user.created_at) return null;
  return new Date(user.created_at);
};
