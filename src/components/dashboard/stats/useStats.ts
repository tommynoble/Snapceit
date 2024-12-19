import { useReceipts } from '../receipts/ReceiptContext';

export function useStats() {
  const { receipts, loading } = useReceipts();

  if (loading) {
    return {
      totalReceipts: {
        value: 0,
        trend: { value: 0, isPositive: true }
      },
      monthlySpending: {
        value: 0,
        trend: { value: 0, isPositive: true }
      },
      totalSpending: {
        value: 0
      },
      totalTax: {
        value: 0,
        breakdown: {
          salesTax: 0,
          stateTax: 0,
          localTax: 0,
          otherTaxes: []
        }
      },
      averageTransaction: {
        value: 0,
        trend: { value: 0, isPositive: true }
      },
      categoryBreakdown: {},
      categoryCounts: {},
      loading: true
    };
  }

  // Calculate total spending and tax across all receipts
  const { totalSpending, totalTax } = receipts.reduce((acc, receipt) => {
    try {
      // Calculate total amount
      const amount = typeof receipt.total === 'number' ? receipt.total : 
                    typeof receipt.total === 'string' ? parseFloat(receipt.total) : 0;
      
      // Calculate tax
      const tax = receipt.tax?.total || 0;
      const salesTax = receipt.tax?.breakdown?.salesTax || 0;
      const stateTax = receipt.tax?.breakdown?.stateTax || 0;
      const localTax = receipt.tax?.breakdown?.localTax || 0;
      const otherTaxes = receipt.tax?.breakdown?.otherTaxes || [];

      return {
        totalSpending: acc.totalSpending + (isNaN(amount) ? 0 : amount),
        totalTax: {
          value: acc.totalTax.value + tax,
          breakdown: {
            salesTax: acc.totalTax.breakdown.salesTax + salesTax,
            stateTax: acc.totalTax.breakdown.stateTax + stateTax,
            localTax: acc.totalTax.breakdown.localTax + localTax,
            otherTaxes: [...acc.totalTax.breakdown.otherTaxes, ...otherTaxes]
          }
        }
      };
    } catch (error) {
      console.error('Error calculating totals:', error);
      return acc;
    }
  }, {
    totalSpending: 0,
    totalTax: {
      value: 0,
      breakdown: {
        salesTax: 0,
        stateTax: 0,
        localTax: 0,
        otherTaxes: []
      }
    }
  });

  // Calculate category breakdown with tax information
  const categoryBreakdown = receipts.reduce((acc, receipt) => {
    try {
      const category = receipt.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          tax: 0,
          count: 0
        };
      }
      
      const amount = typeof receipt.total === 'number' ? receipt.total : 
                    typeof receipt.total === 'string' ? parseFloat(receipt.total) : 0;
      const tax = receipt.tax?.total || 0;

      acc[category].total += isNaN(amount) ? 0 : amount;
      acc[category].tax += isNaN(tax) ? 0 : tax;
      acc[category].count += 1;

      return acc;
    } catch (error) {
      console.error('Error calculating category breakdown:', error);
      return acc;
    }
  }, {} as Record<string, { total: number; tax: number; count: number }>);

  // Calculate category counts
  const categoryCounts = receipts.reduce((acc, receipt) => {
    const category = receipt.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total receipts
  const totalReceipts = receipts.length;

  // Get current month's receipts
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthReceipts = receipts.filter(receipt => {
    try {
      // Handle both ISO string and custom date formats
      const receiptDate = new Date(receipt.date);
      if (isNaN(receiptDate.getTime())) {
        console.warn('Invalid date found:', receipt.date);
        return false;
      }

      return receiptDate.getMonth() === currentMonth && 
             receiptDate.getFullYear() === currentYear;
    } catch (error) {
      console.error('Error parsing date:', receipt.date, error);
      return false;
    }
  });

  // Get last month's receipts
  const lastMonthDate = new Date(currentDate);
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const lastMonthReceipts = receipts.filter(receipt => {
    try {
      const receiptDate = new Date(receipt.date);
      if (isNaN(receiptDate.getTime())) return false;
      
      return receiptDate.getMonth() === lastMonth && 
             receiptDate.getFullYear() === lastMonthYear;
    } catch (error) {
      console.error('Error parsing date:', receipt.date, error);
      return false;
    }
  });

  // Calculate monthly totals including tax
  const currentMonthTotals = currentMonthReceipts.reduce((acc, receipt) => {
    const amount = typeof receipt.total === 'number' ? receipt.total : 
                  typeof receipt.total === 'string' ? parseFloat(receipt.total) : 0;
    const tax = receipt.tax?.total || 0;
    
    return {
      spending: acc.spending + (isNaN(amount) ? 0 : amount),
      tax: acc.tax + (isNaN(tax) ? 0 : tax)
    };
  }, { spending: 0, tax: 0 });

  const lastMonthTotals = lastMonthReceipts.reduce((acc, receipt) => {
    const amount = typeof receipt.total === 'number' ? receipt.total : 
                  typeof receipt.total === 'string' ? parseFloat(receipt.total) : 0;
    const tax = receipt.tax?.total || 0;
    
    return {
      spending: acc.spending + (isNaN(amount) ? 0 : amount),
      tax: acc.tax + (isNaN(tax) ? 0 : tax)
    };
  }, { spending: 0, tax: 0 });

  // Calculate spending trend
  const spendingTrend = lastMonthTotals.spending > 0 
    ? ((currentMonthTotals.spending - lastMonthTotals.spending) / lastMonthTotals.spending) * 100 
    : 0;

  // Calculate tax trend
  const taxTrend = lastMonthTotals.tax > 0 
    ? ((currentMonthTotals.tax - lastMonthTotals.tax) / lastMonthTotals.tax) * 100 
    : 0;

  // Calculate average transaction
  const averageTransaction = currentMonthReceipts.length > 0 
    ? currentMonthTotals.spending / currentMonthReceipts.length 
    : 0;

  const lastMonthAverageTransaction = lastMonthReceipts.length > 0
    ? lastMonthTotals.spending / lastMonthReceipts.length
    : 0;

  const averageTransactionTrend = lastMonthAverageTransaction > 0
    ? ((averageTransaction - lastMonthAverageTransaction) / lastMonthAverageTransaction) * 100 
    : 0;

  // Calculate receipts trend
  const receiptsTrend = lastMonthReceipts.length > 0
    ? ((currentMonthReceipts.length - lastMonthReceipts.length) / lastMonthReceipts.length) * 100
    : 0;

  return {
    totalReceipts: {
      value: totalReceipts,
      trend: {
        value: Math.round(receiptsTrend * 100) / 100,
        isPositive: receiptsTrend >= 0
      }
    },
    monthlySpending: {
      value: Math.round(currentMonthTotals.spending * 100) / 100,
      tax: Math.round(currentMonthTotals.tax * 100) / 100,
      trend: {
        value: Math.round(spendingTrend * 100) / 100,
        isPositive: spendingTrend >= 0
      }
    },
    totalSpending: {
      value: Math.round(totalSpending * 100) / 100,
      tax: Math.round(totalTax.value * 100) / 100
    },
    totalTax: {
      value: Math.round(totalTax.value * 100) / 100,
      breakdown: totalTax.breakdown
    },
    averageTransaction: {
      value: Math.round(averageTransaction * 100) / 100,
      trend: {
        value: Math.round(averageTransactionTrend * 100) / 100,
        isPositive: averageTransactionTrend >= 0
      }
    },
    categoryBreakdown,
    categoryCounts,
    loading: false
  };
}