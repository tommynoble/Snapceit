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
      let amount = 0;
      if (receipt.total !== undefined && receipt.total !== null) {
        amount = typeof receipt.total === 'number' ? receipt.total : 
                typeof receipt.total === 'string' ? parseFloat(receipt.total.replace(/[^0-9.-]+/g, '')) : 0;
      } else if (receipt.items && Array.isArray(receipt.items)) {
        // Calculate from items if total is not available
        amount = receipt.items.reduce((sum, item) => {
          const itemTotal = (item.price || 0) * (item.quantity || 1);
          return sum + (isNaN(itemTotal) ? 0 : itemTotal);
        }, 0);
      }
      
      // Calculate tax
      const tax = receipt.tax?.total || 0;
      const salesTax = receipt.tax?.breakdown?.salesTax || 0;
      const stateTax = receipt.tax?.breakdown?.stateTax || 0;
      const localTax = receipt.tax?.breakdown?.localTax || 0;
      const otherTaxes = receipt.tax?.breakdown?.otherTaxes || [];

      return {
        totalSpending: acc.totalSpending + (isNaN(amount) ? 0 : amount),
        totalTax: {
          value: acc.totalTax.value + (isNaN(tax) ? 0 : tax),
          breakdown: {
            salesTax: acc.totalTax.breakdown.salesTax + (isNaN(salesTax) ? 0 : salesTax),
            stateTax: acc.totalTax.breakdown.stateTax + (isNaN(stateTax) ? 0 : stateTax),
            localTax: acc.totalTax.breakdown.localTax + (isNaN(localTax) ? 0 : localTax),
            otherTaxes: [...acc.totalTax.breakdown.otherTaxes, ...otherTaxes]
          }
        }
      };
    } catch (error) {
      console.error('Error calculating totals for receipt:', receipt, error);
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
          count: 0,
          items: []
        };
      }
      
      let amount = 0;
      if (receipt.total !== undefined && receipt.total !== null) {
        amount = typeof receipt.total === 'number' ? receipt.total : 
                typeof receipt.total === 'string' ? parseFloat(receipt.total.replace(/[^0-9.-]+/g, '')) : 0;
      } else if (receipt.items && Array.isArray(receipt.items)) {
        amount = receipt.items.reduce((sum, item) => {
          const itemTotal = (item.price || 0) * (item.quantity || 1);
          return sum + (isNaN(itemTotal) ? 0 : itemTotal);
        }, 0);
      }

      const tax = receipt.tax?.total || 0;

      acc[category].total += isNaN(amount) ? 0 : amount;
      acc[category].tax += isNaN(tax) ? 0 : tax;
      acc[category].count += 1;
      if (receipt.items) {
        acc[category].items.push(...receipt.items);
      }

      return acc;
    } catch (error) {
      console.error('Error calculating category breakdown for receipt:', receipt, error);
      return acc;
    }
  }, {} as Record<string, { total: number; tax: number; count: number; items: any[] }>);

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
    let amount = 0;
    if (receipt.total !== undefined && receipt.total !== null) {
      amount = typeof receipt.total === 'number' ? receipt.total : 
              typeof receipt.total === 'string' ? parseFloat(receipt.total.replace(/[^0-9.-]+/g, '')) : 0;
    } else if (receipt.items && Array.isArray(receipt.items)) {
      amount = receipt.items.reduce((sum, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        return sum + (isNaN(itemTotal) ? 0 : itemTotal);
      }, 0);
    }

    const tax = receipt.tax?.total || 0;
    
    return {
      spending: acc.spending + (isNaN(amount) ? 0 : amount),
      tax: acc.tax + (isNaN(tax) ? 0 : tax)
    };
  }, { spending: 0, tax: 0 });

  const lastMonthTotals = lastMonthReceipts.reduce((acc, receipt) => {
    let amount = 0;
    if (receipt.total !== undefined && receipt.total !== null) {
      amount = typeof receipt.total === 'number' ? receipt.total : 
              typeof receipt.total === 'string' ? parseFloat(receipt.total.replace(/[^0-9.-]+/g, '')) : 0;
    } else if (receipt.items && Array.isArray(receipt.items)) {
      amount = receipt.items.reduce((sum, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        return sum + (isNaN(itemTotal) ? 0 : itemTotal);
      }, 0);
    }

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

  const avgTransactionTrend = lastMonthAverageTransaction > 0
    ? ((averageTransaction - lastMonthAverageTransaction) / lastMonthAverageTransaction) * 100 
    : 0;

  // Calculate receipts trend
  const receiptsTrend = lastMonthReceipts.length > 0
    ? ((currentMonthReceipts.length - lastMonthReceipts.length) / lastMonthReceipts.length) * 100
    : 0;

  // Return the stats object
  return {
    totalReceipts: {
      value: totalReceipts,
      trend: {
        value: Math.round(receiptsTrend * 100) / 100,
        isPositive: receiptsTrend >= 0
      }
    },
    monthlySpending: {
      value: currentMonthTotals.spending,
      trend: {
        value: Math.round(spendingTrend * 100) / 100,
        isPositive: spendingTrend >= 0
      }
    },
    totalSpending: {
      value: totalSpending
    },
    totalTax: {
      value: totalTax.value,
      breakdown: totalTax.breakdown
    },
    averageTransaction: {
      value: receipts.length ? totalSpending / receipts.length : 0,
      trend: {
        value: avgTransactionTrend,
        isPositive: avgTransactionTrend >= 0
      }
    },
    categoryBreakdown,
    categoryCounts,
    loading: false
  };
}