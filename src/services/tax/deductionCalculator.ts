import { Receipt } from '../../components/dashboard/receipts/ReceiptContext';
import { getTaxMapping, TaxMapping } from './taxCategoryMapping';

export interface DeductionSummary {
    category: string;
    taxCode: string; // e.g., 'Part II, Line 24b'
    taxLabel: string; // e.g., 'Deductible means'
    totalAmount: number;
    deductibleAmount: number;
    deductionRate: number;
    items: Receipt[];
}

export interface ScheduleCSummary {
    income: number;
    totalExpenses: number; // Gross expenses
    totalDeductions: number; // After applying rates
    netProfit: number;
    breakdown: DeductionSummary[];
}

export function calculateDeductions(receipts: Receipt[], grossIncome: number = 0): ScheduleCSummary {
    const breakdown: Record<string, DeductionSummary> = {};

    // Initialize with 0 for tracking even if no receipts
    // (Optional: we could pre-populate keys if we want all lines to show up)

    receipts.forEach(receipt => {
        // Determine category (fallback to 'Other' if not mapped/present)
        const category = receipt.category || 'Other Expenses';
        const mapping = getTaxMapping(category);

        // Ignore Income types for the expense breakdown (they go to grossIncome if we were calculating it from receipts)
        // But typically grossIncome is passed in as a separate inputs, or we filter receipts that are income.
        // For now, let's assume all 'receipts' passed here are expenses unless category is explicitly Income.
        if (mapping.deductionRate === 0 && (category === 'Sales' || category === 'Services')) {
            // It's income, we might handle it separately or just exclude from expenses
            return;
        }

        const key = mapping.code; // Group by Tax Line (e.g. 'Part II, Line 24b')

        if (!breakdown[key]) {
            breakdown[key] = {
                category: category, // Use the first category name encountered for display, or better use label
                taxCode: mapping.code,
                taxLabel: mapping.label,
                totalAmount: 0,
                deductibleAmount: 0,
                deductionRate: mapping.deductionRate,
                items: []
            };
        }

        // Accumulate
        breakdown[key].totalAmount += receipt.total || 0;
        breakdown[key].deductibleAmount += (receipt.total || 0) * mapping.deductionRate;
        breakdown[key].items.push(receipt);
    });

    // Convert to array and sort by Tax Code
    const breakdownArray = Object.values(breakdown).sort((a, b) => a.taxCode.localeCompare(b.taxCode));

    const totalExpenses = breakdownArray.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalDeductions = breakdownArray.reduce((sum, item) => sum + item.deductibleAmount, 0);

    return {
        income: grossIncome,
        totalExpenses,
        totalDeductions,
        netProfit: grossIncome - totalDeductions,
        breakdown: breakdownArray
    };
}
