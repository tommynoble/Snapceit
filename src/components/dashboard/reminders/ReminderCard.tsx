import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import { useStats } from '../stats/useStats';

export function ReminderCard() {
  const stats = useStats();

  // Calculate spending alerts based on stats
  const getSpendingStatus = () => {
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
  };

  const spendingStatus = getSpendingStatus();

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
        return <TrendingUp className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg h-[400px]"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminders</h3>
      
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-lg border border-purple-100 bg-purple-50 p-4"
        >
          <div>
            <div className="font-medium text-purple-900">
              Get Receipts up to Date
            </div>
            <div className="text-sm text-purple-600">
              Due Today
            </div>
          </div>
        </motion.div>

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
