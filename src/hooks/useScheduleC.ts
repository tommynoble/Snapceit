import { useState, useEffect } from 'react';
import { taxApi } from '../utils/tax-api';
import { BusinessExpenseCategoryId } from '../constants/us-tax';

interface ScheduleCData {
  businessName: string;
  businessCode: string;
  ein: string;
  grossReceipts: number;
  expenses: {
    advertising: number;
    carAndTruck: number;
    commissions: number;
    contractLabor: number;
    depletion: number;
    depreciation: number;
    insurance: number;
    interest: number;
    legal: number;
    office: number;
    pension: number;
    rentLease: number;
    repairs: number;
    supplies: number;
    taxes: number;
    travel: number;
    meals: number;
    utilities: number;
    wages: number;
    other: number;
  };
}

interface Receipt {
  id: string;
  date: string;
  merchant: string;
  total: number;
  category: string;
  taxDeductible?: boolean;
  businessCategory?: BusinessExpenseCategoryId;
  taxDetails?: {
    businessPurpose?: string;
    deductiblePercentage?: number;
    notes?: string;
  };
}

export function useScheduleC() {
  const [scheduleC, setScheduleC] = useState<ScheduleCData>({
    businessName: '',
    businessCode: '',
    ein: '',
    grossReceipts: 0,
    expenses: {
      advertising: 0,
      carAndTruck: 0,
      commissions: 0,
      contractLabor: 0,
      depletion: 0,
      depreciation: 0,
      insurance: 0,
      interest: 0,
      legal: 0,
      office: 0,
      pension: 0,
      rentLease: 0,
      repairs: 0,
      supplies: 0,
      taxes: 0,
      travel: 0,
      meals: 0,
      utilities: 0,
      wages: 0,
      other: 0,
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch business info and Schedule C data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get business info
        const businessInfo = await taxApi.getBusinessInfo();
        
        // Get Schedule C summary
        const summary = await taxApi.getScheduleCSummary();
        
        setScheduleC({
          businessName: businessInfo.name,
          businessCode: businessInfo.code,
          ein: businessInfo.ein,
          grossReceipts: summary.grossReceipts,
          expenses: summary.expenses
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching Schedule C data:', err);
        setError('Failed to load Schedule C data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generatePdf = async () => {
    try {
      const { url } = await taxApi.generateScheduleCPdf();
      // Open PDF in new tab
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const getTotalExpenses = () => {
    return Object.values(scheduleC.expenses).reduce((a, b) => a + b, 0);
  };

  const getNetProfit = () => {
    return scheduleC.grossReceipts - getTotalExpenses();
  };

  return {
    scheduleC,
    loading,
    error,
    getTotalExpenses,
    getNetProfit,
    generatePdf
  };
}
