import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt as ReceiptIcon, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  Copy, 
  Check, 
  ShoppingBag, 
  Coffee, 
  Car, 
  Home, 
  Utensils, 
  Gift, 
  Book, 
  Briefcase, 
  Heart, 
  Globe, 
  Zap, 
  Megaphone, 
  FileText 
} from 'lucide-react';
import { useReceipts } from './ReceiptContext';
import { EditReceiptModal } from './EditReceiptModal';
import { toast } from 'react-hot-toast';

export function RecentReceiptsCard() {
  const { receipts, deleteReceipt, updateReceipt, refreshReceipts } = useReceipts();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Category icon mapping
  const categoryIcons: { [key: string]: { 
    icon: React.ComponentType<any>, 
    color: string,
    bgColor: string
  }} = {
    'Advertising': { icon: Megaphone, color: 'text-pink-500', bgColor: 'bg-pink-100' },
    'Car and Truck Expenses': { icon: Car, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    'Office Expenses': { icon: Briefcase, color: 'text-purple-500', bgColor: 'bg-purple-100' },
    'Travel': { icon: Globe, color: 'text-teal-500', bgColor: 'bg-teal-100' },
    'Meals': { icon: Utensils, color: 'text-orange-500', bgColor: 'bg-orange-100' },
    'Utilities': { icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    'Taxes and Licenses': { icon: FileText, color: 'text-emerald-500', bgColor: 'bg-emerald-100' },
    'Supplies': { icon: ShoppingBag, color: 'text-indigo-500', bgColor: 'bg-indigo-100' },
    'Other': { icon: ReceiptIcon, color: 'text-gray-500', bgColor: 'bg-gray-100' }
  };

  const getCategoryIcon = (category: string) => {
    const config = categoryIcons[category] || categoryIcons['Other'];
    const Icon = config.icon;
    return (
      <div className={`p-2.5 rounded-full ${config.bgColor} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>
    );
  };

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

  useEffect(() => {
    console.log('Current receipts:', receipts); // Debug log
  }, [receipts]);

  const handleReceiptClick = (receipt: any) => {
    if (isMultiSelectMode) {
      const newSelected = new Set(selectedReceipts);
      if (newSelected.has(receipt.receiptId)) {
        newSelected.delete(receipt.receiptId);
      } else {
        newSelected.add(receipt.receiptId);
      }
      setSelectedReceipts(newSelected);
    } else {
      handleEdit(receipt);
    }
  };

  const handleEdit = (receipt: any) => {
    setSelectedReceipt(receipt);
    setEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleDeleteClick = (receipt: any, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log('Delete clicked for receipt:', receipt); // Debug full receipt object
    
    // Check for both id and receiptId
    const id = receipt?.receiptId || receipt?.id;
    if (!receipt || !id) {
      console.error('Invalid receipt:', receipt);
      toast.error('Invalid receipt');
      return;
    }
    setSelectedReceipt(receipt);
    setDeleteModalOpen(true);
    setActiveMenu(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Check for both id and receiptId
      const id = selectedReceipt?.receiptId || selectedReceipt?.id;
      if (!selectedReceipt || !id) {
        console.error('No receipt selected:', selectedReceipt);
        toast.error('No receipt selected');
        return;
      }

      console.log('Deleting receipt with ID:', id); // Debug log
      await deleteReceipt(id);
      await refreshReceipts(); // Refresh the receipts list after deletion
      toast.success('Receipt deleted successfully');
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast.error('Failed to delete receipt');
    } finally {
      setDeleteModalOpen(false);
      setSelectedReceipt(null);
    }
  };

  const handleCopyReceipts = async () => {
    if (selectedReceipts.size === 0) return;

    const selectedReceiptsData = receipts
      .filter(receipt => selectedReceipts.has(receipt.receiptId))
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

  const handleSave = async (formData: any) => {
    try {
      if (selectedReceipt) {
        const id = selectedReceipt.receiptId || selectedReceipt.id;
        if (!id) {
          throw new Error('No valid receipt ID found');
        }
        await updateReceipt(id, formData);
        await refreshReceipts(); // Refresh to get updated data
        toast.success('Receipt updated successfully');
        setEditModalOpen(false);
        setSelectedReceipt(null);
      }
    } catch (error) {
      console.error('Error updating receipt:', error);
      toast.error('Failed to update receipt');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01]"
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
            key={receipt.receiptId || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => isMultiSelectMode ? handleReceiptClick(receipt) : handleEdit(receipt)}
            className={`group relative flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 cursor-pointer
              ${selectedReceipts.has(receipt.receiptId) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}
              ${isMultiSelectMode ? 'hover:border-purple-500' : ''}`}
          >
            <div className="flex items-center gap-4">
              {getCategoryIcon(receipt.category)}
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

            <div className="relative ml-auto">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === receipt.receiptId ? null : receipt.receiptId);
                }}
                className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>

              <AnimatePresence>
                {activeMenu === receipt.receiptId && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    style={{ top: '100%' }}
                  >
                    <div className="py-1" role="menu">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(receipt);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        role="menuitem"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(receipt, e);
                        }}
                        disabled={receipt.status === 'adding'}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center
                          ${receipt.status === 'adding' 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-600 hover:bg-gray-100'
                          }`}
                        role="menuitem"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                        {receipt.status === 'adding' && (
                          <span className="ml-2 text-xs">(Adding in progress)</span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
        {receipts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ReceiptIcon className="h-12 w-12 text-gray-300 mb-2" />
            <p>No receipts yet</p>
          </div>
        )}
      </div>

      {editModalOpen && selectedReceipt && (
        <EditReceiptModal
          isOpen={true}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedReceipt(null);
          }}
          receipt={selectedReceipt}
          onSave={handleSave}
        />
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            >
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Delete Receipt
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete {selectedReceipts.size > 0 ? `these ${selectedReceipts.size} receipts` : 'this receipt'}? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSelectedReceipt(null);
                  }}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
