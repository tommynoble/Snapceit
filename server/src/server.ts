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

// Middleware
app.use(cors());
app.use(express.json());

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
app.get('/receipts/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user is accessing their own data
    if (userId !== (req as any).user.sub) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const result = await dynamodb.query({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();

    res.json(result.Items);
  } catch (error) {
    console.error('Error listing receipts:', error);
    res.status(500).json({ message: 'Error listing receipts' });
  }
});

app.get('/receipts/:userId/:receiptId', authenticateToken, async (req, res) => {
  try {
    const { userId, receiptId } = req.params;
    
    // Verify user is accessing their own data
    if (userId !== (req as any).user.sub) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const result = await dynamodb.get({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      Key: {
        userId,
        receiptId
      }
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json(result.Item);
  } catch (error) {
    console.error('Error getting receipt:', error);
    res.status(500).json({ message: 'Error getting receipt' });
  }
});

app.post('/receipts', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const receipt = {
      ...req.body,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

app.put('/receipts/:userId/:receiptId', authenticateToken, async (req, res) => {
  try {
    const { userId, receiptId } = req.params;
    
    // Verify user is updating their own data
    if (userId !== (req as any).user.sub) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const result = await dynamodb.update({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
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

    res.json(result.Attributes);
  } catch (error) {
    console.error('Error updating receipt:', error);
    res.status(500).json({ message: 'Error updating receipt' });
  }
});

app.delete('/receipts/:userId/:receiptId', authenticateToken, async (req, res) => {
  try {
    const { userId, receiptId } = req.params;
    
    // Verify user is deleting their own data
    if (userId !== (req as any).user.sub) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    await dynamodb.delete({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      Key: {
        userId,
        receiptId
      }
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
