import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useStats } from './useStats';
import { useCurrency } from '../../../hooks/useCurrency';

export function MonthlySpendingCard() {
  const stats = useStats();
  const { formatCurrency } = useCurrency();
  
  const totalSpending = formatCurrency(stats.totalSpending.value);
  const totalTax = formatCurrency(stats.totalSpending.tax);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative p-5 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg shadow-md"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex flex-col space-y-6">
        {/* Total Spending */}
        <div>
          <p className="text-sm font-medium text-white/80">Total Spending</p>
          <h3 className="mt-1 text-2xl font-bold text-white">
            {stats.loading ? '-' : totalSpending}
          </h3>
          <p className="text-sm text-white/60">
            Total Tax: {stats.loading ? '-' : totalTax}
          </p>
        </div>

        {/* Monthly Spending Trend */}
        <div>
          <p className="text-sm font-medium text-white/80">Monthly Spending</p>
          {!stats.loading && stats.monthlySpending.trend && (
            <div className="mt-2 flex items-center">
              <span className={`text-2xl font-bold ${stats.monthlySpending.trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {stats.monthlySpending.trend.isPositive ? '↑' : '↓'} {Math.abs(stats.monthlySpending.trend.value)}%
              </span>
              <span className="ml-2 text-sm text-white/60">vs last month</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-6 right-6 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-3">
        <TrendingUp className="h-6 w-6 text-white" />
      </div>

      <div 
        className="absolute inset-0 rounded-2xl transition-opacity duration-300 hover:opacity-100 opacity-0"
        style={{
          background: 'linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}
      />
    </motion.div>
  );
}
