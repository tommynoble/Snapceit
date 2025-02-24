import { Router } from 'express';
import { ErrorResponse, SuccessResponse } from '../types';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { updateUserSchema } from '../schemas/user.schema';
import pool from '../db/config';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DYNAMODB_CONFIG, TABLES } from '../config/dynamodb';

const router = Router();
const client = new DynamoDBClient(DYNAMODB_CONFIG);
const dynamoDB = DynamoDBDocumentClient.from(client);

// Add authenticateUser middleware to all routes
router.use(authenticateUser);

// Get user profile with settings (PostgreSQL)
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user!.uid;
    
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u."firstName",
        u."lastName",
        u."accountStatus",
        u."emailVerified",
        u."createdAt",
        u."updatedAt"
      FROM users u
      WHERE u.id = $1
    `;
    
    const { rows } = await pool.query(userQuery, [userId]);
    const user = rows[0];
    
    if (!user) {
      // Create user if they don't exist in our database
      const createUserQuery = `
        INSERT INTO users (id, email)
        VALUES ($1, $2)
        RETURNING 
          id,
          email,
          "firstName",
          "lastName",
          "accountStatus",
          "emailVerified",
          "createdAt",
          "updatedAt"
      `;
      
      const { rows: [newUser] } = await pool.query(createUserQuery, [userId, req.user!.email]);
      return res.json({ success: true, data: newUser } as SuccessResponse);
    }
    
    const params = {
      TableName: TABLES.USER_SETTINGS,
      Key: { userId }
    };
    
    const result = await dynamoDB.send(new GetCommand(params));
    const settings = result.Item || {};
    
    res.json({ success: true, data: { ...user, settings } } as SuccessResponse);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile', statusCode: 500 } as ErrorResponse);
  }
});

// Get user settings
router.get('/settings', async (req, res) => {
  try {
    const userId = req.user!.uid;
    const params = {
      TableName: TABLES.USER_SETTINGS,
      Key: { userId }
    };
    
    const result = await dynamoDB.send(new GetCommand(params));
    const settings = result.Item || {};
    
    res.json({ success: true, data: settings } as SuccessResponse);
  } catch (error) {
    console.error('Failed to get user settings:', error);
    res.status(500).json({ error: 'Failed to get settings', statusCode: 500 } as ErrorResponse);
  }
});

// Update user settings
router.put('/settings', async (req, res) => {
  try {
    const userId = req.user!.uid;
    const updates = req.body;
    
    const params = {
      TableName: TABLES.USER_SETTINGS,
      Key: { userId },
      UpdateExpression: 'SET ' + Object.keys(updates)
        .map((key) => `#${key} = :${key}`)
        .join(', ') + ', #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ...Object.entries(updates).reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {}),
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    };
    
    const result = await dynamoDB.send(new UpdateCommand(params));
    res.json({ success: true, data: result.Attributes } as SuccessResponse);
  } catch (error) {
    console.error('Failed to update user settings:', error);
    res.status(500).json({ error: 'Failed to update settings', statusCode: 500 } as ErrorResponse);
  }
});

// Get user receipts (DynamoDB)
router.get('/receipts', async (req, res) => {
  try {
    const userId = req.user!.uid;
    
    const params = {
      TableName: TABLES.RECEIPTS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    
    const result = await dynamoDB.send(new QueryCommand(params));
    
    res.json({ 
      success: true, 
      data: result.Items 
    } as SuccessResponse);
  } catch (error) {
    console.error('Failed to get user receipts:', error);
    res.status(500).json({ error: 'Failed to get receipts', statusCode: 500 } as ErrorResponse);
  }
});

// Update user profile
router.put('/profile', validateRequest(updateUserSchema), async (req, res) => {
  try {
    const userId = req.user!.uid;
    const { firstName, lastName, accountStatus, emailVerified } = req.body;
    
    const updateUserQuery = `
      UPDATE users
      SET 
        "firstName" = COALESCE($1, "firstName"),
        "lastName" = COALESCE($2, "lastName"),
        "accountStatus" = COALESCE($3, "accountStatus"),
        "emailVerified" = COALESCE($4, "emailVerified"),
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING 
        id,
        email,
        "firstName",
        "lastName",
        "accountStatus",
        "emailVerified",
        "createdAt",
        "updatedAt"
    `;
    
    const { rows: [user] } = await pool.query(updateUserQuery, [
      firstName, 
      lastName, 
      accountStatus, 
      emailVerified, 
      userId
    ]);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found', 
        statusCode: 404 
      } as ErrorResponse);
    }
    
    res.json({ success: true, data: user } as SuccessResponse);
  } catch (error) {
    console.error('Failed to update user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile', statusCode: 500 } as ErrorResponse);
  }
});

export default router;
