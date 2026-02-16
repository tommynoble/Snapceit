import React, { useState, useEffect } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { EditReceiptModal } from './EditReceiptModal';
import { useReceipts } from './ReceiptContext';
import { useCurrency } from '../../../hooks/useCurrency';
import type { Receipt } from './ReceiptContext';

interface ReceiptsListProps {
  receipts: Receipt[];
}

export function ReceiptsList({ receipts }: ReceiptsListProps) {
  const { deleteReceipt, updateReceipt } = useReceipts();
  const { formatCurrency } = useCurrency();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<string | null>(null);
  const [sortedReceipts, setSortedReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    // Sort receipts by date in descending order (most recent first)
    setSortedReceipts([...receipts].sort((a, b) => {
      // Use 'date' only as per interface, fallback to created_at
      const dateA = a.date || a.created_at || '';
      const dateB = b.date || b.created_at || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
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

  if (receipts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-500">No receipts found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedReceipts.map((receipt) => (
        <div key={receipt.id} className="relative bg-white rounded-lg shadow-sm p-4 border border-gray-200 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{receipt.merchant || 'Unknown Merchant'}</h3>
              <div className="mt-1 text-sm text-gray-500 flex items-center gap-2">
                <span>
                  {new Date(receipt.date || receipt.created_at || '').toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <span className="text-gray-300">•</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${receipt.category === 'Meals' ? 'bg-green-100 text-green-800' :
                    receipt.category === 'Travel' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                  {receipt.category || 'Uncategorized'}
                </span>
              </div>
            </div>
            <div className="text-right flex items-center space-x-6">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(receipt.total || 0)}
                </div>
                {receipt.tax !== undefined && (
                  <div className="text-xs text-gray-500">
                    Tax: {formatCurrency(receipt.tax)}
                  </div>
                )}
              </div>
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setActiveMenu(activeMenu === receipt.id ? null : receipt.id)}
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <MoreVertical className="h-5 w-5 text-gray-400" />
                </button>

                {activeMenu === receipt.id && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    style={{ top: '100%', zIndex: 50 }}
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
          receipt={receipts.find(r => r.id === editingReceipt) as any}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}