import { Router } from 'express';
import multer from 'multer';
import { pool } from '../db/config';
import { ErrorResponse, SuccessResponse } from '../types';
import s3Service from '../services/s3';
import textractService from '../services/textract';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload and process a receipt
router.post('/upload', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded', 
        statusCode: 400 
      } as ErrorResponse);
    }

    const userId = req.user?.id;
    
    // Upload to S3
    const { bucket, key } = await s3Service.uploadReceipt(req.file, userId);
    
    // Analyze with Textract
    const receiptData = await textractService.analyzeReceipt(bucket, key);
    
    // Save to database
    const result = await pool.query(
      `INSERT INTO receipts (
        user_id, merchant, amount, date, items, image_url, 
        raw_text, status, s3_key
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        userId,
        receiptData.merchant,
        receiptData.total,
        receiptData.date,
        JSON.stringify(receiptData.items),
        `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        JSON.stringify(receiptData.rawData),
        'processed',
        key
      ]
    );
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0] 
    } as SuccessResponse);
  } catch (error) {
    console.error('Receipt upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process receipt', 
      statusCode: 500 
    } as ErrorResponse);
  }
});

// Get all receipts (temporarily without user filtering)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM receipts ORDER BY date DESC LIMIT 100'
    );
    res.json({ success: true, data: result.rows } as SuccessResponse);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts', statusCode: 500 } as ErrorResponse);
  }
});

// Get a single receipt
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM receipts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found', statusCode: 404 } as ErrorResponse);
    }
    
    res.json({ success: true, data: result.rows[0] } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch receipt', statusCode: 500 } as ErrorResponse);
  }
});

// Create a new receipt
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { merchant, amount, date, category, items } = req.body;
    
    const result = await pool.query(
      `INSERT INTO receipts (user_id, merchant, amount, date, category, items)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, merchant, amount, date, category, items]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create receipt', statusCode: 500 } as ErrorResponse);
  }
});

// Update a receipt
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { merchant, amount, date, category, items } = req.body;
    
    const result = await pool.query(
      `UPDATE receipts 
       SET merchant = $1, amount = $2, date = $3, category = $4, items = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [merchant, amount, date, category, items, id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found', statusCode: 404 } as ErrorResponse);
    }
    
    res.json({ success: true, data: result.rows[0] } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update receipt', statusCode: 500 } as ErrorResponse);
  }
});

// Delete a receipt
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    // Get the S3 key before deleting
    const getResult = await pool.query(
      'SELECT s3_key FROM receipts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (getResult.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found', statusCode: 404 } as ErrorResponse);
    }
    
    // Delete from database
    const result = await pool.query(
      'DELETE FROM receipts WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    
    // Delete from S3 (don't wait for it)
    if (result.rows[0].s3_key) {
      s3Service.deleteFile(result.rows[0].s3_key).catch(error => {
        console.error('Failed to delete S3 file:', error);
      });
    }
    
    res.json({ success: true, data: result.rows[0] } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete receipt', statusCode: 500 } as ErrorResponse);
  }
});

export default router;
