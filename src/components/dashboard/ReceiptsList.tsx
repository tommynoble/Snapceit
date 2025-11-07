import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, MoreVertical } from 'lucide-react';

export function ReceiptsList() {
  const receipts = [
    { 
      id: 1, 
      date: 'July 23', 
      amount: 221, 
      merchant: 'Chicken Republic',
      category: 'Food & Dining'
    },
    { 
      id: 2, 
      date: 'July 23', 
      amount: 332, 
      merchant: 'Chicken Republic',
      category: 'Food & Dining'
    },
  ];

  return (
    <div className="h-[400px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
      {receipts.map((receipt, index) => (
        <motion.div
          key={receipt.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-100 p-2">
              <Receipt className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                ${receipt.amount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                {receipt.merchant}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {receipt.category} • {receipt.date}
              </div>
            </div>
          </div>
          
          <button className="opacity-0 group-hover:opacity-100 rounded-full p-1 hover:bg-gray-100">
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}