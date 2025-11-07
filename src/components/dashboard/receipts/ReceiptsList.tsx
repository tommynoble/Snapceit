import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Download, Edit, Trash2 } from 'lucide-react';
import { EditReceiptModal } from './EditReceiptModal';
import { useReceipts } from './ReceiptContext';
import { useCurrency } from '../../../hooks/useCurrency';
import type { Receipt } from './ReceiptContext';

export function ReceiptsList() {
  const { receipts, deleteReceipt, updateReceipt } = useReceipts();
  const { formatCurrency } = useCurrency();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<string | null>(null);
  const [sortedReceipts, setSortedReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    // Sort receipts by date in descending order (most recent first)
    setSortedReceipts([...receipts].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }));
  }, [receipts]);

  const handleDelete = async (id: string) => {
    try {
      await deleteReceipt(id);
      setActiveMenu(null);
    } catch (error) {
      console.error('Error deleting receipt:', error);
    }
  };

  const handleEdit = (id: string) => {
    setEditingReceipt(id);
    setActiveMenu(null);
  };

  const handleDownload = (id: string) => {
    // Implement download logic
    console.log('Downloading receipt:', id);
    setActiveMenu(null);
  };

  const handleSaveEdit = async (formData: Partial<Receipt>) => {
    if (editingReceipt !== null) {
      try {
        await updateReceipt(editingReceipt, formData);
        setEditingReceipt(null);
      } catch (error) {
        console.error('Error updating receipt:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {sortedReceipts.map((receipt) => (
        <div key={receipt.id} className="relative bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{receipt.merchant}</h3>
              <div className="mt-1 text-sm text-gray-500">
                {receipt.date && new Date(receipt.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-sm text-gray-500">
                Category: {receipt.category}
              </div>
            </div>
            <div className="text-right flex items-center space-x-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(receipt.total)}
                </div>
                {receipt.tax && (
                  <div className="text-sm text-gray-500">
                    Tax: {formatCurrency(receipt.tax.total)}
                  </div>
                )}
              </div>
              <div className="relative inline-block text-left">
                <button 
                  onClick={() => setActiveMenu(activeMenu === receipt.id ? null : receipt.id)}
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                >
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>

                {activeMenu === receipt.id && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    style={{ top: '100%' }}
                  >
                    <div className="py-1" role="menu">
                      <button
                        onClick={() => handleEdit(receipt.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        role="menuitem"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Receipt
                      </button>
                      <button
                        onClick={() => handleDelete(receipt.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        role="menuitem"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {editingReceipt !== null && (
        <EditReceiptModal
          isOpen={true}
          onClose={() => setEditingReceipt(null)}
          receipt={receipts.find(r => r.id === editingReceipt)!}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}