import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, DollarSign, Percent, PiggyBank } from 'lucide-react';
import { useReceipts } from '../receipts/ReceiptContext';
import { calculateTaxSummary } from '../../../services/taxCalculator';

export function TaxDetailsCard() {
  const { receipts } = useReceipts();
  const taxSummary = calculateTaxSummary(receipts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-md p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">Tax Summary</h3>
        <div className="rounded-full bg-blue-100 p-1.5">
          <Receipt className="h-4 w-4 text-blue-600" />
        </div>
      </div>

      <div className="space-y-3">
        {/* Total Tax */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Total Tax</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            ${taxSummary.totalTax.toFixed(2)}
          </span>
        </div>

        {/* Average Tax Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Percent className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Avg. Tax Rate</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {taxSummary.taxRate}%
          </span>
        </div>

        {/* Estimated Savings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PiggyBank className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Est. Savings</span>
          </div>
          <span className="text-sm font-semibold text-green-600">
            ${taxSummary.estimatedSavings.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
