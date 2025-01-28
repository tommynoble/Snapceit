import express from 'express';
import cors from 'cors';
import { DynamoDB, S3, Textract } from 'aws-sdk';
import { CognitoJwtVerifier } from "aws-jwt-verify";
import dotenv from 'dotenv';
import { analyzeReceiptFromS3 } from './utils/textract';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5184'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Configure AWS
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
};

const dynamodb = new DynamoDB.DocumentClient(awsConfig);
const s3 = new S3(awsConfig);
const textract = new Textract(awsConfig);

// Constants
const BUCKET_NAME = process.env.BUCKET_NAME || 'snapceit-receipts-dev';

// Temporary middleware for development
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // For development, we'll skip token verification
    (req as any).user = {
      sub: 'test-user',
      email: 'test@example.com'
    };
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Receipt Processing Endpoint
app.post('/process', authenticateToken, async (req, res) => {
  try {
    const { imageKey } = req.body;
    const userId = (req as any).user.sub;

    // Analyze with Textract
    const extractedData = await analyzeReceiptFromS3(BUCKET_NAME, imageKey);

    // Create receipt record
    const receipt = {
      userId,
      receiptId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      imageUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`,
      merchantName: extractedData.merchantName,
      total: extractedData.total,
      date: extractedData.date,
      items: extractedData.items,
      tax: extractedData.tax,
      status: 'processed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to DynamoDB
    await dynamodb.put({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      Item: receipt
    }).promise();

    res.json(receipt);
  } catch (error) {
    console.error('Error processing receipt:', error);
    res.status(500).json({ message: 'Error processing receipt' });
  }
});

// S3 Upload Endpoint
app.post('/upload-url', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.body;
    const userId = (req as any).user.sub;
    const timestamp = Date.now();
    const imageKey = `receipts/${userId}/${timestamp}/${filename}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: imageKey,
      Expires: 3600, // URL expires in 1 hour
      ContentType: 'image/*'
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

    res.json({
      uploadUrl,
      imageKey
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ message: 'Error generating upload URL' });
  }
});

// Receipt CRUD Endpoints
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
    console.error('Error listing receipts:', error);
    res.status(500).json({ message: 'Error listing receipts' });
  }
});

app.get('/receipts/:receiptId', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const { receiptId } = req.params;

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

app.put('/receipts/:receiptId', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const { receiptId } = req.params;
    const updates = req.body;

    // Remove any fields that shouldn't be updated
    delete updates.userId;
    delete updates.receiptId;
    delete updates.createdAt;

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    Object.keys(updates).forEach((key, index) => {
      updateExpressions.push(`#field${index} = :value${index}`);
      expressionAttributeNames[`#field${index}`] = key;
      expressionAttributeValues[`:value${index}`] = updates[key];
    });

    // Add updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await dynamodb.update({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      Key: {
        userId,
        receiptId
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }).promise();

    res.json(result.Attributes);
  } catch (error) {
    console.error('Error updating receipt:', error);
    res.status(500).json({ message: 'Error updating receipt' });
  }
});

app.delete('/receipts/:receiptId', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const { receiptId } = req.params;

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
