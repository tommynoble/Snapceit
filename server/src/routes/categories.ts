import { Router } from 'express';
import { pool } from '../db/config';
import { ErrorResponse, SuccessResponse } from '../types';

const router = Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT category 
      FROM receipts 
      WHERE category IS NOT NULL 
      ORDER BY category
    `);
    
    res.json({ 
      success: true, 
      data: result.rows.map(row => row.category) 
    } as SuccessResponse);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories', 
      statusCode: 500 
    } as ErrorResponse);
  }
});

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        error: 'Category name is required', 
        statusCode: 400 
      } as ErrorResponse);
    }

    // Check if category already exists
    const existingResult = await pool.query(`
      SELECT category 
      FROM receipts 
      WHERE category = $1 
      LIMIT 1
    `, [name]);

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Category already exists', 
        statusCode: 400 
      } as ErrorResponse);
    }

    // Since we're not using a separate categories table anymore,
    // we'll just return success if the category doesn't exist
    res.status(201).json({ 
      success: true, 
      data: { name } 
    } as SuccessResponse);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      error: 'Failed to create category', 
      statusCode: 500 
    } as ErrorResponse);
  }
});

export default router;
