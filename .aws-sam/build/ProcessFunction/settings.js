const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.SETTINGS_TABLE_NAME;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5184';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Credentials': true
};

const DEFAULT_SETTINGS = {
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

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    let userId;

    // Extract user ID from claims
    if (event.requestContext && event.requestContext.authorizer) {
      if (event.requestContext.authorizer.claims) {
        userId = event.requestContext.authorizer.claims.sub;
      } else if (event.requestContext.authorizer.jwt) {
        userId = event.requestContext.authorizer.jwt.claims.sub;
      }
    }

    if (!userId) {
      console.error('No user ID found in claims:', event.requestContext);
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Unauthorized - No user ID found' })
      };
    }

    switch (event.httpMethod) {
      case 'GET':
        // Get user settings
        const getResult = await dynamodb.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: { userId }
        }));

        // If no settings exist, create default settings
        if (!getResult.Item) {
          const timestamp = new Date().toISOString();
          const newSettings = {
            ...DEFAULT_SETTINGS,
            userId,
            createdAt: timestamp,
            updatedAt: timestamp
          };

          await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: newSettings
          }));

          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ data: newSettings })
          };
        }

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ data: getResult.Item })
        };

      case 'PUT':
        const updateData = JSON.parse(event.body);
        const timestamp = new Date().toISOString();

        // Create update expression and attribute values
        const updateExpressionParts = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {
          ':updatedAt': timestamp
        };

        // Add each field to the update expression
        Object.entries(updateData).forEach(([key, value]) => {
          if (key !== 'userId' && key !== 'createdAt') {
            updateExpressionParts.push(`#${key} = :${key}`);
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = value;
          }
        });

        // Always update the updatedAt timestamp
        updateExpressionParts.push('updatedAt = :updatedAt');

        const updateExpression = 'SET ' + updateExpressionParts.join(', ');

        const updateResult = await dynamodb.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { userId },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW'
        }));

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ data: updateResult.Attributes })
        };

      default:
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
