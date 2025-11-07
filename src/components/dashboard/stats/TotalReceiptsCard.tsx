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
import { Card, CardContent } from '@/components/ui/card';
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
    >
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg shadow-md bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-0" style={{ backdropFilter: 'blur(10px)' }}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total Spending</p>
              <h3 className="mt-2 text-3xl font-bold text-white">
                {stats.loading ? '-' : formatCurrency(stats.totalSpending.value)}
              </h3>
              <p className="text-sm text-white/60 mt-1">
                {!stats.loading && `${Object.keys(stats.categoryCounts).length} Categories • ${receipts.length} Receipts`}
              </p>
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
                {Object.entries(stats.categoryBreakdown || {})
                  .sort((a, b) => b[1].total - a[1].total)
                  .slice(0, 5)
                  .map(([category, data]) => (
                    <div key={category} title={`${category}: ${formatCurrency(data.total)}`} className="flex flex-col items-center">
                      {getCategoryIcon(category)}
                      <span className="mt-1 text-xs text-white/60 truncate max-w-full">
                        {formatCurrency(data.total)}
                      </span>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
