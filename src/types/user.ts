export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  receiptScanned: boolean;
  monthlyReport: boolean;
  budgetAlerts: boolean;
}

export interface ExportPreferences {
  format: 'pdf' | 'csv' | 'excel';
  frequency: 'weekly' | 'monthly' | 'quarterly';
  includeReceipts: boolean;
  includeSummary: boolean;
}

export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  accountStatus: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  preferredCurrency: string;
  language: string;
  timezone: string;
  subscriptionPlan: 'free' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
  notificationPreferences: NotificationPreferences;
  defaultCategories: string[];
  customCategories: string[];
  exportPreferences: ExportPreferences;
  totalReceiptsScanned: number;
  totalExpenseAmount: number;
  storageUsed: number;
  lastLoginDate: string;
  createdAt: string;
  updatedAt: string;
}
