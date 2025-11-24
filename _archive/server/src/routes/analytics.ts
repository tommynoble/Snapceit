import { Router } from 'express';
import { pool } from '../db/config';
import { ErrorResponse, SuccessResponse } from '../types';

const router = Router();

// Get dashboard summary (Recent receipts, Total receipts, Total spending, Tax summary)
router.get('/dashboard', async (req, res) => {
  try {
    // Get recent receipts
    const recentReceipts = await pool.query(`
      SELECT 
        id, merchant, amount, date, category, image_url
      FROM receipts 
      ORDER BY date DESC 
      LIMIT 5
    `);

    // Get total counts and sums
    const summary = await pool.query(`
      SELECT 
        COUNT(*) as total_receipts,
        SUM(amount) as total_spending,
        SUM(tax) as total_tax,
        AVG(amount) as average_spending
      FROM receipts
    `);

    // Get category breakdown
    const categories = await pool.query(`
      SELECT 
        category,
        COUNT(*) as receipt_count,
        SUM(amount) as total_amount
      FROM receipts
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY total_amount DESC
    `);

    // Calculate monthly spending trend
    const monthlyTrend = await pool.query(`
      SELECT 
        DATE_TRUNC('month', date) as month,
        COUNT(*) as receipt_count,
        SUM(amount) as total_amount,
        SUM(tax) as total_tax
      FROM receipts
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      success: true,
      data: {
        recentReceipts: recentReceipts.rows,
        summary: {
          totalReceipts: parseInt(summary.rows[0].total_receipts),
          totalSpending: parseFloat(summary.rows[0].total_spending) || 0,
          totalTax: parseFloat(summary.rows[0].total_tax) || 0,
          averageSpending: parseFloat(summary.rows[0].average_spending) || 0
        },
        categories: categories.rows.map(cat => ({
          name: cat.category,
          count: parseInt(cat.receipt_count),
          total: parseFloat(cat.total_amount)
        })),
        monthlyTrend: monthlyTrend.rows.map(month => ({
          month: month.month,
          count: parseInt(month.receipt_count),
          amount: parseFloat(month.total_amount),
          tax: parseFloat(month.total_tax)
        }))
      }
    } as SuccessResponse);
  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    res.status(500).json({
      error: 'Failed to get dashboard analytics',
      statusCode: 500
    } as ErrorResponse);
  }
});

// Get spending analytics
router.get('/spending', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(category, 'Uncategorized') as category,
        COUNT(*) as count,
        SUM(amount) as total,
        SUM(tax) as total_tax,
        AVG(amount) as average_amount
      FROM receipts 
      GROUP BY category
      ORDER BY total DESC
    `);
    
    // If no data, return empty analytics
    if (result.rows.length === 0) {
      return res.json({ 
        success: true, 
        data: {
          totalSpending: 0,
          totalTax: 0,
          averageSpending: 0,
          categories: [],
          monthlyTrend: []
        }
      } as SuccessResponse);
    }

    const totalSpending = result.rows.reduce((sum, row) => sum + parseFloat(row.total), 0);
    const totalTax = result.rows.reduce((sum, row) => sum + parseFloat(row.total_tax), 0);
    
    const categories = result.rows.map(row => ({
      name: row.category,
      count: parseInt(row.count),
      total: parseFloat(row.total),
      average: parseFloat(row.average_amount),
      percentage: (parseFloat(row.total) / totalSpending) * 100
    }));

    const monthlyTrend = await pool.query(`
      SELECT 
        DATE_TRUNC('month', date) as month,
        COUNT(*) as count,
        SUM(amount) as total,
        SUM(tax) as tax
      FROM receipts 
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({ 
      success: true, 
      data: {
        totalSpending,
        totalTax,
        averageSpending: totalSpending / result.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
        categories,
        monthlyTrend: monthlyTrend.rows.map(row => ({
          month: row.month,
          count: parseInt(row.count),
          total: parseFloat(row.total),
          tax: parseFloat(row.tax)
        }))
      }
    } as SuccessResponse);
  } catch (error) {
    console.error('Error getting spending analytics:', error);
    res.status(500).json({ 
      error: 'Failed to get spending analytics', 
      statusCode: 500 
    } as ErrorResponse);
  }
});

// Get tax summary
router.get('/tax', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', date) as month,
        COUNT(*) as receipt_count,
        SUM(tax) as total_tax,
        AVG(tax) as average_tax,
        MIN(tax) as min_tax,
        MAX(tax) as max_tax
      FROM receipts 
      WHERE tax > 0
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month DESC
      LIMIT 12
    `);

    const summary = await pool.query(`
      SELECT 
        SUM(tax) as total_tax,
        AVG(tax) as average_tax,
        COUNT(*) as taxed_receipts
      FROM receipts 
      WHERE tax > 0
    `);

    res.json({
      success: true,
      data: {
        summary: {
          totalTax: parseFloat(summary.rows[0].total_tax) || 0,
          averageTax: parseFloat(summary.rows[0].average_tax) || 0,
          taxedReceipts: parseInt(summary.rows[0].taxed_receipts)
        },
        monthlyTrend: result.rows.map(row => ({
          month: row.month,
          count: parseInt(row.receipt_count),
          total: parseFloat(row.total_tax),
          average: parseFloat(row.average_tax),
          min: parseFloat(row.min_tax),
          max: parseFloat(row.max_tax)
        }))
      }
    } as SuccessResponse);
  } catch (error) {
    console.error('Error getting tax summary:', error);
    res.status(500).json({ 
      error: 'Failed to get tax summary', 
      statusCode: 500 
    } as ErrorResponse);
  }
});

export default router;
