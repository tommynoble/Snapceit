import { api } from './api';
import { BusinessExpenseCategoryId } from '../constants/us-tax';

interface BusinessInfo {
  name: string;
  code: string;
  ein: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  startDate?: string;
  accountingMethod?: 'cash' | 'accrual';
}

interface TaxCategory {
  id: BusinessExpenseCategoryId;
  name: string;
  description: string;
  rules: {
    deductiblePercentage: number;
    maxAmount?: number;
    requiresDocumentation: boolean;
    specialRules?: string[];
  };
  year: number;
}

interface ScheduleCSummary {
  grossReceipts: number;
  totalExpenses: number;
  netProfit: number;
  expenses: Record<BusinessExpenseCategoryId, number>;
  lastUpdated: string;
}

export const taxApi = {
  // Business Information
  getBusinessInfo: async (): Promise<BusinessInfo> => {
    const response = await api.get('/tax/business-info');
    return response.data;
  },

  updateBusinessInfo: async (info: Partial<BusinessInfo>): Promise<BusinessInfo> => {
    const response = await api.patch('/tax/business-info', info);
    return response.data;
  },

  // Schedule C
  getScheduleCSummary: async (): Promise<ScheduleCSummary> => {
    const response = await api.get('/tax/schedule-c/summary');
    return response.data;
  },

  generateScheduleCPdf: async (): Promise<{ url: string }> => {
    const response = await api.post('/tax/schedule-c/generate-pdf');
    return response.data;
  },

  // Tax Categories
  getTaxCategories: async (year: number): Promise<TaxCategory[]> => {
    const response = await api.get(`/tax/categories/${year}`);
    return response.data;
  },

  // Tax Calculations
  calculateDeduction: async (params: {
    category: BusinessExpenseCategoryId;
    amount: number;
    date: string;
    items?: Array<{ name: string; price: number }>;
  }): Promise<{
    deductibleAmount: number;
    rules: string[];
    warnings?: string[];
  }> => {
    const response = await api.post('/tax/calculate/deduction', params);
    return response.data;
  },

  getTaxRates: async (year: number, token: string): Promise<{
    standardMileageRate: number;
    mealDeductionRate: number;
    homeOfficeRates: {
      simplified: number;
      actual: boolean;
    };
  }> => {
    const response = await apiRequest(`/tax/rates/${year}`, {
      method: 'GET',
      token
    });
    return response;
  },

  // Tax Documents
  getDocumentHistory: async (): Promise<{
    id: string;
    type: 'schedule-c' | 'other';
    year: number;
    status: 'draft' | 'final';
    createdAt: string;
    downloadUrl: string;
  }[]> => {
    const response = await api.get('/tax/documents/history');
    return response.data;
  },

  downloadDocument: async (id: string): Promise<{ url: string }> => {
    const response = await api.get(`/tax/documents/${id}/download`);
    return response.data;
  }
};
