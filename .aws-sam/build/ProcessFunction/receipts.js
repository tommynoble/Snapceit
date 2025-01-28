const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5184';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
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
    const method = event.httpMethod;
    let userId;

    // Extract user ID from claims
    if (event.requestContext && event.requestContext.authorizer) {
      if (event.requestContext.authorizer.claims) {
        userId = event.requestContext.authorizer.claims.sub;
      } else if (event.requestContext.authorizer.jwt) {
        userId = event.requestContext.authorizer.jwt.claims.sub;
      }
    }

    // For test cases or when claims are not in requestContext, try to extract from Authorization header
    if (!userId && event.headers && event.headers.Authorization) {
      const token = event.headers.Authorization.replace('Bearer ', '');
      console.log('Token:', token.substring(0, 50) + '...');  // Log just the start
      const tokenParts = token.split('.');
      console.log('Token parts:', tokenParts.length);
      if (tokenParts.length === 3) {
        try {
          // Add padding to base64 string if needed
          const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
          const pad = base64.length % 4;
          const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
          
          const decodedPayload = Buffer.from(paddedBase64, 'base64').toString('utf8');
          console.log('Decoded payload:', decodedPayload);
          const payload = JSON.parse(decodedPayload);
          console.log('Parsed payload:', payload);
          userId = payload.sub;
          console.log('Extracted userId:', userId);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
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

    switch (method) {
      case 'GET':
        if (event.pathParameters && event.pathParameters.id) {
          // Get single receipt
          const getResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              userId: userId,
              receiptId: event.pathParameters.id
            }
          }));

          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(getResult.Item)
          };
        } else {
          // List all receipts
          const queryResult = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            }
          }));

          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
              receipts: queryResult.Items,
              count: queryResult.Count
            })
          };
        }

      case 'POST':
        const receiptData = JSON.parse(event.body);
        const receiptId = uuidv4();
        const timestamp = new Date().toISOString();

        // Format the receipt data
        const newReceipt = {
          userId,
          receiptId,
          merchant: receiptData.merchant || 'Unknown Merchant',
          total: parseFloat(receiptData.amount) || 0,
          date: receiptData.date || timestamp,
          items: receiptData.items?.map(item => ({
            name: item.name,
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1
          })) || [],
          category: receiptData.category || 'Supplies',
          status: receiptData.status || 'completed',
          imageUrl: receiptData.imageUrl,
          tax: receiptData.tax ? {
            total: parseFloat(receiptData.tax.total) || 0,
            type: receiptData.tax.type || 'sales'
          } : undefined,
          subtotal: receiptData.subtotal ? parseFloat(receiptData.subtotal) : undefined,
          paymentMethod: receiptData.paymentMethod,
          address: receiptData.address,
          phone: receiptData.phone,
          invoiceNumber: receiptData.invoiceNumber,
          createdAt: timestamp,
          updatedAt: timestamp
        };

        console.log('Saving receipt:', JSON.stringify(newReceipt, null, 2));

        try {
          await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: newReceipt
          }));

          return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify(newReceipt)
          };
        } catch (error) {
          console.error('Error saving receipt:', error);
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
              message: 'Failed to save receipt',
              error: error.message 
            })
          };
        }

      case 'PUT':
        if (!event.pathParameters || !event.pathParameters.id) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Receipt ID is required' })
          };
        }

        const updateData = JSON.parse(event.body);
        const updateTimestamp = new Date().toISOString();

        // Create update expression and attribute values
        const updateExpressionParts = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {
          ':updatedAt': updateTimestamp
        };

        // Add each field to the update expression
        if (updateData.merchant) {
          updateExpressionParts.push('#merchant = :merchant');
          expressionAttributeNames['#merchant'] = 'merchant';
          expressionAttributeValues[':merchant'] = updateData.merchant;
        }
        if (updateData.amount !== undefined) {
          updateExpressionParts.push('#total = :total');
          expressionAttributeNames['#total'] = 'total';
          expressionAttributeValues[':total'] = parseFloat(updateData.amount);
        }
        if (updateData.date) {
          updateExpressionParts.push('#date = :date');
          expressionAttributeNames['#date'] = 'date';
          expressionAttributeValues[':date'] = updateData.date;
        }
        if (updateData.items) {
          updateExpressionParts.push('#items = :items');
          expressionAttributeNames['#items'] = 'items';
          expressionAttributeValues[':items'] = updateData.items;
        }
        if (updateData.category) {
          updateExpressionParts.push('#category = :category');
          expressionAttributeNames['#category'] = 'category';
          expressionAttributeValues[':category'] = updateData.category;
        }
        if (updateData.status) {
          updateExpressionParts.push('#status = :status');
          expressionAttributeNames['#status'] = 'status';
          expressionAttributeValues[':status'] = updateData.status;
        }
        if (updateData.imageUrl) {
          updateExpressionParts.push('#imageUrl = :imageUrl');
          expressionAttributeNames['#imageUrl'] = 'imageUrl';
          expressionAttributeValues[':imageUrl'] = updateData.imageUrl;
        }
        if (updateData.tax) {
          updateExpressionParts.push('#tax = :tax');
          expressionAttributeNames['#tax'] = 'tax';
          expressionAttributeValues[':tax'] = updateData.tax;
        }
        if (updateData.subtotal !== undefined) {
          updateExpressionParts.push('#subtotal = :subtotal');
          expressionAttributeNames['#subtotal'] = 'subtotal';
          expressionAttributeValues[':subtotal'] = parseFloat(updateData.subtotal);
        }
        if (updateData.paymentMethod) {
          updateExpressionParts.push('#paymentMethod = :paymentMethod');
          expressionAttributeNames['#paymentMethod'] = 'paymentMethod';
          expressionAttributeValues[':paymentMethod'] = updateData.paymentMethod;
        }
        if (updateData.address) {
          updateExpressionParts.push('#address = :address');
          expressionAttributeNames['#address'] = 'address';
          expressionAttributeValues[':address'] = updateData.address;
        }
        if (updateData.phone) {
          updateExpressionParts.push('#phone = :phone');
          expressionAttributeNames['#phone'] = 'phone';
          expressionAttributeValues[':phone'] = updateData.phone;
        }
        if (updateData.invoiceNumber) {
          updateExpressionParts.push('#invoiceNumber = :invoiceNumber');
          expressionAttributeNames['#invoiceNumber'] = 'invoiceNumber';
          expressionAttributeValues[':invoiceNumber'] = updateData.invoiceNumber;
        }

        // Always update the updatedAt timestamp
        updateExpressionParts.push('updatedAt = :updatedAt');

        const updateExpression = 'SET ' + updateExpressionParts.join(', ');

        console.log('Update expression:', updateExpression);
        console.log('Expression attribute names:', expressionAttributeNames);
        console.log('Expression attribute values:', expressionAttributeValues);

        const updateResult = await dynamodb.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            userId: userId,
            receiptId: event.pathParameters.id
          },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW'
        }));

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(updateResult.Attributes)
        };

      case 'DELETE':
        if (!event.pathParameters || !event.pathParameters.id) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Receipt ID is required' })
          };
        }

        await dynamodb.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            userId: userId,
            receiptId: event.pathParameters.id
          }
        }));

        return {
          statusCode: 204,
          headers: corsHeaders,
          body: ''
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
