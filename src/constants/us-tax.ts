// US State Tax Rates and Rules
export const US_STATES = [
  { 
    code: 'AL', 
    name: 'Alabama', 
    salesTax: 4.00,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 7%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'AK', 
    name: 'Alaska', 
    salesTax: 0.00,
    hasLocalTax: true,
    disclaimer: 'No state sales tax, but municipalities may charge local sales tax.'
  },
  { 
    code: 'AZ', 
    name: 'Arizona', 
    salesTax: 5.60,
    hasLocalTax: true,
    disclaimer: 'Transaction Privilege Tax (TPT) applies. Local rates vary.'
  },
  { 
    code: 'AR', 
    name: 'Arkansas', 
    salesTax: 6.50,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 5.125%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'CA', 
    name: 'California', 
    salesTax: 7.25,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 2.5%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'CO', 
    name: 'Colorado', 
    salesTax: 2.90,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 7.96%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'CT', 
    name: 'Connecticut', 
    salesTax: 6.35,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'DE', 
    name: 'Delaware', 
    salesTax: 0.00,
    hasLocalTax: false,
    disclaimer: 'No state or local sales tax.'
  },
  { 
    code: 'FL', 
    name: 'Florida', 
    salesTax: 6.00,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 1.5%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'GA', 
    name: 'Georgia', 
    salesTax: 4.00,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 4.9%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'HI', 
    name: 'Hawaii', 
    salesTax: 4.00,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'ID', 
    name: 'Idaho', 
    salesTax: 6.00,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'IL', 
    name: 'Illinois', 
    salesTax: 6.25,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 4.25%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'IN', 
    name: 'Indiana', 
    salesTax: 7.00,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'IA', 
    name: 'Iowa', 
    salesTax: 6.00,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 1%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'KS', 
    name: 'Kansas', 
    salesTax: 6.50,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 3.25%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'KY', 
    name: 'Kentucky', 
    salesTax: 6.00,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'LA', 
    name: 'Louisiana', 
    salesTax: 4.45,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 6.5%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'ME', 
    name: 'Maine', 
    salesTax: 5.50,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'MD', 
    name: 'Maryland', 
    salesTax: 6.00,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'MA', 
    name: 'Massachusetts', 
    salesTax: 6.25,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'MI', 
    name: 'Michigan', 
    salesTax: 6.00,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'MN', 
    name: 'Minnesota', 
    salesTax: 6.875,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 1.5%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'MS', 
    name: 'Mississippi', 
    salesTax: 7.00,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'MO', 
    name: 'Missouri', 
    salesTax: 4.225,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 5.375%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'MT', 
    name: 'Montana', 
    salesTax: 0.00,
    hasLocalTax: false,
    disclaimer: 'No state or local sales tax.'
  },
  { 
    code: 'NE', 
    name: 'Nebraska', 
    salesTax: 5.50,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 2.25%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'NV', 
    name: 'Nevada', 
    salesTax: 6.85,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 1.29%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'NH', 
    name: 'New Hampshire', 
    salesTax: 0.00,
    hasLocalTax: false,
    disclaimer: 'No state or local sales tax.'
  },
  { 
    code: 'NJ', 
    name: 'New Jersey', 
    salesTax: 6.625,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'NM', 
    name: 'New Mexico', 
    salesTax: 5.125,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 3.5625%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'NY', 
    name: 'New York', 
    salesTax: 4.00,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 4.875%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'NC', 
    name: 'North Carolina', 
    salesTax: 4.75,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 2.25%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'ND', 
    name: 'North Dakota', 
    salesTax: 5.00,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'OH', 
    name: 'Ohio', 
    salesTax: 5.75,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 2.25%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'OK', 
    name: 'Oklahoma', 
    salesTax: 4.50,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 6.5%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'OR', 
    name: 'Oregon', 
    salesTax: 0.00,
    hasLocalTax: false,
    disclaimer: 'No state or local sales tax.'
  },
  { 
    code: 'PA', 
    name: 'Pennsylvania', 
    salesTax: 6.00,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'RI', 
    name: 'Rhode Island', 
    salesTax: 7.00,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'SC', 
    name: 'South Carolina', 
    salesTax: 6.00,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 3%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'SD', 
    name: 'South Dakota', 
    salesTax: 4.50,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 4.5%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'TN', 
    name: 'Tennessee', 
    salesTax: 7.00,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 2.75%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'TX', 
    name: 'Texas', 
    salesTax: 6.25,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 2%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'UT', 
    name: 'Utah', 
    salesTax: 6.10,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 2.95%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'VT', 
    name: 'Vermont', 
    salesTax: 6.00,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'VA', 
    name: 'Virginia', 
    salesTax: 5.30,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 0.7%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'WA', 
    name: 'Washington', 
    salesTax: 6.50,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 4%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'WV', 
    name: 'West Virginia', 
    salesTax: 6.00,
    hasLocalTax: false,
    disclaimer: 'No local sales tax.'
  },
  { 
    code: 'WI', 
    name: 'Wisconsin', 
    salesTax: 5.00,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 0.6%. Consult a tax professional for specific rates.'
  },
  { 
    code: 'WY', 
    name: 'Wyoming', 
    salesTax: 4.00,
    hasLocalTax: true,
    disclaimer: 'Local taxes may add up to 2%. Consult a tax professional for specific rates.'
  }
] as const;

