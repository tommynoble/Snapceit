import express from 'express';
import cors from 'cors';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure AWS
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);

// Configure Cognito JWT Verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.VITE_AWS_USER_POOL_ID!,
  tokenUse: "id",
  clientId: process.env.VITE_AWS_CLIENT_ID!,
});

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5184',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// Apply CORS middleware first
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers
  });

  // Log response headers after they're sent
  res.on('finish', () => {
    console.log('Response headers:', res.getHeaders());
  });

  next();
});

// Middleware to authenticate token
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const payload = await verifier.verify(token);
    (req as any).user = {
      sub: payload.sub,
      email: payload.email
    };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.get('/receipts', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    console.log('Fetching receipts for user:', userId);

    const result = await dynamodb.send(new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE || 'receipts-dev',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }));

    console.log('Query result:', result);
    res.json(result.Items);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ message: 'Error fetching receipts' });
  }
});

app.post('/receipts', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const receipt = {
      ...req.body,
      userId,
      receiptId: Date.now().toString(), // Simple ID generation
      createdAt: new Date().toISOString()
    };

    console.log('Creating receipt:', receipt);

    await dynamodb.send(new PutCommand({
      TableName: process.env.DYNAMODB_TABLE || 'receipts-dev',
      Item: receipt
    }));

    res.status(201).json(receipt);
  } catch (error) {
    console.error('Error creating receipt:', error);
    res.status(500).json({ message: 'Error creating receipt' });
  }
});

app.put('/receipts/:receiptId', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const { receiptId } = req.params;

    console.log('Updating receipt:', { userId, receiptId, updates: req.body });

    // First verify the receipt belongs to the user
    const existingReceipt = await dynamodb.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE || 'receipts-dev',
      Key: { userId, receiptId }
    }));

    if (!existingReceipt.Item) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const updates = req.body;
    const updateExpression = 'set ' + Object.keys(updates)
      .filter(key => key !== 'userId' && key !== 'receiptId') // Prevent updating keys
      .map(key => `#${key} = :${key}`)
      .join(', ');

    const expressionAttributeNames = Object.keys(updates)
      .filter(key => key !== 'userId' && key !== 'receiptId')
      .reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {});

    const expressionAttributeValues = Object.entries(updates)
      .filter(([key]) => key !== 'userId' && key !== 'receiptId')
      .reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {});

    await dynamodb.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE || 'receipts-dev',
      Key: { userId, receiptId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }));

    res.json({ message: 'Receipt updated successfully' });
  } catch (error) {
    console.error('Error updating receipt:', error);
    res.status(500).json({ message: 'Error updating receipt' });
  }
});

app.delete('/receipts/:receiptId', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const { receiptId } = req.params;

    console.log('Deleting receipt:', { userId, receiptId });

    // First verify the receipt belongs to the user
    const existingReceipt = await dynamodb.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE || 'receipts-dev',
      Key: { userId, receiptId }
    }));

    if (!existingReceipt.Item) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    await dynamodb.send(new DeleteCommand({
      TableName: process.env.DYNAMODB_TABLE || 'receipts-dev',
      Key: { userId, receiptId }
    }));

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({ message: 'Error deleting receipt' });
  }
});

// Settings endpoints
app.get('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const result = await dynamodb.send(new GetCommand({
      TableName: 'user_settings',  // Use exact table name
      Key: { userId }
    }));

    const settings = result.Item || {
      userId,
      currency: 'USD',
      emailNotifications: true,
      autoCategories: true
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

app.put('/settings/currency', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const { currency } = req.body;

    if (!currency) {
      return res.status(400).json({ message: 'Currency is required' });
    }

    // Get existing settings first
    const existingSettings = await dynamodb.send(new GetCommand({
      TableName: 'user_settings',
      Key: { userId }
    }));

    await dynamodb.send(new PutCommand({
      TableName: 'user_settings',
      Item: {
        ...(existingSettings.Item || {}),
        userId,
        currency,
        updatedAt: new Date().toISOString()
      }
    }));

    res.json({ message: 'Currency updated successfully', currency });
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({ message: 'Error updating currency' });
  }
});

app.put('/settings/state', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const { state } = req.body;

    // Get existing settings first
    const existingSettings = await dynamodb.send(new GetCommand({
      TableName: 'user_settings',
      Key: { userId }
    }));

    // Make sure user has USD currency before allowing state
    if (existingSettings.Item?.currency !== 'USD' && state) {
      return res.status(400).json({ message: 'State can only be set when currency is USD' });
    }

    await dynamodb.send(new PutCommand({
      TableName: 'user_settings',
      Item: {
        ...(existingSettings.Item || {}),
        userId,
        state,
        updatedAt: new Date().toISOString()
      }
    }));

    res.json({ message: 'State updated successfully', state });
  } catch (error) {
    console.error('Error updating state:', error);
    res.status(500).json({ message: 'Error updating state' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
