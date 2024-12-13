import { Receipt } from '../components/dashboard/receipts/ReceiptContext';

export interface TaxSummary {
  totalTax: number;
  deductibleTotal: number;
  categoryTotals: Record<string, number>;
  monthlyBreakdown: Record<string, number>;
  deductiblesByCategory: Record<string, number>;
  taxRate: number;
  estimatedSavings: number;
}

export function calculateTaxSummary(receipts: Receipt[]): TaxSummary {
  const summary = receipts.reduce((acc, receipt) => {
    if (receipt.tax?.total) {
      // Add to total tax
      acc.totalTax += receipt.tax.total;

      // Calculate tax rate
      if (receipt.total > 0) {
        acc.taxRateSum += (receipt.tax.total / receipt.total) * 100;
        acc.taxRateCount += 1;
      }

      // Add to category totals
      if (receipt.taxCategory) {
        acc.categoryTotals[receipt.taxCategory] = (acc.categoryTotals[receipt.taxCategory] || 0) + receipt.tax.total;
        
        // Add to deductible totals by category if applicable
        if (receipt.taxDeductible) {
          acc.deductiblesByCategory[receipt.taxCategory] = (acc.deductiblesByCategory[receipt.taxCategory] || 0) + receipt.tax.total;
        }
      }

      // Add to monthly breakdown
      const month = new Date(receipt.date).toLocaleString('default', { month: 'short' });
      acc.monthlyBreakdown[month] = (acc.monthlyBreakdown[month] || 0) + receipt.tax.total;

      // Add to deductible total if applicable
      if (receipt.taxDeductible) {
        acc.deductibleTotal += receipt.tax.total;
      }
    }
    return acc;
  }, {
    totalTax: 0,
    deductibleTotal: 0,
    categoryTotals: {} as Record<string, number>,
    monthlyBreakdown: {} as Record<string, number>,
    deductiblesByCategory: {} as Record<string, number>,
    taxRateSum: 0,
    taxRateCount: 0,
  });

  // Calculate average tax rate
  const taxRate = summary.taxRateCount > 0 ? summary.taxRateSum / summary.taxRateCount : 0;
  
  // Estimate potential tax savings (simplified calculation)
  // Assuming a basic tax rate of 20% for deductible expenses
  const estimatedSavings = summary.deductibleTotal * 0.20;

  return {
    totalTax: summary.totalTax,
    deductibleTotal: summary.deductibleTotal,
    categoryTotals: summary.categoryTotals,
    monthlyBreakdown: summary.monthlyBreakdown,
    deductiblesByCategory: summary.deductiblesByCategory,
    taxRate: Math.round(taxRate * 100) / 100, // Round to 2 decimal places
    estimatedSavings,
  };
}
