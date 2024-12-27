import React from 'react';
import { motion } from 'framer-motion';
import { 
  Receipt,
  Megaphone,
  Car,
  Briefcase,
  Globe,
  Utensils,
  Zap,
  FileText,
  ShoppingBag
} from 'lucide-react';
import { useStats } from './useStats';
import { useCurrency } from '../../../hooks/useCurrency';

export function TotalReceiptsCard() {
  const stats = useStats();
  const { formatCurrency } = useCurrency();

  // Category icon mapping with the same colors as RecentReceiptsCard
  const categoryIcons: { [key: string]: { 
    icon: React.ComponentType<any>, 
    color: string,
    bgColor: string
  }} = {
    'Advertising': { icon: Megaphone, color: 'text-pink-500', bgColor: 'bg-pink-100' },
    'Car and Truck Expenses': { icon: Car, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    'Office Expenses': { icon: Briefcase, color: 'text-purple-500', bgColor: 'bg-purple-100' },
    'Travel': { icon: Globe, color: 'text-teal-500', bgColor: 'bg-teal-100' },
    'Meals': { icon: Utensils, color: 'text-orange-500', bgColor: 'bg-orange-100' },
    'Utilities': { icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    'Taxes and Licenses': { icon: FileText, color: 'text-emerald-500', bgColor: 'bg-emerald-100' },
    'Supplies': { icon: ShoppingBag, color: 'text-indigo-500', bgColor: 'bg-indigo-100' }
  };

  const getCategoryIcon = (category: string) => {
    const config = categoryIcons[category];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <div className={`p-2 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors`}>
        <Icon className={`h-4 w-4 text-white`} />
      </div>
    );
  };

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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">Total Receipts</p>
          <h3 className="mt-2 text-3xl font-bold text-white">
            {stats.loading ? '-' : formatCurrency(stats.totalReceipts.value)}
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

      {/* Category summary */}
      {!stats.loading && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(stats.categoryCounts || {}).map(([category]) => (
              <div key={category} className="flex items-center justify-center">
                {getCategoryIcon(category)}
              </div>
            ))}
          </div>
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
        }}
      />
    </motion.div>
  );
}
