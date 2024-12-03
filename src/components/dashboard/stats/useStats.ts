import { useReceipts } from '../receipts/ReceiptContext';

export function useStats() {
  const { receipts } = useReceipts();

  // Calculate total receipts
  const totalReceipts = receipts.length;
  const lastMonthReceipts = receipts.filter(receipt => {
    const date = new Date(receipt.date);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return date >= lastMonth;
  }).length;
  const receiptsTrend = lastMonthReceipts ? 
    ((totalReceipts - lastMonthReceipts) / lastMonthReceipts) * 100 : 0;

  // Calculate monthly spending
  const currentMonthSpending = receipts.reduce((total, receipt) => {
    const date = new Date(receipt.date);
    const currentMonth = new Date();
    if (date.getMonth() === currentMonth.getMonth()) {
      return total + receipt.amount;
    }
    return total;
  }, 0);

  const lastMonthSpending = receipts.reduce((total, receipt) => {
    const date = new Date(receipt.date);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    if (date.getMonth() === lastMonth.getMonth()) {
      return total + receipt.amount;
    }
    return total;
  }, 0);

  const spendingTrend = lastMonthSpending ? 
    ((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100 : 0;

  // Calculate average transaction
  const currentMonthTransactions = receipts.filter(receipt => {
    const date = new Date(receipt.date);
    const currentMonth = new Date();
    return date.getMonth() === currentMonth.getMonth();
  });

  const averageTransaction = currentMonthTransactions.length > 0 
    ? currentMonthSpending / currentMonthTransactions.length 
    : 0;

  const lastMonthAverageTransaction = lastMonthReceipts > 0 
    ? lastMonthSpending / lastMonthReceipts 
    : 0;

  const averageTransactionTrend = lastMonthAverageTransaction 
    ? ((averageTransaction - lastMonthAverageTransaction) / lastMonthAverageTransaction) * 100 
    : 0;

  // Calculate categories
  const categories = receipts.reduce((acc, receipt) => {
    acc[receipt.category] = (acc[receipt.category] || 0) + receipt.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalCategories = Object.keys(categories).length;
  const categoryBreakdown = Object.entries(categories)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / currentMonthSpending) * 100
    }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate spending alerts
  const spendingAlerts = {
    highSpending: spendingTrend > 20,
    unusualTransaction: averageTransactionTrend > 30,
    categorySpike: categoryBreakdown.some(cat => cat.percentage > 50),
    message: '',
    severity: 'normal' as 'normal' | 'warning' | 'alert'
  };

  if (spendingAlerts.highSpending) {
    spendingAlerts.message = `Monthly spending increased by ${Math.round(spendingTrend)}%`;
    spendingAlerts.severity = 'alert';
  } else if (spendingAlerts.unusualTransaction) {
    spendingAlerts.message = `Average transaction amount increased by ${Math.round(averageTransactionTrend)}%`;
    spendingAlerts.severity = 'warning';
  } else if (spendingAlerts.categorySpike) {
    const highestCategory = categoryBreakdown[0];
    spendingAlerts.message = `${highestCategory.category} represents ${Math.round(highestCategory.percentage)}% of spending`;
    spendingAlerts.severity = 'warning';
  } else {
    spendingAlerts.message = 'Spending patterns are normal';
    spendingAlerts.severity = 'normal';
  }

  return {
    totalReceipts: {
      value: totalReceipts,
      trend: {
        value: Math.round(receiptsTrend),
        isPositive: receiptsTrend >= 0
      }
    },
    monthlySpending: {
      value: currentMonthSpending,
      trend: {
        value: Math.round(spendingTrend),
        isPositive: spendingTrend >= 0
      }
    },
    averageTransaction: {
      value: averageTransaction,
      trend: {
        value: Math.round(averageTransactionTrend),
        isPositive: averageTransactionTrend >= 0
      }
    },
    categories: {
      total: totalCategories,
      breakdown: categoryBreakdown
    },
    alerts: spendingAlerts
  };
}