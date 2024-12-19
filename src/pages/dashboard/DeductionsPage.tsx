import React from 'react';
import { motion } from 'framer-motion';
import { Percent, Receipt, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { useDeductions } from '../../hooks/useDeductions';
import { formatCurrency } from '../../utils/formatters';

export function DeductionsPage() {
  const {
    deductionsByCategory,
    totalDeductions,
    deductibleReceiptsCount,
    deductionSuggestions,
    potentialSavings
  } = useDeductions();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tax Deductions</h1>
          <p className="text-white/60 mt-1">Track and manage your tax-deductible expenses</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors">
            <FileText className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

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
              <p className="text-sm text-white/60">Total Deductions</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalDeductions)}</p>
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
              <p className="text-sm text-white/60">Deductible Receipts</p>
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
              <p className="text-sm text-white/60">Potential Savings</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(potentialSavings)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deductible Categories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-white/10 backdrop-blur-xl"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Deductible Categories</h2>
          <div className="space-y-4">
            {deductionsByCategory.map((category) => (
              <div key={category.name} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <p className="text-white font-medium">{category.name}</p>
                  <p className="text-white/60 text-sm">{formatCurrency(category.amount)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 rounded-full bg-white/10">
                    <div 
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <span className="text-white/60 text-sm">{Math.round(category.percentage)}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Deduction Suggestions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-white">Suggestions</h2>
            <AlertCircle className="h-4 w-4 text-white/60" />
          </div>
          <div className="space-y-3">
            {deductionSuggestions.map((suggestion) => (
              <div key={suggestion.receipt.id} className="flex items-start justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <p className="text-white text-sm font-medium">
                    {suggestion.receipt.merchant}
                    <span className="text-white/40 text-xs ml-2">#{suggestion.receipt.id.slice(0, 8)}</span>
                  </p>
                  <p className="text-white/60 text-xs mt-1">{suggestion.reason}</p>
                  <p className="text-green-400 text-xs mt-1">Potential saving: {formatCurrency(suggestion.potentialSaving)}</p>
                </div>
                <button 
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => {
                    // TODO: Implement marking receipt as deductible
                  }}
                >
                  <Percent className="h-4 w-4 text-white/60" />
                </button>
              </div>
            ))}
            {deductionSuggestions.length === 0 && (
              <p className="text-white/60 text-sm">No new suggestions at this time</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
