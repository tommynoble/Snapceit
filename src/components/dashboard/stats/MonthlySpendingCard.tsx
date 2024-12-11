import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useStats } from './useStats';

export function MonthlySpendingCard() {
  const stats = useStats();
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(stats.monthlySpending.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">Monthly Spending</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{formattedValue}</h3>
        </div>
        <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-3">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
      </div>
      
      {stats.monthlySpending.trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${stats.monthlySpending.trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {stats.monthlySpending.trend.isPositive ? '↑' : '↓'} {Math.abs(stats.monthlySpending.trend.value)}%
          </span>
          <span className="ml-2 text-sm text-white/60">vs last month</span>
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
