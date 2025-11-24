import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useReceipts } from '../receipts/ReceiptContext';

export function SpendingOverviewCard() {
  const { receipts, loading } = useReceipts();

  // Process data for the chart
  const merchantData = receipts.reduce((acc, receipt) => {
    const merchant = receipt.merchant || 'Unknown';
    if (!acc[merchant]) {
      acc[merchant] = 0;
    }
    acc[merchant] += Number(receipt.total) || 0;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(merchantData)
    .map(([merchant, total]) => ({
      merchant: merchant.length > 15 ? `${merchant.slice(0, 15)}...` : merchant,
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl bg-white/10 backdrop-blur-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 h-[400px]"
      >
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-white/20 rounded mb-8" />
          <div className="h-[300px] bg-white/10 rounded" />
        </div>
      </motion.div>
    );
  }

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl bg-white/10 backdrop-blur-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 h-[400px] flex flex-col items-center justify-center"
      >
        <h3 className="text-lg font-semibold text-white mb-2">No Spending Data</h3>
        <p className="text-white/60 text-center">
          Add some receipts to see your spending overview
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-white/10 backdrop-blur-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 h-[400px]"
    >
      <h3 className="text-lg font-semibold text-white mb-3 pb-3 border-b border-white/10">Top Merchants by Spending</h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="merchant" 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
              tickMargin={5}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: 'white',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Spent']}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Bar 
              dataKey="total" 
              fill="rgba(255, 255, 255, 0.4)"  // White with lower opacity
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
