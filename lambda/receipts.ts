import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = 'receipts';

interface Receipt {
  userId: string;
  receiptId: string;
  merchantName: string;
  date: string;
  total: number;
  items?: Array<{
    description: string;
    price: number;
  }>;
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
  category?: string;
  imageUrl?: string;
  status?: 'processing' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

// Helper function to get userId from Cognito claims
function getUserIdFromEvent(event: APIGatewayProxyEvent): string {
  const claims = event.requestContext.authorizer?.claims;
  if (!claims || !claims.sub) {
    throw new Error('Unauthorized - No valid user claims found');
  }
  return claims.sub;
}

// Helper function for API responses
function createResponse(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body)
  };
}

// List receipts for a user
async function listReceipts(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserIdFromEvent(event);
  
  try {
    const result = await dynamodb.query({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();

    return createResponse(200, result.Items);
  } catch (error) {
    console.error('Error listing receipts:', error);
    return createResponse(500, { message: 'Error listing receipts' });
  }
}

// Get a single receipt
async function getReceipt(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserIdFromEvent(event);
  const receiptId = event.pathParameters?.receiptId;

  if (!receiptId) {
    return createResponse(400, { message: 'Receipt ID is required' });
  }

  try {
    const result = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: {
        userId,
        receiptId
      }
    }).promise();

    if (!result.Item) {
      return createResponse(404, { message: 'Receipt not found' });
    }

    return createResponse(200, result.Item);
  } catch (error) {
    console.error('Error getting receipt:', error);
    return createResponse(500, { message: 'Error getting receipt' });
  }
}

// Create a new receipt
async function createReceipt(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserIdFromEvent(event);
  
  if (!event.body) {
    return createResponse(400, { message: 'Request body is required' });
  }

  try {
    const receipt: Receipt = JSON.parse(event.body);
    receipt.userId = userId;
    receipt.createdAt = new Date().toISOString();
    receipt.updatedAt = receipt.createdAt;

    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: receipt
    }).promise();

    return createResponse(201, receipt);
  } catch (error) {
    console.error('Error creating receipt:', error);
    return createResponse(500, { message: 'Error creating receipt' });
  }
}

// Update a receipt
async function updateReceipt(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserIdFromEvent(event);
  const receiptId = event.pathParameters?.receiptId;

  if (!receiptId || !event.body) {
    return createResponse(400, { message: 'Receipt ID and request body are required' });
  }

  try {
    const updates = JSON.parse(event.body);
    updates.updatedAt = new Date().toISOString();

    const result = await dynamodb.update({
      TableName: TABLE_NAME,
      Key: {
        userId,
        receiptId
      },
      UpdateExpression: 'set updatedAt = :updatedAt, merchantName = :merchantName, total = :total, date = :date, category = :category',
      ExpressionAttributeValues: {
        ':updatedAt': updates.updatedAt,
        ':merchantName': updates.merchantName,
        ':total': updates.total,
        ':date': updates.date,
        ':category': updates.category
      },
      ReturnValues: 'ALL_NEW'
    }).promise();

    return createResponse(200, result.Attributes);
  } catch (error) {
    console.error('Error updating receipt:', error);
    return createResponse(500, { message: 'Error updating receipt' });
  }
}

// Delete a receipt
async function deleteReceipt(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserIdFromEvent(event);
  const receiptId = event.pathParameters?.receiptId;

  if (!receiptId) {
    return createResponse(400, { message: 'Receipt ID is required' });
  }

  try {
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: {
        userId,
        receiptId
      }
    }).promise();

    return createResponse(204, null);
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return createResponse(500, { message: 'Error deleting receipt' });
  }
}

// Main handler
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return createResponse(200, {});
    }

    const method = event.httpMethod;
    const path = event.path;

    // Route the request to the appropriate handler
    if (method === 'GET' && path.match(/\/receipts\/[^\/]+$/)) {
      return listReceipts(event);
    } else if (method === 'GET' && path.match(/\/receipts\/[^\/]+\/[^\/]+$/)) {
      return getReceipt(event);
    } else if (method === 'POST' && path === '/receipts') {
      return createReceipt(event);
    } else if (method === 'PUT' && path.match(/\/receipts\/[^\/]+\/[^\/]+$/)) {
      return updateReceipt(event);
    } else if (method === 'DELETE' && path.match(/\/receipts\/[^\/]+\/[^\/]+$/)) {
      return deleteReceipt(event);
    }

    return createResponse(404, { message: 'Not Found' });
  } catch (error) {
    console.error('Unhandled error:', error);
    return createResponse(500, { message: 'Internal server error' });
  }
};
