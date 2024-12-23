import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorResponse, SuccessResponse } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Get all receipts for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id; // Assuming you have authentication middleware
    const receipts = await prisma.receipt.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    res.json({ success: true, data: receipts } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch receipts', statusCode: 500 } as ErrorResponse);
  }
});

// Get a specific receipt
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const receipt = await prisma.receipt.findFirst({
      where: { id, userId },
    });
    
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found', statusCode: 404 } as ErrorResponse);
    }
    
    res.json({ success: true, data: receipt } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch receipt', statusCode: 500 } as ErrorResponse);
  }
});

// Update a receipt
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData = req.body;
    
    const receipt = await prisma.receipt.findFirst({
      where: { id, userId },
    });
    
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found', statusCode: 404 } as ErrorResponse);
    }
    
    const updatedReceipt = await prisma.receipt.update({
      where: { id },
      data: updateData,
    });
    
    res.json({ success: true, data: updatedReceipt } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update receipt', statusCode: 500 } as ErrorResponse);
  }
});

// Delete a receipt
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const receipt = await prisma.receipt.findFirst({
      where: { id, userId },
    });
    
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found', statusCode: 404 } as ErrorResponse);
    }
    
    await prisma.receipt.delete({
      where: { id },
    });
    
    res.json({ success: true, data: { message: 'Receipt deleted successfully' } } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete receipt', statusCode: 500 } as ErrorResponse);
  }
});

export default router;
