import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { TABLES, DYNAMODB_CONFIG } from '../config/dynamodb';

const client = new DynamoDBClient(DYNAMODB_CONFIG);
const docClient = DynamoDBDocumentClient.from(client);

export interface UserSettings {
  userId: string;
  // Notification Preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationSms: boolean;
  
  // Display Preferences
  currency: string;
  language: string;
  timezone: string;
  darkMode: boolean;
  
  // Security Settings
  twoFactorEnabled: boolean;
  
  // App Settings
  autoScan: boolean;
  
  // Receipt Preferences
  defaultReceiptCurrency: string;
  defaultTaxRate: number;
  
  // Export Settings
  defaultExportFormat: 'csv' | 'pdf' | 'excel';
  includeReceiptImages: boolean;
  
  // Storage Settings
  compressUploads: boolean;
  autoDeleteAfterDays: number | null;
  
  // Metadata
  createdAt?: string;
  updatedAt: string;
}

export const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney'
] as const;

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
] as const;

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' }
] as const;

export const DEFAULT_SETTINGS: Omit<UserSettings, 'userId' | 'updatedAt'> = {
  emailNotifications: true,
  pushNotifications: true,
  notificationSms: false,
  currency: 'USD',
  language: 'en',
  timezone: 'America/New_York',
  darkMode: false,
  twoFactorEnabled: false,
  autoScan: true,
  defaultReceiptCurrency: 'USD',
  defaultTaxRate: 0,
  defaultExportFormat: 'pdf',
  includeReceiptImages: true,
  compressUploads: true,
  autoDeleteAfterDays: null,
};

export const settingsService = {
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const response = await fetch('/api/users/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch settings');
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  },

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) throw new Error('Failed to update settings');
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  },

  async createUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const timestamp = new Date().toISOString();
      const newSettings: UserSettings = {
        ...DEFAULT_SETTINGS,
        ...settings,
        userId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const command = new PutCommand({
        TableName: TABLES.USER_SETTINGS,
        Item: newSettings,
      });

      await docClient.send(command);
      return newSettings;
    } catch (error) {
      console.error('Error creating user settings:', error);
      throw error;
    }
  },
};
