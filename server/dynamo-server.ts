import express from 'express';
import cors from 'cors';
import { DynamoDBClient, DynamoDB, S3 } from 'aws-sdk';
import { TextractClient, AnalyzeExpenseCommand } from "@aws-sdk/client-textract";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS
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

// Parse JSON from form data
app.use((req, res, next) => {
  if (req.body && req.body.json) {
    try {
      req.body = JSON.parse(req.body.json);
    } catch (err) {
      console.error('Error parsing JSON from form data:', err);
    }
  }
  next();
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize Cognito JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: "id",
  clientId: process.env.COGNITO_CLIENT_ID!
});

console.log('Cognito Verifier Configuration:', {
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID
});

// Authentication middleware
const checkAuth = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No Bearer token found');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received:', token.substring(0, 20) + '...');
    
    try {
      const payload = await verifier.verify(token);
      console.log('Token verified successfully. User:', payload.email);
      
      // Add user info to request
      req.user = {
        sub: payload.sub,
        email: payload.email
      };
      
      next();
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// ===== AWS Configuration =====
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const textract = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

// Initialize DynamoDB table
const initializeDatabase = async () => {
  const dynamodbRaw = new DynamoDB({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });

  const tableName = process.env.DYNAMODB_TABLE || 'receipts';
  
  try {
    await dynamodbRaw.describeTable({ TableName: tableName }).promise();
    console.log(`Table ${tableName} exists`);
  } catch (error: any) {
    if (error.code === 'ResourceNotFoundException') {
      console.log(`Creating table ${tableName}...`);
      try {
        await dynamodbRaw.createTable({
          TableName: tableName,
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
            { AttributeName: 'receiptId', KeyType: 'RANGE' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'receiptId', AttributeType: 'S' }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }).promise();
        console.log(`Table ${tableName} created successfully`);
      } catch (createError) {
        console.error('Error creating table:', createError);
      }
    } else {
      console.error('Error checking table:', error);
    }
  }
};

// Initialize database on startup
initializeDatabase().catch(console.error);

// Test endpoint to verify server is running
app.get('/test', checkAuth, (req, res) => {
  res.json({ message: 'Server is running', user: req.user });
});

// Receipt endpoints
app.get('/receipts', checkAuth, async (req, res) => {
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE!,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': req.user.sub
      }
    };

    const command = new DynamoDB.DocumentClient.Scan(params);
    const data = await dynamodb.send(command);
    
    res.json(data.Items || []);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ message: 'Failed to fetch receipts' });
  }
});

app.post('/receipts', checkAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { merchant, total, date, category = 'Other', items = [], tax = null } = req.body;
    const receiptId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const receipt = {
      userId,
      receiptId,
      id: receiptId,
      merchant,
      total,
      date,
      category,
      items,
      tax,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating receipt:', receipt);

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

app.put('/receipts/:receiptId', checkAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { receiptId } = req.params;
    const updates = req.body;

    // First verify the receipt belongs to the user
    const existingReceipt = await dynamodb.get({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      Key: { userId, receiptId }
    }).promise();

    if (!existingReceipt.Item) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    // Update the receipt
    const updatedReceipt = {
      ...existingReceipt.Item,
      ...updates,
      userId, // Ensure userId remains unchanged
      receiptId, // Ensure receiptId remains unchanged
      updatedAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      Item: updatedReceipt
    }).promise();

    console.log('Updated receipt:', updatedReceipt);
    res.json(updatedReceipt);
  } catch (error) {
    console.error('Error updating receipt:', error);
    res.status(500).json({ message: 'Error updating receipt' });
  }
});

app.delete('/receipts/:receiptId', checkAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
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

// Upload endpoints
app.post('/upload-url', checkAuth, async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    const userId = req.user.sub; // Get from auth
    const timestamp = Date.now();
    const key = `receipts/${userId}/${timestamp}/${fileName}`;

    const uploadUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Expires: 300 // URL expires in 5 minutes
    });

    res.json({
      uploadUrl,
      key,
      url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ message: 'Error generating upload URL' });
  }
});

app.post('/process', checkAuth, async (req, res) => {
  try {
    const { key } = req.body;
    const userId = req.user.sub; // Get from auth

    // Analyze with Textract
    const command = new AnalyzeExpenseCommand({
      Document: {
        S3Object: {
          Bucket: process.env.BUCKET_NAME,
          Name: key
        }
      }
    });

    console.log('Processing receipt for user:', userId);
    const textractResponse = await textract.send(command);
    console.log('Textract response received');
    const summaryFields = textractResponse.ExpenseDocuments?.[0]?.SummaryFields || [];
    const lineItemGroups = textractResponse.ExpenseDocuments?.[0]?.LineItemGroups || [];
    
    // Extract relevant information
    const extractedData = {
      merchant: extractMerchantName(summaryFields),
      total: extractTotal(summaryFields),
      date: extractDate(summaryFields),
      items: extractLineItems(lineItemGroups),
      tax: extractTaxInformation(summaryFields),
      category: extractCategory(summaryFields)
    };

    // Store the processed data
    const receiptId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const receipt = {
      userId,
      receiptId,
      id: receiptId,
      merchant: extractedData.merchant || 'Unknown Merchant',
      total: extractedData.total || 0,
      date: extractedData.date || new Date().toISOString().split('T')[0],
      items: extractedData.items || [],
      tax: extractedData.tax || { total: 0 },
      imageUrl: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`,
      status: 'completed',
      category: extractedData.category || 'Other',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Processed receipt:', receipt);

    await dynamodb.send({
      TableName: process.env.DYNAMODB_TABLE || 'receipts',
      Item: receipt
    }).promise();

    res.json({
      message: 'Receipt processed successfully',
      receipt
    });
  } catch (error) {
    console.error('Error processing receipt:', error);
    res.status(500).json({ message: 'Error processing receipt' });
  }
});

// Profile image upload endpoint
app.post('/profile/upload-url', checkAuth, async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    const userId = req.user.sub;
    const key = `profiles/${userId}/${fileName}`;

    const uploadUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Expires: 300 // URL expires in 5 minutes
    });

    res.json({
      uploadUrl,
      key,
      url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`
    });
  } catch (error) {
    console.error('Error generating profile upload URL:', error);
    res.status(500).json({ message: 'Error generating upload URL' });
  }
});

