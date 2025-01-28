import express from 'express';
import cors from 'cors';
import { DynamoDB } from 'aws-sdk';
import { CognitoJwtVerifier } from "aws-jwt-verify";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure AWS
const dynamodb = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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

// Auth middleware
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifier.verify(token);
    
    // Add user info to request
    (req as any).user = {
      sub: payload.sub,
      email: payload.email
    };
    
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.get('/receipts', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.sub;

    const result = await dynamodb.query({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();

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

    await dynamodb.put({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      Item: receipt
    }).promise();

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

    // First verify the receipt belongs to the user
    const existingReceipt = await dynamodb.get({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      Key: { userId, receiptId }
    }).promise();

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

    await dynamodb.update({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      Key: { userId, receiptId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }).promise();

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

    // First verify the receipt belongs to the user
    const existingReceipt = await dynamodb.get({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      Key: { userId, receiptId }
    }).promise();

    if (!existingReceipt.Item) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    await dynamodb.delete({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      Key: { userId, receiptId }
    }).promise();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({ message: 'Error deleting receipt' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
