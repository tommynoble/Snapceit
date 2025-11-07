import React from 'react';
import { Star, AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStats } from './stats/useStats';

interface ReminderCardProps {
  dueDate: string;
}

export function ReminderCard({ dueDate }: ReminderCardProps) {
  const { alerts } = useStats();

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
    <div className="rounded-2xl bg-white p-6 shadow-lg min-h-[400px]">
      <h2 className="text-xl font-semibold text-gray-800">Reminder</h2>
      
      <div className="mt-6 space-y-4">
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
              Due {dueDate}
            </div>
          </div>
          <Star className="h-6 w-6 text-purple-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`flex items-start gap-4 rounded-lg border p-4 ${getSeverityColor(alerts.severity)}`}
        >
          {getSeverityIcon(alerts.severity)}
          <div>
            <div className="font-medium">Spending Alert</div>
            <div className="text-sm opacity-90">{alerts.message}</div>
          </div>
        </motion.div>

        {alerts.severity !== 'normal' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg bg-gray-50 p-4"
          >
            <div className="text-sm text-gray-600">
              <span className="font-medium">Quick Tip:</span>{' '}
              {alerts.severity === 'alert' 
                ? 'Consider reviewing your recent transactions and identifying areas where you can reduce spending.'
                : 'Monitor your spending patterns and set budget limits for different categories.'}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}