// Business Expense Categories with their deduction rules
export const BUSINESS_EXPENSE_CATEGORIES = {
  'Food & Dining': {
    id: 'food_dining',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    deductible: true,
    description: 'Food and dining expenses',
    examples: ['Restaurant meals', 'Catering', 'Coffee shops'],
    limitations: 'Generally 50% deductible for business meals',
    deductiblePercentage: 50
  },
  advertising: {
    id: 'advertising',
    name: 'Advertising',
    icon: 'Award',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    deductible: true,
    description: 'Advertising and marketing expenses',
    examples: [
      'Business cards',
      'Online advertising',
      'Print ads',
      'Social media marketing'
    ],
    limitations: 'Must be ordinary and necessary for your business'
  },
  office_expenses: {
    id: 'office_expenses',
    name: 'Office Expenses',
    icon: 'Building',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    deductible: true,
    description: 'Office-related expenses',
    examples: [
      'Rent',
      'Utilities',
      'Office furniture',
      'Office equipment'
    ],
    limitations: 'Must be ordinary and necessary for your business'
  },
  supplies: {
    id: 'supplies',
    name: 'Supplies',
    icon: 'Briefcase',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    deductible: true,
    description: 'Business supplies and materials',
    examples: [
      'Office supplies',
      'Cleaning supplies',
      'Small tools',
      'Other consumables'
    ],
    limitations: 'Must be ordinary and necessary for your business'
  },
  travel: {
    id: 'travel',
    name: 'Travel Expenses',
    icon: 'Globe',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-100',
    deductible: true,
    description: 'Business travel expenses',
    examples: [
      'Airfare',
      'Hotel',
      'Car rental',
      'Conference fees'
    ],
    limitations: 'Must be primarily for business; entertainment generally not deductible'
  },
  meals: {
    id: 'meals',
    name: 'Meals',
    icon: 'Utensils',
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    deductible: true,
    description: 'Business meal expenses',
    deductiblePercentage: 50, // Most business meals are 50% deductible
    temporaryFullDeduction: {
      startDate: '2021-01-01',
      endDate: '2022-12-31',
      percentage: 100,
      description: 'Restaurant meals 100% deductible in 2021-2022 due to COVID relief'
    },
    examples: [
      'Client meals',
      'Employee meals during travel',
      'Business meeting meals'
    ],
    limitations: 'Must be business-related and not lavish or extravagant'
  },
  utilities: {
    id: 'utilities',
    name: 'Utilities',
    icon: 'Zap',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    deductible: true,
    description: 'Business utility expenses',
    examples: [
      'Electricity',
      'Water',
      'Internet',
      'Phone service'
    ],
    limitations: 'Must separate business and personal use'
  },
  other_expenses: {
    id: 'other_expenses',
    name: 'Other Expenses',
    icon: 'FileText',
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    deductible: true,
    description: 'Other business expenses',
    examples: [
      'Bank fees',
      'Professional services',
      'Licenses and permits',
      'Miscellaneous expenses'
    ],
    limitations: 'Must be ordinary and necessary for your business'
  }
} as const;

// Tax Deduction Types
export const DEDUCTION_TYPES = {
  standard: {
    id: 'standard',
    name: 'Standard Deduction',
    description: 'Fixed amount that reduces taxable income',
    amounts: {
      single: 13850, // 2023 amounts
      married_joint: 27700,
      married_separate: 13850,
      head_household: 20800
    }
  },
  itemized: {
    id: 'itemized',
    name: 'Itemized Deductions',
    description: 'Sum of all qualified individual deductions',
    categories: [
      'Mortgage interest',
      'Charitable contributions',
      'State and local taxes',
      'Medical expenses'
    ]
  }
} as const;

// Types for TypeScript
export type StateCode = typeof US_STATES[number]['code'];
export type BusinessExpenseCategoryId = keyof typeof BUSINESS_EXPENSE_CATEGORIES;
export type DeductionTypeId = keyof typeof DEDUCTION_TYPES;

export interface State {
  code: StateCode;
  name: string;
  salesTax: number;
  hasLocalTax: boolean;
  disclaimer: string;
}

export interface BusinessExpenseCategory {
  id: BusinessExpenseCategoryId;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  deductible: boolean;
  description: string;
  examples: string[];
  limitations: string;
  deductiblePercentage?: number;
  standardRate?: number;
  temporaryFullDeduction?: {
    startDate: string;
    endDate: string;
    percentage: number;
    description: string;
  };
}

// Helper functions
export function getStateTaxRate(stateCode: StateCode): number {
  const state = US_STATES.find(s => s.code === stateCode);
  return state ? state.salesTax : 0;
}

export function getBusinessExpenseCategory(categoryId: BusinessExpenseCategoryId): BusinessExpenseCategory | undefined {
  return BUSINESS_EXPENSE_CATEGORIES[categoryId];
}

export function calculateDeductibleAmount(
  amount: number,
  categoryId: BusinessExpenseCategoryId,
  date: string = new Date().toISOString()
): number {
  const category = BUSINESS_EXPENSE_CATEGORIES[categoryId];
  if (!category || !category.deductible) return 0;

  // Special handling for meals with temporary 100% deduction
  if (categoryId === 'meals' && category.temporaryFullDeduction) {
    const { startDate, endDate, percentage } = category.temporaryFullDeduction;
    if (date >= startDate && date <= endDate) {
      return amount * (percentage / 100);
    }
  }

  // Use category's deductible percentage if specified
  const deductiblePercentage = category.deductiblePercentage || 100;
  return amount * (deductiblePercentage / 100);
}
