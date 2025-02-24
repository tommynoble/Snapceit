import { BUSINESS_EXPENSE_CATEGORIES } from '../constants/us-tax';

interface DeductionResult {
  deductibleAmount: number;
  rules: string[];
  warnings: string[];
}

export function calculateDeduction(
  amount: number,
  categoryId: string,
  date: string = new Date().toISOString()
): DeductionResult {
  try {
    const category = BUSINESS_EXPENSE_CATEGORIES[categoryId as keyof typeof BUSINESS_EXPENSE_CATEGORIES];
    if (!category) {
      return {
        deductibleAmount: 0,
        rules: ['Category not found'],
        warnings: ['Invalid expense category']
      };
    }

    if (!category.deductible) {
      return {
        deductibleAmount: 0,
        rules: ['Not deductible'],
        warnings: ['This category is not tax deductible']
      };
    }

    const currentDate = new Date(date);
    let deductiblePercentage = category.deductiblePercentage || 100;
    const rules: string[] = [];
    const warnings: string[] = [];

    // Check for temporary full deduction
    if (category.temporaryFullDeduction) {
      const startDate = new Date(category.temporaryFullDeduction.startDate);
      const endDate = new Date(category.temporaryFullDeduction.endDate);

      if (currentDate >= startDate && currentDate <= endDate) {
        deductiblePercentage = category.temporaryFullDeduction.percentage;
        rules.push(category.temporaryFullDeduction.description);
      }
    }

    // Check for standard rate if applicable
    if (category.standardRate) {
      rules.push(`Standard rate of $${category.standardRate} per unit applies`);
    }

    // Add category limitations to rules
    if (category.limitations) {
      rules.push(category.limitations);
    }

    // Calculate deductible amount
    const deductibleAmount = (amount * deductiblePercentage) / 100;

    // Add warnings for high amounts
    if (amount > 5000) {
      warnings.push('High expense amount - keep detailed documentation');
    }

    return {
      deductibleAmount: Number(deductibleAmount.toFixed(2)),
      rules,
      warnings
    };
  } catch (error) {
    console.error('Error calculating deduction:', error);
    return {
      deductibleAmount: 0,
      rules: ['Error calculating deduction'],
      warnings: ['An error occurred while calculating the deduction amount']
    };
  }
}
