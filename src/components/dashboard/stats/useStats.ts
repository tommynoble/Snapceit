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
      averageTransaction: {
        value: 0,
        trend: { value: 0, isPositive: true }
      },
      categoryBreakdown: {},
      loading: true
    };
  }

  // Calculate total receipts
  const totalReceipts = receipts.length;

  // Get current month's receipts
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  console.log('Calculating stats for:', { 
    currentMonth: currentMonth + 1, 
    currentYear,
    totalReceipts: receipts.length,
    receipts 
  });

  const currentMonthReceipts = receipts.filter(receipt => {
    // Ensure we have a valid date
    const receiptDate = new Date(receipt.date);
    if (isNaN(receiptDate.getTime())) {
      console.warn('Invalid date found:', receipt.date);
      return false;
    }

    const isCurrentMonth = receiptDate.getMonth() === currentMonth;
    const isCurrentYear = receiptDate.getFullYear() === currentYear;
    
    console.log('Checking receipt:', {
      id: receipt.id,
      date: receipt.date,
      parsedDate: receiptDate,
      total: receipt.total,
      isCurrentMonth,
      isCurrentYear,
      included: isCurrentMonth && isCurrentYear
    });
    
    return isCurrentMonth && isCurrentYear;
  });

  console.log('Current month receipts:', currentMonthReceipts);

  // Get last month's receipts
  const lastMonthDate = new Date(currentDate);
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const lastMonthReceipts = receipts.filter(receipt => {
    const receiptDate = new Date(receipt.date);
    return receiptDate.getMonth() === lastMonth && 
           receiptDate.getFullYear() === lastMonthYear;
  });

  // Calculate monthly spending with validation
  const currentMonthSpending = currentMonthReceipts.reduce((total, receipt) => {
    const amount = Number(receipt.total) || 0;
    console.log('Adding to monthly total:', {
      receiptId: receipt.id,
      currentTotal: total,
      receiptTotal: amount,
      newTotal: total + amount
    });
    return total + amount;
  }, 0);

  console.log('Monthly spending calculation:', {
    totalReceipts: receipts.length,
    currentMonthReceipts: currentMonthReceipts.length,
    currentMonthSpending,
    receiptsWithTotals: currentMonthReceipts.map(r => ({ id: r.id, total: r.total }))
  });

  const lastMonthSpending = lastMonthReceipts.reduce((total, receipt) => {
    return total + (receipt.total || 0);
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
    const category = receipt.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += receipt.total || 0;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalReceipts: {
      value: totalReceipts,
      trend: {
        value: receiptsTrend,
        isPositive: receiptsTrend >= 0
      }
    },
    monthlySpending: {
      value: currentMonthSpending,
      trend: {
        value: spendingTrend,
        isPositive: spendingTrend >= 0
      }
    },
    averageTransaction: {
      value: averageTransaction,
      trend: {
        value: averageTransactionTrend,
        isPositive: averageTransactionTrend >= 0
      }
    },
    categoryBreakdown,
    loading: false
  };
}