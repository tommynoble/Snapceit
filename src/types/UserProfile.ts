export interface UserProfile {
  // Primary Keys
  userId: string;  // Partition key
  email: string;   // Sort key

  // Personal Information
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  
  // Account Settings
  accountStatus: 'active' | 'suspended' | 'deleted';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  preferredCurrency: string;
  language: string;
  timezone: string;
  
  // Security Settings
  passwordLastChanged: string;
  loginHistory: {
    timestamp: string;
    ipAddress: string;
    device: string;
  }[];
  securityQuestions?: {
    question: string;
    hashedAnswer: string;
  }[];

  // Subscription & Billing
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  paymentMethods?: {
    id: string;
    type: 'credit_card' | 'paypal' | 'bank_transfer';
    lastFour?: string;
    expiryDate?: string;
    isDefault: boolean;
  }[];

  // App Settings & Preferences
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    receiptScanned: boolean;
    monthlyReport: boolean;
    budgetAlerts: boolean;
  };
  
  // Receipt Scanner Settings
  defaultCategories: string[];
  customCategories: string[];
  autoCategorizationRules?: {
    keyword: string;
    category: string;
  }[];
  
  // Export & Integration Settings
  connectedAccounts?: {
    type: 'quickbooks' | 'xero' | 'sage' | 'google_drive';
    accountId: string;
    status: 'connected' | 'disconnected';
    lastSync: string;
  }[];
  exportPreferences: {
    format: 'csv' | 'pdf' | 'excel';
    frequency: 'never' | 'daily' | 'weekly' | 'monthly';
    includeReceipts: boolean;
    includeSummary: boolean;
  };

  // Usage Statistics
  totalReceiptsScanned: number;
  totalExpenseAmount: number;
  storageUsed: number; // in bytes
  lastLoginDate: string;
  createdAt: string;
  updatedAt: string;
}
