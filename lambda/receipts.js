const middy = require('@middy/core');
const cors = require('@middy/http-cors');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpErrorHandler = require('@middy/http-error-handler');
const { DynamoDB } = require('aws-sdk');

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5184';

// Base handler
const baseHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const { httpMethod, path, body } = event;
  let userId;

  // Extract user ID from claims
  if (event.requestContext?.authorizer?.claims?.sub) {
    userId = event.requestContext.authorizer.claims.sub;
  } else if (event.headers?.Authorization) {
    // For testing: extract user ID from token
    const token = event.headers.Authorization;
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
        const payload = JSON.parse(Buffer.from(paddedBase64, 'base64').toString('utf8'));
        userId = payload.sub;
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }

  if (!userId) {
    throw new Error('Unauthorized - No user ID found');
  }

  switch (httpMethod) {
    case 'GET':
      if (!event.pathParameters) {
        // List all receipts
        const queryResult = await dynamodb.query({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        }).promise();

        return {
          statusCode: 200,
          body: JSON.stringify({
            receipts: queryResult.Items,
            count: queryResult.Count
          })
        };
      } else {
        // Get single receipt
        const { receiptId } = event.pathParameters;
        const getResult = await dynamodb.get({
          TableName: TABLE_NAME,
          Key: {
            userId,
            receiptId
          }
        }).promise();

        if (!getResult.Item) {
          throw new Error('Receipt not found');
        }

        return {
          statusCode: 200,
          body: JSON.stringify(getResult.Item)
        };
      }

    case 'POST':
      const newReceipt = {
        userId,
        receiptId: require('uuid').v4(),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dynamodb.put({
        TableName: TABLE_NAME,
        Item: newReceipt
      }).promise();

      return {
        statusCode: 201,
        body: JSON.stringify(newReceipt)
      };

    case 'PUT':
      if (!event.pathParameters?.receiptId) {
        throw new Error('Receipt ID is required');
      }

      const updateExpression = [];
      const expressionAttributeValues = {
        ':updatedAt': new Date().toISOString()
      };
      const expressionAttributeNames = {
        '#updatedAt': 'updatedAt'
      };

      Object.entries(body).forEach(([key, value], index) => {
        if (key !== 'userId' && key !== 'receiptId') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeValues[`:${key}`] = value;
          expressionAttributeNames[`#${key}`] = key;
        }
      });

      updateExpression.push('#updatedAt = :updatedAt');

      const updateResult = await dynamodb.update({
        TableName: TABLE_NAME,
        Key: {
          userId,
          receiptId: event.pathParameters.receiptId
        },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW'
      }).promise();

      return {
        statusCode: 200,
        body: JSON.stringify(updateResult.Attributes)
      };

    case 'DELETE':
      if (!event.pathParameters?.receiptId) {
        throw new Error('Receipt ID is required');
      }

      await dynamodb.delete({
        TableName: TABLE_NAME,
        Key: {
          userId,
          receiptId: event.pathParameters.receiptId
        }
      }).promise();

      return {
        statusCode: 204,
        body: ''
      };

    default:
      throw new Error(`Unsupported method "${httpMethod}"`);
  }
};

// Middy handler with middleware
const handler = middy(baseHandler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
  .use(cors({
    origin: ALLOWED_ORIGIN,
    credentials: true,
    headers: [
      'Content-Type',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
      'X-Amz-Security-Token',
      'X-Amz-User-Agent'
    ].join(','),
    methods: 'GET,POST,PUT,DELETE,OPTIONS'
  }));

module.exports = { handler };
