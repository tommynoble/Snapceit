import React from 'react';
import { motion } from 'framer-motion';
import { Receipt } from 'lucide-react';
import { useStats } from './useStats';

export function TotalReceiptsCard() {
  const stats = useStats();

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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">Total Receipts</p>
          <h3 className="mt-2 text-3xl font-bold text-white">
            {stats.loading ? '-' : stats.totalReceipts.value}
          </h3>
        </div>
        <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-3">
          <Receipt className="h-6 w-6 text-white" />
        </div>
      </div>
      
      {!stats.loading && stats.totalReceipts.trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${stats.totalReceipts.trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {stats.totalReceipts.trend.isPositive ? '↑' : '↓'} {Math.abs(stats.totalReceipts.trend.value)}%
          </span>
          <span className="ml-2 text-sm text-white/60">vs last month</span>
        </div>
      )}

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
