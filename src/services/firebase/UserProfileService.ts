import { ref, get, set, update, DatabaseReference } from 'firebase/database';
import { UserProfile } from '../../types/UserProfile';
import { db } from '../../firebase/config';

export class UserProfileService {
  private getUserRef(userId: string): DatabaseReference {
    return ref(db, `users/${userId}`);
  }

  async createProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const timestamp = new Date().toISOString();
    const newProfile: UserProfile = {
      userId,
      email: profile.email || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      accountStatus: 'active',
      emailVerified: false,
      twoFactorEnabled: false,
      preferredCurrency: 'USD',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      notificationPreferences: {
        email: true,
        push: true,
        sms: false,
        receiptScanned: true,
        monthlyReport: true,
        budgetAlerts: true,
      },
      defaultCategories: ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Bills'],
      customCategories: [],
      exportPreferences: {
        format: 'pdf',
        frequency: 'monthly',
        includeReceipts: true,
        includeSummary: true,
      },
      totalReceiptsScanned: 0,
      totalExpenseAmount: 0,
      storageUsed: 0,
      lastLoginDate: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...profile,
    };

    await set(this.getUserRef(userId), newProfile);
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const snapshot = await get(this.getUserRef(userId));
    return snapshot.exists() ? snapshot.val() as UserProfile : null;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const timestamp = new Date().toISOString();
    await update(this.getUserRef(userId), {
      ...updates,
      updatedAt: timestamp,
    });
  }

  async updateProfileImage(userId: string, imageUrl: string): Promise<void> {
    await this.updateProfile(userId, {
      profileImageUrl: imageUrl,
    });
  }

  async updateSubscription(
    userId: string,
    plan: UserProfile['subscriptionPlan'],
    status: UserProfile['subscriptionStatus'],
    endDate: string,
  ): Promise<void> {
    await this.updateProfile(userId, {
      subscriptionPlan: plan,
      subscriptionStatus: status,
      subscriptionEndDate: endDate,
    });
  }

  async updateSecuritySettings(
    userId: string,
    twoFactorEnabled: boolean,
    securityQuestions?: UserProfile['securityQuestions'],
  ): Promise<void> {
    await this.updateProfile(userId, {
      twoFactorEnabled,
      securityQuestions,
    });
  }

  async updateStorageUsed(userId: string, newStorageSize: number): Promise<void> {
    const profile = await this.getProfile(userId);
    if (profile) {
      await this.updateProfile(userId, {
        storageUsed: newStorageSize,
      });
    }
  }

  async incrementReceiptCount(userId: string, expenseAmount: number): Promise<void> {
    const profile = await this.getProfile(userId);
    if (profile) {
      await this.updateProfile(userId, {
        totalReceiptsScanned: (profile.totalReceiptsScanned || 0) + 1,
        totalExpenseAmount: (profile.totalExpenseAmount || 0) + expenseAmount,
      });
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    await this.updateProfile(userId, {
      accountStatus: 'deleted',
      updatedAt: new Date().toISOString(),
    });
  }
}
