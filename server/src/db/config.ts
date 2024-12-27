import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the root directory
dotenv.config({ 
  path: path.resolve(__dirname, '../../.env')
});

const client = new DynamoDBClient({
  region: process.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY!,
  },
});

// Create a document client for easier interaction with DynamoDB
export const docClient = DynamoDBDocumentClient.from(client);

// Table names
export const TABLES = {
  USERS: 'users',
  USER_SETTINGS: 'user_settings',
  RECEIPTS: 'receipts'
} as const;

// Indexes
export const INDEXES = {
  EMAIL_INDEX: 'EmailIndex',
  DATE_INDEX: 'DateIndex'
} as const;
