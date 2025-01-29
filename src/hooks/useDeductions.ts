import { useState, useEffect } from 'react';
import { useReceipts } from '../components/dashboard/receipts/ReceiptContext';
import { taxApi } from '../utils/tax-api';
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
  const [deductionsByCategory, setDeductionsByCategory] = useState<Record<string, DeductionCategory>>({});
  const [taxRules, setTaxRules] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tax rules and categories
  useEffect(() => {
    const fetchTaxRules = async () => {
      try {
        const year = new Date().getFullYear();
        const [categories, rates] = await Promise.all([
          taxApi.getTaxCategories(year),
          taxApi.getTaxRates(year)
        ]);
        
        setTaxRules({ categories, rates });
        setError(null);
      } catch (err) {
        console.error('Error fetching tax rules:', err);
        setError('Failed to load tax rules');
      }
    };

    fetchTaxRules();
  }, []);

  // Calculate deductions when receipts or tax rules change
  useEffect(() => {
    const calculateDeductions = async () => {
      if (!taxRules) return;
      
      try {
        setLoading(true);
        const deductible = receipts.filter(r => r.taxDeductible);
        
        // Calculate deductions for each receipt
        const deductions = await Promise.all(
          deductible.map(async receipt => {
            if (!receipt.businessCategory) return null;
            
            const { deductibleAmount } = await taxApi.calculateDeduction({
              category: receipt.businessCategory,
              amount: receipt.total,
              date: receipt.date,
              items: receipt.items
            });

            return {
              receipt,
              category: receipt.businessCategory,
              deductibleAmount
            };
          })
        );

        // Group by category
        const categories: Record<string, DeductionCategory> = {};
        deductions.forEach(d => {
          if (!d) return;
          
          const categoryName = d.category.replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          
          if (!categories[categoryName]) {
            categories[categoryName] = {
              name: categoryName,
              amount: 0,
              percentage: 0,
              receipts: []
            };
          }
          
          categories[categoryName].amount += d.deductibleAmount;
          categories[categoryName].receipts.push(d.receipt);
        });

        // Calculate percentages
        const totalDeductions = Object.values(categories)
          .reduce((sum, cat) => sum + cat.amount, 0);
          
        Object.values(categories).forEach(cat => {
          cat.percentage = totalDeductions ? (cat.amount / totalDeductions) * 100 : 0;
        });

        setDeductionsByCategory(categories);
        setError(null);
      } catch (err) {
        console.error('Error calculating deductions:', err);
        setError('Failed to calculate deductions');
      } finally {
        setLoading(false);
      }
    };

    calculateDeductions();
  }, [receipts, taxRules]);

  // Get deduction suggestions
  const getDeductionSuggestions = (): DeductionSuggestion[] => {
    if (!taxRules) return [];

    return receipts
      .filter(receipt => !receipt.taxDeductible)
      .map(receipt => {
        const category = taxRules.categories.find(c => 
          c.keywords?.some((k: string) => 
            receipt.merchant.toLowerCase().includes(k.toLowerCase()) ||
            receipt.items?.some(item => 
              item.name.toLowerCase().includes(k.toLowerCase())
            )
          )
        );

        if (!category) return null;

        return {
          receipt,
          reason: `This might be a ${category.name} expense`,
          potentialSaving: receipt.total * (category.deductiblePercentage / 100)
        };
      })
      .filter((s): s is DeductionSuggestion => s !== null);
  };

  return {
    deductionsByCategory,
    loading,
    error,
    deductibleReceiptsCount: receipts.filter(r => r.taxDeductible).length,
    deductionSuggestions: getDeductionSuggestions(),
    totalDeductions: Object.values(deductionsByCategory)
      .reduce((sum, cat) => sum + cat.amount, 0)
  };
}
