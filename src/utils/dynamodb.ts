import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'receipts';

export interface ReceiptItem {
  userId: string;           // Partition key
  receiptId: string;       // Sort key
  merchantName: string;
  date: string;
  total: number;
  tax?: {
    total: number;
    breakdown?: {
      salesTax?: number;
      stateTax?: number;
      localTax?: number;
      otherTaxes?: Array<{
        name: string;
        amount: number;
      }>;
    };
  };
  items?: Array<{
    description: string;
    price: number;
  }>;
  category?: string;
  imageUrl?: string;
  status?: 'processing' | 'completed';
  vendor?: {
    name?: string;
    address?: string;
    phone?: string;
    addressBlock?: string;
    city?: string;
    state?: string;
  };
  rawTextractData?: {
    [key: string]: string;
  };
  taxDeductible?: boolean;
  taxCategory?: 'business' | 'personal' | 'medical' | 'charity' | 'education';
  createdAt: string;
  updatedAt?: string;
}

export const dynamoDb = {
  // Create or update a receipt
  putReceipt: async (receipt: ReceiptItem) => {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...receipt,
        updatedAt: new Date().toISOString()
      }
    });
    return docClient.send(command);
  },

  // Get a single receipt by userId and receiptId
  getReceipt: async (userId: string, receiptId: string) => {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        userId,
        receiptId
      }
    });
    const response = await docClient.send(command);
    return response.Item as ReceiptItem | undefined;
  },

  // Query receipts by userId and optional date range
  queryReceipts: async (
    userId: string, 
    startDate?: string, 
    endDate?: string
  ) => {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'userId = :userId' + (startDate && endDate ? ' AND #date BETWEEN :start AND :end' : ''),
      ExpressionAttributeValues: {
        ':userId': userId,
        ...(startDate && endDate ? {
          ':start': startDate,
          ':end': endDate
        } : {})
      },
      ExpressionAttributeNames: startDate && endDate ? {
        '#date': 'date'
      } : undefined
    });
    const response = await docClient.send(command);
    return response.Items as ReceiptItem[];
  },

  // Update receipt fields
  updateReceipt: async (
    userId: string,
    receiptId: string,
    updates: Partial<Omit<ReceiptItem, 'userId' | 'receiptId'>>
  ) => {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Remove updatedAt from updates if it exists to prevent overlap
    const { updatedAt, ...otherUpdates } = updates;

    Object.entries(otherUpdates).forEach(([key, value]) => {
      if (value !== undefined) {  // Only include defined values
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    // Add updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        userId,
        receiptId
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    return docClient.send(command);
  },

  // Delete a receipt
  deleteReceipt: async (userId: string, receiptId: string) => {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        userId,
        receiptId
      }
    });
    return docClient.send(command);
  }
};
