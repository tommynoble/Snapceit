import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt, MoreVertical, Download, Trash2, Edit } from 'lucide-react';
import { useReceipts } from './ReceiptContext';
import { EditReceiptModal } from './EditReceiptModal';

export function ReceiptsList() {
  const { receipts, deleteReceipt, updateReceipt, downloadReceipt } = useReceipts();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    deleteReceipt(id);
    setActiveMenu(null);
  };

  const handleEdit = (id: number) => {
    setEditingReceipt(id);
    setActiveMenu(null);
  };

  const handleDownload = (id: number) => {
    downloadReceipt(id);
    setActiveMenu(null);
  };

  const handleSaveEdit = (id: number, data: {
    date: string;
    amount: number;
    merchant: string;
    category: string;
  }) => {
    updateReceipt(id, data);
    setEditingReceipt(null);
  };

  return (
    <>
      <div className="space-y-4">
        {receipts.map((receipt, index) => (
          <motion.div
            key={receipt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              {receipt.preview ? (
                <img 
                  src={receipt.preview} 
                  alt="Receipt thumbnail" 
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="rounded-full bg-purple-100 p-2">
                  <Receipt className="h-5 w-5 text-purple-600" />
                </div>
              )}
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
            
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === receipt.id ? null : receipt.id)}
                className="rounded-full p-1 text-gray-400 opacity-0 hover:bg-gray-100 group-hover:opacity-100"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {activeMenu === receipt.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5"
                >
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleDownload(receipt.id)}
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleEdit(receipt.id)}
                  >
                    <Edit size={16} />
                    Edit Details
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(receipt.id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {editingReceipt !== null && (
        <EditReceiptModal
          isOpen={true}
          onClose={() => setEditingReceipt(null)}
          receipt={receipts.find(r => r.id === editingReceipt)!}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}