import React from 'react';
import { motion } from 'framer-motion';
import { X, Receipt, DollarSign, FileText, Percent, PiggyBank, TrendingUp, Download } from 'lucide-react';
import { useReceipts } from '../receipts/ReceiptContext';
import { calculateTaxSummary } from '../../../services/taxCalculator';

interface TaxPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaxPage({ isOpen, onClose }: TaxPageProps) {
  const { receipts } = useReceipts();
  const taxSummary = calculateTaxSummary(receipts);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Receipt className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Tax Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              icon={<DollarSign className="h-5 w-5" />}
              title="Total Tax"
              value={`$${taxSummary.totalTax.toFixed(2)}`}
              color="blue"
            />
            <SummaryCard
              icon={<Percent className="h-5 w-5" />}
              title="Average Tax Rate"
              value={`${taxSummary.taxRate}%`}
              color="purple"
            />
            <SummaryCard
              icon={<FileText className="h-5 w-5" />}
              title="Deductible Amount"
              value={`$${taxSummary.deductibleTotal.toFixed(2)}`}
              color="indigo"
            />
            <SummaryCard
              icon={<PiggyBank className="h-5 w-5" />}
              title="Estimated Savings"
              value={`$${taxSummary.estimatedSavings.toFixed(2)}`}
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Tax Breakdown</h3>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {Object.entries(taxSummary.monthlyBreakdown).map(([month, amount]) => (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{month}</span>
                    <span className="text-sm font-medium text-gray-900">${amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tax by Category</h3>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <span>* Deductible</span>
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(taxSummary.categoryTotals).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 capitalize">{category}</span>
                      {taxSummary.deductiblesByCategory[category] > 0 && (
                        <span className="text-xs text-green-500">*</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-gray-900">${amount.toFixed(2)}</span>
                      {taxSummary.deductiblesByCategory[category] > 0 && (
                        <span className="text-xs text-green-600">
                          ${taxSummary.deductiblesByCategory[category].toFixed(2)} deductible
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="mt-6 flex justify-end">
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                // TODO: Implement export functionality
                console.log('Export tax summary');
              }}
            >
              <Download className="h-4 w-4" />
              <span>Export Tax Summary</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: 'blue' | 'purple' | 'indigo' | 'green';
}

function SummaryCard({ icon, title, value, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`rounded-full p-2 ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-sm text-gray-600">{title}</span>
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}
