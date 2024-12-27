// Table names for DynamoDB
export const TABLES = {
  USERS: 'users',
  USER_SETTINGS: 'user_settings',
  RECEIPTS: 'receipts'
} as const;

// Global Secondary Indexes
export const INDEXES = {
  EMAIL_INDEX: 'EmailIndex',
  DATE_INDEX: 'DateIndex'
} as const;

// DynamoDB configuration
export const DYNAMODB_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!,
  },
} as const;
