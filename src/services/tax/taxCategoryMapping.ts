
export interface TaxMapping {
    code: string;
    label: string;
    deductionRate: number; // 1.0 = 100%, 0.5 = 50%
    description?: string;
}

export const TAX_CATEGORY_MAP: Record<string, TaxMapping> = {
    // Income
    'Sales': { code: 'Part I, Line 1', label: 'Gross receipts or sales', deductionRate: 0.0 }, // Income is not deductible
    'Services': { code: 'Part I, Line 1', label: 'Gross receipts or sales', deductionRate: 0.0 },

    // Expenses
    'Advertising': { code: 'Part II, Line 8', label: 'Advertising', deductionRate: 1.0 },
    'Car and Truck Expenses': { code: 'Part II, Line 9', label: 'Car and truck expenses', deductionRate: 1.0 },
    'Commissions': { code: 'Part II, Line 10', label: 'Commissions and fees', deductionRate: 1.0 },
    'Contract Labor': { code: 'Part II, Line 11', label: 'Contract labor', deductionRate: 1.0 },
    'Depletion': { code: 'Part II, Line 12', label: 'Depletion', deductionRate: 1.0 },
    'Depreciation': { code: 'Part II, Line 13', label: 'Depreciation', deductionRate: 1.0 },
    'Employee Benefit Programs': { code: 'Part II, Line 14', label: 'Employee benefit programs', deductionRate: 1.0 },
    'Insurance': { code: 'Part II, Line 15', label: 'Insurance (other than health)', deductionRate: 1.0 },
    'Interest': { code: 'Part II, Line 16', label: 'Interest', deductionRate: 1.0 },
    'Legal and Professional Services': { code: 'Part II, Line 17', label: 'Legal and professional services', deductionRate: 1.0 },
    'Office Expenses': { code: 'Part II, Line 18', label: 'Office expenses', deductionRate: 1.0 },
    'Pension and Profit-Sharing': { code: 'Part II, Line 19', label: 'Pension and profit-sharing plans', deductionRate: 1.0 },
    'Rent or Lease': { code: 'Part II, Line 20', label: 'Rent or lease', deductionRate: 1.0 },
    'Repairs and Maintenance': { code: 'Part II, Line 21', label: 'Repairs and maintenance', deductionRate: 1.0 },
    'Supplies': { code: 'Part II, Line 22', label: 'Supplies', deductionRate: 1.0 },
    'Taxes and Licenses': { code: 'Part II, Line 23', label: 'Taxes and licenses', deductionRate: 1.0 },
    'Travel': { code: 'Part II, Line 24a', label: 'Travel', deductionRate: 1.0 },
    'Meals': { code: 'Part II, Line 24b', label: 'Deductible meals', deductionRate: 0.5 }, // 50% Limit
    'Utilities': { code: 'Part II, Line 25', label: 'Utilities', deductionRate: 1.0 },
    'Wages': { code: 'Part II, Line 26', label: 'Wages', deductionRate: 1.0 },
    'Other Expenses': { code: 'Part II, Line 27a', label: 'Other expenses', deductionRate: 1.0 },

    // Custom Mappings
    'Equipment': { code: 'Part II, Line 13', label: 'Depreciation', deductionRate: 1.0 },
    'Software': { code: 'Part II, Line 18', label: 'Office expenses', deductionRate: 1.0 },
    'Subscriptions': { code: 'Part II, Line 18', label: 'Office expenses', deductionRate: 1.0 },
    'Phone': { code: 'Part II, Line 25', label: 'Utilities', deductionRate: 1.0 },
    'Internet': { code: 'Part II, Line 25', label: 'Utilities', deductionRate: 1.0 },
};

export function getTaxMapping(category: string): TaxMapping {
    // Normalize category for lookup
    const normalizedCategory = category.trim();

    // Direct match
    if (TAX_CATEGORY_MAP[normalizedCategory]) {
        return TAX_CATEGORY_MAP[normalizedCategory];
    }

    // Case-insensitive match
    const lowerCategory = normalizedCategory.toLowerCase();
    const foundKey = Object.keys(TAX_CATEGORY_MAP).find(key => key.toLowerCase() === lowerCategory);
    if (foundKey) {
        return TAX_CATEGORY_MAP[foundKey];
    }

    // Substring / Keyword matching (simple heuristic)
    if (lowerCategory.includes('meal') || lowerCategory.includes('food') || lowerCategory.includes('restaurant')) {
        return TAX_CATEGORY_MAP['Meals'];
    }
    if (lowerCategory.includes('uber') || lowerCategory.includes('lyft') || lowerCategory.includes('taxi') || lowerCategory.includes('travel') || lowerCategory.includes('flight') || lowerCategory.includes('hotel')) {
        return TAX_CATEGORY_MAP['Travel'];
    }
    if (lowerCategory.includes('gas') || lowerCategory.includes('fuel') || lowerCategory.includes('parking') || lowerCategory.includes('car wash')) {
        return TAX_CATEGORY_MAP['Car and Truck Expenses'];
    }
    if (lowerCategory.includes('phone') || lowerCategory.includes('mobile') || lowerCategory.includes('internet') || lowerCategory.includes('wifi')) {
        return TAX_CATEGORY_MAP['Utilities'];
    }
    if (lowerCategory.includes('software') || lowerCategory.includes('subscription') || lowerCategory.includes('app')) {
        return TAX_CATEGORY_MAP['Office Expenses'];
    }
    if (lowerCategory.includes('ad') || lowerCategory.includes('marketing') || lowerCategory.includes('promo')) {
        return TAX_CATEGORY_MAP['Advertising'];
    }

    return {
        code: 'Part II, Line 27a',
        label: 'Other expenses',
        deductionRate: 1.0,
        description: 'Uncategorized expense mapped to Other'
    };
}
