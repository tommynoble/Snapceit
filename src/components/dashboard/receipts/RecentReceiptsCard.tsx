import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, MoreVertical, Edit2, Trash2, X, AlertTriangle, Copy, Check } from 'lucide-react';
import { useReceipts } from './ReceiptContext';
import { EditReceiptModal } from './EditReceiptModal';
import { toast } from 'react-hot-toast';

export function RecentReceiptsCard() {
  const { receipts, deleteReceipt } = useReceipts();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Handle shift key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey) {
        setIsMultiSelectMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.shiftKey) {
        setIsMultiSelectMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleReceiptClick = (receipt: any) => {
    if (isMultiSelectMode) {
      const newSelected = new Set(selectedReceipts);
      if (newSelected.has(receipt.id)) {
        newSelected.delete(receipt.id);
      } else {
        newSelected.add(receipt.id);
      }
      setSelectedReceipts(newSelected);
    }
  };

  const handleEdit = (receipt: any) => {
    setSelectedReceipt(receipt);
    setEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleDeleteClick = (receipt: any) => {
    if (selectedReceipts.size > 0) {
      setDeleteModalOpen(true);
    } else {
      setSelectedReceipt(receipt);
      setDeleteModalOpen(true);
    }
    setActiveMenu(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedReceipts.size > 0) {
        // Delete multiple receipts
        const promises = Array.from(selectedReceipts).map(id => deleteReceipt(id));
        await Promise.all(promises);
        toast.success(`${selectedReceipts.size} receipts deleted successfully`);
        setSelectedReceipts(new Set());
      } else if (selectedReceipt) {
        // Delete single receipt
        await deleteReceipt(selectedReceipt.id);
        toast.success('Receipt deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting receipt(s):', error);
      toast.error('Failed to delete receipt(s)');
    } finally {
      setDeleteModalOpen(false);
      setSelectedReceipt(null);
    }
  };

  const handleCopyReceipts = async () => {
    if (selectedReceipts.size === 0) return;

    const selectedReceiptsData = receipts
      .filter(receipt => selectedReceipts.has(receipt.id))
      .map(receipt => ({
        merchant: receipt.merchant,
        total: receipt.total,
        date: receipt.date,
        category: receipt.category,
        items: receipt.items
      }));

    try {
      await navigator.clipboard.writeText(JSON.stringify(selectedReceiptsData, null, 2));
      toast.success('Receipt data copied to clipboard');
    } catch (error) {
      console.error('Error copying receipts:', error);
      toast.error('Failed to copy receipt data');
    }
  };

  const handleSave = async (id: string, updatedData: any) => {
    // Implement save functionality
    setEditModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Receipts</h3>
        {selectedReceipts.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleCopyReceipts}
              className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg"
            >
              <Copy size={16} />
              Copy ({selectedReceipts.size})
            </button>
            <button
              onClick={() => handleDeleteClick(null)}
              className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={16} />
              Delete ({selectedReceipts.size})
            </button>
          </div>
        )}
      </div>
      
      <div className="h-[400px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
        {receipts.map((receipt, index) => (
          <motion.div
            key={receipt.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleReceiptClick(receipt)}
            className={`group relative flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 cursor-pointer
              ${selectedReceipts.has(receipt.id) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}
              ${isMultiSelectMode ? 'hover:border-purple-500' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-full p-2 ${selectedReceipts.has(receipt.id) ? 'bg-purple-100' : 'bg-purple-100'}`}>
                {selectedReceipts.has(receipt.id) ? (
                  <Check className="h-5 w-5 text-purple-600" />
                ) : (
                  <Receipt className="h-5 w-5 text-purple-600" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  ${(receipt.total || 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  {receipt.merchant || 'Unknown Merchant'}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {receipt.category !== 'Uncategorized' ? receipt.category : ''} {receipt.category !== 'Uncategorized' && '•'} {new Date(receipt.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {!isMultiSelectMode && (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === receipt.id ? null : receipt.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 rounded-full p-1 hover:bg-gray-100"
                >
                  <MoreVertical className="h-5 w-5 text-gray-400" />
                </button>

                <AnimatePresence>
                  {activeMenu === receipt.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(receipt);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit2 size={16} />
                        Edit Receipt
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(receipt);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ))}
        {receipts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Receipt className="h-12 w-12 text-gray-300 mb-2" />
            <p>No receipts yet</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedReceipt && (
        <EditReceiptModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedReceipt(null);
          }}
          receipt={selectedReceipt}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (selectedReceipt || selectedReceipts.size > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center gap-3 text-red-600">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-semibold">Delete Receipt{selectedReceipts.size > 0 ? 's' : ''}</h3>
              </div>
              
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete {selectedReceipts.size > 0 ? `${selectedReceipts.size} receipts` : 'this receipt'}? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSelectedReceipt(null);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
