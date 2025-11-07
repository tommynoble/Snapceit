import { useMemo } from 'react';
import { useReceipts } from '../components/dashboard/receipts/ReceiptContext';
import type { Receipt } from '../components/dashboard/receipts/ReceiptContext';

interface DeductionCategory {
  name: string;
  amount: number;
  percentage: number;
  receipts: Receipt[];
}

interface DeductionSuggestion {
  receipt: Receipt;
  reason: string;
  potentialSaving: number;
}

export function useDeductions() {
  const { receipts } = useReceipts();

  // Tax categories and their typical deduction rates
  const DEDUCTION_RATES = {
    advertising: 1.0, // 100% deductible
    car_and_truck: 0.575, // 57.5 cents per mile for 2023
    office: 1.0,
    taxes_and_licenses: 1.0,
    supplies: 1.0,
    travel_and_meals: 0.50, // 50% for meals
  };

  // Calculate deductions by category
  const deductionsByCategory = useMemo(() => {
    const categories: { [key: string]: DeductionCategory } = {};
    let totalAmount = 0;

    receipts.forEach(receipt => {
      if (receipt.taxDeductible && receipt.taxCategory) {
        const categoryName = receipt.taxCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        if (!categories[categoryName]) {
          categories[categoryName] = {
            name: categoryName,
            amount: 0,
            percentage: 0,
            receipts: []
          };
        }

        const deductibleAmount = receipt.total * (DEDUCTION_RATES[receipt.taxCategory] || 1.0);
        categories[categoryName].amount += deductibleAmount;
        categories[categoryName].receipts.push(receipt);
        totalAmount += deductibleAmount;
      }
    });

    // Calculate percentages
    Object.values(categories).forEach(category => {
      category.percentage = totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0;
    });

    return Object.values(categories).sort((a, b) => b.amount - a.amount);
  }, [receipts]);

  // Calculate total deductions
  const totalDeductions = useMemo(() => {
    return deductionsByCategory.reduce((sum, category) => sum + category.amount, 0);
  }, [deductionsByCategory]);

  // Get deductible receipts count
  const deductibleReceiptsCount = useMemo(() => {
    return receipts.filter(r => r.taxDeductible).length;
  }, [receipts]);

  // Generate deduction suggestions
  const deductionSuggestions = useMemo(() => {
    const suggestions: DeductionSuggestion[] = [];
    
    receipts.forEach(receipt => {
      if (!receipt.taxDeductible) {
        // Check for potential business expenses
        if (receipt.category === 'Office Expenses' || 
            receipt.category === 'Supplies' ||
            receipt.category === 'Travel') {
          suggestions.push({
            receipt,
            reason: `This ${receipt.category.toLowerCase()} expense might be tax deductible for your business`,
            potentialSaving: receipt.total * 0.25 // Assuming 25% tax bracket
          });
        }

        // Check for large purchases
        if (receipt.total >= 500) {
          suggestions.push({
            receipt,
            reason: 'Large purchases may qualify for business expense deduction',
            potentialSaving: receipt.total * 0.25
          });
        }

        // Check for travel and meals
        if (receipt.category === 'Meals' && receipt.total >= 20) {
          suggestions.push({
            receipt,
            reason: 'Business meals are 50% tax deductible',
            potentialSaving: receipt.total * 0.5 * 0.25
          });
        }
      }
    });

    return suggestions.sort((a, b) => b.potentialSaving - a.potentialSaving);
  }, [receipts]);

  // Calculate potential savings
  const potentialSavings = useMemo(() => {
    return deductionSuggestions.reduce((sum, suggestion) => sum + suggestion.potentialSaving, 0);
  }, [deductionSuggestions]);

  return {
    deductionsByCategory,
    totalDeductions,
    deductibleReceiptsCount,
    deductionSuggestions,
    potentialSavings
  };
}
