import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useCurrency } from '../../../hooks/useCurrency';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  details?: string;
  isCurrency?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, details, isCurrency = false }: StatCardProps) {
  const { formatCurrency } = useCurrency();
  
  const displayValue = isCurrency ? formatCurrency(value) : value;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900">{displayValue}</h3>
        </div>
        <div className="rounded-full bg-purple-100 p-3">
          <Icon className="h-6 w-6 text-purple-600" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="ml-2 text-sm text-gray-500">vs last month</span>
        </div>
      )}

      {details && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{details}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}