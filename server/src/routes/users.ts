import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorResponse, SuccessResponse } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Get user profile with settings
router.get('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        settings: true,
        receipts: {
          take: 5,
          orderBy: { date: 'desc' }
        }
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found', statusCode: 404 } as ErrorResponse);
    }
    
    res.json({ success: true, data: user } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile', statusCode: 500 } as ErrorResponse);
  }
});

// Update user profile
router.put('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email } = req.body;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, email },
      include: { settings: true }
    });
    
    res.json({ success: true, data: user } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user profile', statusCode: 500 } as ErrorResponse);
  }
});

// Update user settings
router.put('/:userId/settings', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      notificationEmail,
      notificationPush,
      notificationSms,
      preferredCurrency,
      language,
      timezone
    } = req.body;
    
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        notificationEmail,
        notificationPush,
        notificationSms,
        preferredCurrency,
        language,
        timezone
      },
      create: {
        userId,
        notificationEmail,
        notificationPush,
        notificationSms,
        preferredCurrency,
        language,
        timezone
      },
    });
    
    res.json({ success: true, data: settings } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user settings', statusCode: 500 } as ErrorResponse);
  }
});

export default router;
