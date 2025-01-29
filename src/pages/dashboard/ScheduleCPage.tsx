import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Percent, Receipt, DollarSign, FileText, AlertCircle, Download, Eye, Printer } from 'lucide-react';
import { useDeductions } from '../../hooks/useDeductions';
import { useScheduleC } from '../../hooks/useScheduleC';
import { formatCurrency } from '../../utils/formatters';
import { ScheduleCPreview } from '../../components/dashboard/tax/ScheduleCPreview';

export function ScheduleCPage() {
  const [showPreview, setShowPreview] = useState(false);
  const { deductionsByCategory, deductibleReceiptsCount, deductionSuggestions } = useDeductions();
  const { scheduleC, getTotalExpenses, getNetProfit } = useScheduleC();

  const handleDownload = () => {
    // Implement PDF download functionality
    console.log('Downloading Schedule C...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Schedule C Expenses</h1>
          <p className="text-white/60 mt-1">Track and categorize your business expenses for Schedule C tax filing</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button 
            onClick={handleDownload}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Schedule C
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <ScheduleCPreview
            businessName={scheduleC.businessName}
            businessCode={scheduleC.businessCode}
            ein={scheduleC.ein}
            expenses={scheduleC.expenses}
            grossReceipts={scheduleC.grossReceipts}
            onDownload={handleDownload}
            onPrint={handlePrint}
          />
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <DollarSign className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Business Expenses</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(getTotalExpenses())}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Receipt className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-white/60">Business Receipts</p>
              <p className="text-2xl font-bold text-white">{deductibleReceiptsCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Percent className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-white/60">Net Profit/Loss</p>
              <p className={`text-2xl font-bold ${getNetProfit() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(getNetProfit())}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Schedule C Categories</h3>
          <div className="space-y-4">
            {Object.entries(scheduleC.expenses).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-white/80 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-white font-medium">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Suggestions</h3>
          <div className="space-y-4">
            {deductionSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                <p className="text-white/80">{suggestion}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
