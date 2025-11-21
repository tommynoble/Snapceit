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
import { useReceipts } from '../receipts/ReceiptContext';

export function TotalReceiptsCard() {
  const stats = useStats();
  const { formatCurrency } = useCurrency();
  const { receipts } = useReceipts();

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
    'Supplies': { icon: ShoppingBag, color: 'text-indigo-500', bgColor: 'bg-indigo-100' },
    'Other': { icon: Receipt, color: 'text-gray-500', bgColor: 'bg-gray-100' }
  };

  const getCategoryIcon = (category: string) => {
    const config = categoryIcons[category] || categoryIcons['Other'];
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
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-white/80">Total Spending</p>
          <h3 className="mt-1 text-2xl font-bold text-white">
            {stats.loading ? '-' : formatCurrency(stats.totalSpending.value)}
          </h3>
        </div>
        <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-2">
          <Receipt className="h-5 w-5 text-white" />
        </div>
      </div>

      <div 
        className="overflow-y-auto mt-3" 
        style={{ 
          height: '120px',
          scrollbarWidth: 'none'
        }}
      >
        <div className="space-y-1">
          {!stats.loading && stats.totalReceipts.trend && (
            <div className="relative bg-white/5 rounded overflow-hidden py-0.5 px-2">
              <div className="flex justify-between items-center relative z-10">
                <span className="text-xs font-medium text-white">Trend</span>
                <span className={`text-[10px] font-medium ${stats.totalReceipts.trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalReceipts.trend.isPositive ? '↑' : '↓'} {Math.abs(stats.totalReceipts.trend.value)}%
                </span>
              </div>
            </div>
          )}

          {!stats.loading && (
            <div className="relative bg-white/5 rounded overflow-hidden py-0.5 px-2">
              <div className="flex justify-between items-center relative z-10">
                <span className="text-xs font-medium text-white">Categories</span>
                <span className="text-[10px] font-medium text-white/90">
                  {Object.keys(stats.categoryCounts).length}
                </span>
              </div>
            </div>
          )}

          {!stats.loading && (
            <div className="relative bg-white/5 rounded overflow-hidden py-0.5 px-2">
              <div className="flex justify-between items-center relative z-10">
                <span className="text-xs font-medium text-white">Receipts</span>
                <span className="text-[10px] font-medium text-white/90">
                  {receipts.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
