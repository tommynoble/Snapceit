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
      averageTransaction: {
        value: 0,
        trend: { value: 0, isPositive: true }
      },
      categoryBreakdown: {},
      loading: true
    };
  }

  // Calculate total spending across all receipts
  const totalSpending = receipts.reduce((total, receipt) => {
    try {
      const amount = typeof receipt.total === 'number' ? receipt.total : 
                    typeof receipt.total === 'string' ? parseFloat(receipt.total) : 0;
      return total + (isNaN(amount) ? 0 : amount);
    } catch (error) {
      console.error('Error calculating total spending:', error);
      return total;
    }
  }, 0);

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

  // Calculate monthly spending with validation
  const currentMonthSpending = currentMonthReceipts.reduce((total, receipt) => {
    try {
      // Ensure we have a valid number
      const amount = typeof receipt.total === 'number' ? receipt.total : 
                    typeof receipt.total === 'string' ? parseFloat(receipt.total) : 0;
                    
      if (isNaN(amount)) {
        console.warn('Invalid amount found:', receipt.total);
        return total;
      }
      
      return total + amount;
    } catch (error) {
      console.error('Error calculating total:', error);
      return total;
    }
  }, 0);

  const lastMonthSpending = lastMonthReceipts.reduce((total, receipt) => {
    try {
      const amount = typeof receipt.total === 'number' ? receipt.total : 
                    typeof receipt.total === 'string' ? parseFloat(receipt.total) : 0;
      return total + (isNaN(amount) ? 0 : amount);
    } catch (error) {
      console.error('Error calculating last month total:', error);
      return total;
    }
  }, 0);

  // Calculate spending trend
  const spendingTrend = lastMonthSpending > 0 
    ? ((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100 
    : 0;

  // Calculate average transaction
  const averageTransaction = currentMonthReceipts.length > 0 
    ? currentMonthSpending / currentMonthReceipts.length 
    : 0;

  const lastMonthAverageTransaction = lastMonthReceipts.length > 0
    ? lastMonthSpending / lastMonthReceipts.length
    : 0;

  const averageTransactionTrend = lastMonthAverageTransaction > 0
    ? ((averageTransaction - lastMonthAverageTransaction) / lastMonthAverageTransaction) * 100 
    : 0;

  // Calculate receipts trend
  const receiptsTrend = lastMonthReceipts.length > 0
    ? ((currentMonthReceipts.length - lastMonthReceipts.length) / lastMonthReceipts.length) * 100
    : 0;

  // Calculate category breakdown
  const categoryBreakdown = receipts.reduce((acc, receipt) => {
    try {
      const category = receipt.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = 0;
      }
      const amount = typeof receipt.total === 'number' ? receipt.total : 
                    typeof receipt.total === 'string' ? parseFloat(receipt.total) : 0;
      acc[category] += isNaN(amount) ? 0 : amount;
      return acc;
    } catch (error) {
      console.error('Error calculating category breakdown:', error);
      return acc;
    }
  }, {} as Record<string, number>);

  return {
    totalReceipts: {
      value: totalReceipts,
      trend: {
        value: Math.round(receiptsTrend * 100) / 100,
        isPositive: receiptsTrend >= 0
      }
    },
    monthlySpending: {
      value: Math.round(currentMonthSpending * 100) / 100,
      trend: {
        value: Math.round(spendingTrend * 100) / 100,
        isPositive: spendingTrend >= 0
      }
    },
    totalSpending: {
      value: Math.round(totalSpending * 100) / 100
    },
    averageTransaction: {
      value: Math.round(averageTransaction * 100) / 100,
      trend: {
        value: Math.round(averageTransactionTrend * 100) / 100,
        isPositive: averageTransactionTrend >= 0
      }
    },
    categoryBreakdown,
    loading: false
  };
}