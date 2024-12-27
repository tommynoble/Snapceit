// User Types for RDS Structure
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  accountStatus: 'active' | 'suspended' | 'deleted';
  emailVerified: boolean;
}

export interface UserSettings {
  userId: string;
  preferredCurrency: string;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notificationEmail: boolean;
  notificationPush: boolean;
  notificationSms: boolean;
  darkMode: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingAddress {
  id: string;
  userId: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  paymentType: 'credit_card' | 'paypal' | 'bank_transfer';
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface UserUsageStats {
  userId: string;
  totalReceiptsScanned: number;
  totalExpenseAmount: number;
  storageUsed: number;
  lastLogin?: Date;
  lastReceiptScan?: Date;
}

export interface LoginHistory {
  id: number;
  userId: string;
  loginTimestamp: Date;
  ipAddress: string;
  deviceInfo: string;
  loginStatus: 'success' | 'failed';
}

// Composite types for common queries
export interface CompleteUserProfile {
  user: User;
  settings: UserSettings;
  subscription?: Subscription;
  billingAddresses: BillingAddress[];
  paymentMethods: PaymentMethod[];
  usageStats: UserUsageStats;
}
