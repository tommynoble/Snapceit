import React from 'react';
import { motion } from 'framer-motion';
import { PieChart } from 'lucide-react';
import { useStats } from './useStats';

export function CategoriesCard() {
  const stats = useStats();

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
          <p className="text-sm font-medium text-white/80">Categories</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{stats.categories.total}</h3>
        </div>
        <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-3">
          <PieChart className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {stats.categories.breakdown.map((category, index) => (
          <div key={category.category} className="flex items-center justify-between">
            <span className="text-sm text-white/80">{category.category}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${category.percentage}%` }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500/50 to-purple-600/50"
                />
              </div>
              <span className="text-sm font-medium text-white">{Math.round(category.percentage)}%</span>
            </div>
          </div>
        ))}
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
