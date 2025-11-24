import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Bell, Clock, CheckCircle } from 'lucide-react';
import { useStats } from '../stats/useStats';
import { useReceipts } from '../receipts/ReceiptContext';

export function ReminderCard() {
  const stats = useStats();
  const { receipts } = useReceipts();

  // Memoize spending status to prevent re-renders
  const spendingStatus = useMemo(() => {
    if (stats.loading) {
      return {
        severity: 'normal',
        message: 'Loading spending data...',
      };
    }

    const spendingTrend = stats.monthlySpending.trend?.value || 0;
    const totalSpending = stats.monthlySpending.value;

    if (spendingTrend > 20) {
      return {
        severity: 'alert',
        message: `Monthly spending increased by ${Math.round(spendingTrend)}%`,
      };
    }

    const categories = Object.entries(stats.categoryBreakdown);
    const highestCategory = categories.length > 0 
      ? categories.reduce((a, b) => (b[1] > a[1] ? b : a))
      : null;

    if (highestCategory && (highestCategory[1] / totalSpending) > 0.5) {
      return {
        severity: 'warning',
        message: `${highestCategory[0]} represents over 50% of spending`,
      };
    }

    return {
      severity: 'normal',
      message: 'Spending patterns are normal',
    };
  }, [stats]);

  // Memoize receipt reminder calculations to prevent re-renders
  const receiptReminder = useMemo(() => {
    const pending = receipts?.filter(r => r.status === 'pending' || r.status === 'ocr_done').length || 0;
    const categorized = receipts?.filter(r => r.status === 'categorized').length || 0;
    const total = receipts?.length || 0;

    if (pending > 0) {
      return {
        severity: 'alert',
        message: `${pending} receipt${pending > 1 ? 's' : ''} awaiting categorization`,
        detail: 'Complete categorization to track expenses'
      };
    }

    if (total === 0) {
      return {
        severity: 'warning',
        message: 'No receipts uploaded yet',
        detail: 'Start uploading receipts to track spending'
      };
    }

    return {
      severity: 'normal',
      message: `${categorized} receipts categorized`,
      detail: 'All receipts are up to date'
    };
  }, [receipts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'alert':
        return 'bg-red-50 border-red-100 text-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-100 text-amber-800';
      default:
        return 'bg-green-50 border-green-100 text-green-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-shadow duration-200"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-3 border-b border-gray-200">Reminders</h3>
      
      <div className="space-y-4">
        {/* Receipt Status Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between rounded-lg border p-4 ${getSeverityColor(receiptReminder.severity)}`}
        >
          <div className="flex items-center gap-3">
            {getSeverityIcon(receiptReminder.severity)}
            <div>
              <div className="font-medium">
                {receiptReminder.message}
              </div>
              <div className="text-sm opacity-80">
                {receiptReminder.detail}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Spending Status Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between rounded-lg border p-4 ${getSeverityColor(spendingStatus.severity)}`}
        >
          <div className="flex items-center gap-3">
            {getSeverityIcon(spendingStatus.severity)}
            <div>
              <div className="font-medium">
                {spendingStatus.message}
              </div>
              <div className="text-sm opacity-80">
                {spendingStatus.severity === 'normal' 
                  ? 'Your spending is within normal range'
                  : 'Consider reviewing your spending habits'}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
