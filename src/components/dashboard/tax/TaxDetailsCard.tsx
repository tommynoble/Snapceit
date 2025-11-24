import { motion } from 'framer-motion';
import { Receipt } from 'lucide-react';
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
      className="relative p-5 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg shadow-md bg-white"
    >
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
        <div>
          <p className="text-sm font-medium text-gray-600">Tax Summary</p>
          <h3 className="mt-1 text-2xl font-bold text-gray-900">
            ${taxSummary.totalTax.toFixed(2)}
          </h3>
        </div>
        <div className="rounded-full bg-blue-100 p-2">
          <Receipt className="h-5 w-5 text-blue-600" />
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
          {/* Average Tax Rate */}
          <div className="relative bg-gray-50 rounded overflow-hidden py-0.5 px-2">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-xs font-medium text-gray-700">Avg. Tax Rate</span>
              <span className="text-[10px] font-medium text-gray-600">
                {taxSummary.taxRate}%
              </span>
            </div>
          </div>

          {/* Estimated Savings */}
          <div className="relative bg-gray-50 rounded overflow-hidden py-0.5 px-2">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-xs font-medium text-gray-700">Est. Savings</span>
              <span className="text-[10px] font-medium text-green-600">
                ${taxSummary.estimatedSavings.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Total Receipts */}
          <div className="relative bg-gray-50 rounded overflow-hidden py-0.5 px-2">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-xs font-medium text-gray-700">Total Receipts</span>
              <span className="text-[10px] font-medium text-gray-600">
                {receipts.length}
              </span>
            </div>
          </div>

          {/* Deductible Amount */}
          <div className="relative bg-gray-50 rounded overflow-hidden py-0.5 px-2">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-xs font-medium text-gray-700">Deductible</span>
              <span className="text-[10px] font-medium text-blue-600">
                ${(taxSummary.totalTax / 0.15).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
