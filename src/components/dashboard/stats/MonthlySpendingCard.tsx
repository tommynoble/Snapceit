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
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-white/80">Monthly Spending</p>
          <h3 className="mt-1 text-2xl font-bold text-white">
            {stats.loading ? '-' : totalSpending}
          </h3>
        </div>
        <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-2">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
      </div>

      <div 
        className="overflow-y-auto mt-2" 
        style={{ 
          height: '120px',
          scrollbarWidth: 'none'
        }}
      >
        <div className="space-y-0">
          {!stats.loading && stats.monthlySpending.trend && (
            <div className="relative py-1.5 px-3 pb-1.5">
              <div className="relative z-10">
                <p className="text-[10px] text-white/70 uppercase tracking-wider">Monthly Trend</p>
                <p className={`text-sm font-bold mt-0.5 ${stats.monthlySpending.trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.monthlySpending.trend.isPositive ? '↑' : '↓'} {Math.abs(stats.monthlySpending.trend.value)}%
                </p>
              </div>
              <div className="absolute bottom-0 left-3 right-3 h-px bg-white/10"></div>
            </div>
          )}

          {!stats.loading && (
            <div className="relative py-1.5 px-3 pt-2">
              <div className="relative z-10">
                <p className="text-[10px] text-white/70 uppercase tracking-wider">Tax Amount</p>
                <p className="text-sm font-bold mt-0.5 text-blue-300">
                  {totalTax}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
}
