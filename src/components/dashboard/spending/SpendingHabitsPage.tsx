import React from 'react';
import { BarChart, LineChart, ChevronLeft, Download } from 'lucide-react';
import { SpendingTrendsChart } from './SpendingTrendsChart';
import { MerchantComparisonChart } from './MerchantComparisonChart';
import { SpendingInsights } from './SpendingInsights';
import { useStats } from '../stats/useStats';
import { useReceipts } from '../receipts/ReceiptContext';
import { motion } from 'framer-motion';

export function SpendingHabitsPage() {
  const stats = useStats();
  const { receipts } = useReceipts();

  const handleBack = () => {
    window.history.back();
  };

  const handleDownloadExcel = () => {
    // Create CSV content
    const headers = ['Date', 'Merchant', 'Category', 'Amount'];
    const rows = receipts.map(receipt => [
      receipt.date,
      receipt.merchant,
      receipt.category,
      receipt.amount.toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spending-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-fuchsia-500 via-purple-600 to-purple-800"
    >
      <div className="px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button 
              onClick={handleBack}
              className="group relative rounded-full bg-white/10 p-3 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Back to Dashboard"
            >
              <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
              <span className="sr-only">Back to Dashboard</span>
            </motion.button>
            <h1 className="text-3xl font-bold text-white">Spending Habits</h1>
          </div>
          <motion.button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={20} />
            Download Data
          </motion.button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Monthly Spending Trends */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white p-6 shadow-lg"
          >
            <div className="mb-6 flex items-center gap-3">
              <LineChart className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Monthly Spending Trends</h2>
            </div>
            <SpendingTrendsChart />
          </motion.div>

          {/* Merchant Comparison */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white p-6 shadow-lg"
          >
            <div className="mb-6 flex items-center gap-3">
              <BarChart className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Top Merchants</h2>
            </div>
            <MerchantComparisonChart />
          </motion.div>
        </div>

        {/* Spending Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <SpendingInsights />
        </motion.div>
      </div>
    </motion.div>
  );
}