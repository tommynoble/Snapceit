export interface ErrorResponse {
  error: string;
  statusCode: number;
}

export interface SuccessResponse {
  success: boolean;
  data: any;
}

export interface SpendingAnalytics {
  totalSpent: number;
  averagePerTransaction: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
  }>;
}

export interface MerchantAnalytics {
  topMerchants: Array<{
    merchant: string;
    totalSpent: number;
    transactionCount: number;
    averageTransaction: number;
  }>;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalSpent: number;
  receiptCount: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  merchantBreakdown: Array<{
    merchant: string;
    amount: number;
    percentage: number;
  }>;
}