// Update user profile endpoint
app.put('/profile', checkAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { photoURL } = req.body;

    // Update user profile in DynamoDB
    await dynamodb.update({
      TableName: process.env.USERS_TABLE || 'users',
      Key: { userId },
      UpdateExpression: 'set photoURL = :photoURL, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':photoURL': photoURL,
        ':updatedAt': new Date().toISOString()
      }
    }).promise();

    res.json({ message: 'Profile updated successfully', photoURL });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Update currency preference endpoint
app.put('/settings/currency', checkAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { currency } = req.body;

    // Validate currency
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
    if (!validCurrencies.includes(currency)) {
      return res.status(400).json({ message: 'Invalid currency' });
    }

    // Update user settings in DynamoDB
    await dynamodb.update({
      TableName: process.env.USERS_TABLE || 'users',
      Key: { userId },
      UpdateExpression: 'set currency = :currency, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':currency': currency,
        ':updatedAt': new Date().toISOString()
      }
    }).promise();

    res.json({ message: 'Currency updated successfully', currency });
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({ message: 'Error updating currency' });
  }
});

// Get user settings endpoint
app.get('/settings', checkAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    // Get user settings from DynamoDB
    const result = await dynamodb.get({
      TableName: process.env.USERS_TABLE || 'users',
      Key: { userId }
    }).promise();

    const settings = result.Item || {
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

// Helper functions for extracting data from Textract response
function extractMerchantName(summaryFields: any[]): string {
  const merchantField = summaryFields.find(field => 
    field.Type?.Text?.toLowerCase() === 'vendor' ||
    field.Type?.Text?.toLowerCase() === 'merchant'
  );
  return merchantField?.ValueDetection?.Text || 'Unknown Merchant';
}

function extractTotal(summaryFields: any[]): number {
  const totalField = summaryFields.find(field =>
    field.Type?.Text?.toLowerCase() === 'total' ||
    field.Type?.Text?.toLowerCase() === 'amount_due' ||
    field.Type?.Text?.toLowerCase() === 'amount'
  );
  const totalText = totalField?.ValueDetection?.Text || '0';
  return parseFloat(totalText.replace(/[^0-9.]/g, '')) || 0;
}

function extractDate(summaryFields: any[]): string {
  const dateField = summaryFields.find(field =>
    field.Type?.Text?.toLowerCase() === 'invoice_receipt_date' ||
    field.Type?.Text?.toLowerCase() === 'date'
  );
  return dateField?.ValueDetection?.Text || new Date().toISOString();
}

function extractLineItems(lineItemGroups: any[]): Array<{ description: string; price: number }> {
  const items: Array<{ description: string; price: number }> = [];
  
  for (const group of lineItemGroups) {
    for (const lineItem of (group.LineItems || [])) {
      const item = {
        description: '',
        price: 0
      };

      for (const field of lineItem.LineItemExpenseFields || []) {
        if (field.Type?.Text?.toLowerCase() === 'item') {
          item.description = field.ValueDetection?.Text || '';
        } else if (field.Type?.Text?.toLowerCase() === 'price') {
          const priceText = field.ValueDetection?.Text || '0';
          item.price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        }
      }

      if (item.description || item.price) {
        items.push(item);
      }
    }
  }

  return items;
}

function extractTaxInformation(summaryFields: any[]): { total: number; breakdown?: any } {
  const taxFields = summaryFields.filter(field =>
    field.Type?.Text?.toLowerCase().includes('tax')
  );

  let totalTax = 0;
  const breakdown: any = {};

  for (const field of taxFields) {
    const type = field.Type?.Text?.toLowerCase();
    const value = field.ValueDetection?.Text || '0';
    const amount = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;

    if (type === 'tax' || type === 'total_tax') {
      totalTax = amount;
    } else if (type.includes('sales_tax')) {
      breakdown.salesTax = amount;
    } else if (type.includes('state_tax')) {
      breakdown.stateTax = amount;
    } else if (type.includes('local_tax')) {
      breakdown.localTax = amount;
    } else {
      if (!breakdown.otherTaxes) breakdown.otherTaxes = [];
      breakdown.otherTaxes.push({
        name: field.Type?.Text || 'Other Tax',
        amount
      });
    }
  }

  return {
    total: totalTax,
    ...(Object.keys(breakdown).length > 0 ? { breakdown } : {})
  };
}

function extractCategory(summaryFields: any[]): string {
  const categoryField = summaryFields.find(field => 
    field.Type?.Text?.toLowerCase() === 'category'
  );
  return categoryField?.ValueDetection?.Text || 'Other';
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:3000`);
});
