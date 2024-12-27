import api from '../../lib/axios';
import { UserProfile } from '../../types/UserProfile';

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  accountStatus?: 'active' | 'inactive';
  emailVerified?: boolean;
}

const userService = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/profile');
    return response.data.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateUserProfileData): Promise<UserProfile> => {
    const response = await api.put('/profile', data);
    return response.data.data;
  },

  // Update user settings
  updateSettings: async (data: any): Promise<any> => {
    const response = await api.put('/settings', data);
    return response.data.data;
  }
};

export default userService;
