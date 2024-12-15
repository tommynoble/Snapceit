import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useStats } from './useStats';

export function MonthlySpendingCard() {
  const stats = useStats();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const monthlySpending = formatCurrency(stats.monthlySpending.value);
  const totalSpending = formatCurrency(stats.totalSpending?.value || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg shadow-md"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex flex-col space-y-4">
        {/* Total Spending */}
        <div>
          <p className="text-sm font-medium text-white/80">Total Spending</p>
          <h3 className="mt-1 text-2xl font-bold text-white">
            {stats.loading ? '-' : totalSpending}
          </h3>
        </div>

        {/* Monthly Spending */}
        <div>
          <p className="text-sm font-medium text-white/80">Monthly Spending</p>
          <h3 className="mt-1 text-2xl font-bold text-white">
            {stats.loading ? '-' : monthlySpending}
          </h3>
          {!stats.loading && stats.monthlySpending.trend && (
            <div className="mt-1 flex items-center">
              <span className={`text-sm font-medium ${stats.monthlySpending.trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
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

      {stats.loading && (
        <div className="mt-4 animate-pulse">
          <div className="w-32 h-4 bg-white/10 rounded"></div>
        </div>
      )}

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
