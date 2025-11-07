import api from './config';
import { AxiosResponse } from 'axios';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  accountStatus: 'active' | 'inactive';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  accountStatus?: 'active' | 'inactive';
  emailVerified?: boolean;
}

export const userService = {
  // Get current user profile
  getProfile: async (): Promise<UserProfile> => {
    const response: AxiosResponse<{ data: UserProfile }> = await api.get('/users/profile');
    return response.data.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response: AxiosResponse<{ data: UserProfile }> = await api.put('/users/profile', data);
    return response.data.data;
  }
};

export default userService;
