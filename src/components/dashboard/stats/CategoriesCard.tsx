import React from 'react';
import { motion } from 'framer-motion';
import { PieChart } from 'lucide-react';
import { useStats } from './useStats';

export function CategoriesCard() {
  const stats = useStats();
  
  // Calculate total spending and category percentages
  const categories = Object.entries(stats.categoryBreakdown)
    .map(([category, data]) => ({
      category,
      count: data.count,
      percentage: stats.totalSpending.value > 0 ? (data.total / stats.totalSpending.value) * 100 : 0
    }))
    .sort((a, b) => b.percentage - a.percentage);

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
          <p className="text-sm font-medium text-white/80">Categories</p>
          <h3 className="mt-1 text-2xl font-bold text-white">
            {stats.loading ? '-' : categories.length}
          </h3>
        </div>
        <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-2">
          <PieChart className="h-5 w-5 text-white" />
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
          {!stats.loading && categories.map((category) => (
            <div 
              key={category.category} 
              className="relative bg-white/5 rounded overflow-hidden py-0.5 px-2"
              style={{
                background: 'linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))'
              }}
            >
              <div className="flex justify-between items-center relative z-10">
                <span className="text-xs font-medium text-white">{category.category}</span>
                <span className="text-[10px] font-medium text-white/90">
                  {Math.round(category.percentage)}%
                </span>
              </div>
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 transition-all duration-500"
                style={{ width: `${category.percentage}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
