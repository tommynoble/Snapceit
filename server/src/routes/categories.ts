import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorResponse, SuccessResponse } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    
    res.json({ success: true, data: categories } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories', statusCode: 500 } as ErrorResponse);
  }
});

// Create custom category
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name } = req.body;
    
    const existingCategory = await prisma.category.findFirst({
      where: { userId, name },
    });
    
    if (existingCategory) {
      return res.status(400).json({ 
        error: 'Category already exists', 
        statusCode: 400 
      } as ErrorResponse);
    }
    
    const category = await prisma.category.create({
      data: {
        userId,
        name,
        type: 'custom',
      },
    });
    
    res.status(201).json({ success: true, data: category } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category', statusCode: 500 } as ErrorResponse);
  }
});

// Delete custom category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found', statusCode: 404 } as ErrorResponse);
    }
    
    if (category.type !== 'custom') {
      return res.status(400).json({ 
        error: 'Cannot delete default category', 
        statusCode: 400 
      } as ErrorResponse);
    }
    
    await prisma.category.delete({
      where: { id },
    });
    
    res.json({ 
      success: true, 
      data: { message: 'Category deleted successfully' } 
    } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category', statusCode: 500 } as ErrorResponse);
  }
});

export default router;
