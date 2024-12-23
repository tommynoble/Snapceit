import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorResponse, SuccessResponse, SpendingAnalytics, MerchantAnalytics, MonthlyReport } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Get spending analytics
router.get('/spending', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const receipts = await prisma.receipt.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    
    // Calculate analytics
    const totalSpent = receipts.reduce((sum, receipt) => sum + receipt.total, 0);
    const averagePerTransaction = totalSpent / receipts.length;
    
    // Calculate category breakdown
    const categoryTotals = receipts.reduce((acc, receipt) => {
      const category = receipt.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + receipt.total;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalSpent) * 100,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // Calculate monthly trend
    const monthlyTrend = await prisma.$queryRaw`
      SELECT DATE_TRUNC('month', date) as month, SUM(total) as amount
      FROM "Receipt"
      WHERE "userId" = ${userId}
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month DESC
      LIMIT 12
    `;
    
    const analytics: SpendingAnalytics = {
      totalSpent,
      averagePerTransaction,
      topCategories,
      monthlyTrend,
    };
    
    res.json({ success: true, data: analytics } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spending analytics', statusCode: 500 } as ErrorResponse);
  }
});

// Get category-based analytics
router.get('/categories', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const categoryAnalytics = await prisma.$queryRaw`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(total) as total_spent,
        AVG(total) as average_transaction
      FROM "Receipt"
      WHERE "userId" = ${userId}
      GROUP BY category
      ORDER BY total_spent DESC
    `;
    
    res.json({ success: true, data: categoryAnalytics } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category analytics', statusCode: 500 } as ErrorResponse);
  }
});

// Get merchant analytics
router.get('/merchants', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const merchantAnalytics: MerchantAnalytics = {
      topMerchants: await prisma.$queryRaw`
        SELECT 
          merchant,
          SUM(total) as total_spent,
          COUNT(*) as transaction_count,
          AVG(total) as average_transaction
        FROM "Receipt"
        WHERE "userId" = ${userId}
        GROUP BY merchant
        ORDER BY total_spent DESC
        LIMIT 10
      `,
    };
    
    res.json({ success: true, data: merchantAnalytics } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch merchant analytics', statusCode: 500 } as ErrorResponse);
  }
});

// Generate monthly report
router.get('/reports/monthly', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { month, year } = req.query;
    
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);
    
    const receipts = await prisma.receipt.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    
    const report: MonthlyReport = {
      month: startDate.toLocaleString('default', { month: 'long' }),
      year: Number(year),
      totalSpent: receipts.reduce((sum, receipt) => sum + receipt.total, 0),
      receiptCount: receipts.length,
      categoryBreakdown: [], // Calculate category breakdown
      merchantBreakdown: [], // Calculate merchant breakdown
    };
    
    res.json({ success: true, data: report } as SuccessResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate monthly report', statusCode: 500 } as ErrorResponse);
  }
});

export default router;
