import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award,      // Advertising
  Car,        // Car and Truck Expenses
  Building,   // Office Expenses
  Globe,      // Travel
  Utensils,   // Food & Dining
  Briefcase,  // Supplies
  FileText,   // Other Expenses
  Tag,        // Default/Uncategorized
  MoreVertical, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle,
  Copy
} from 'lucide-react';
import { useReceipts } from './ReceiptContext';
import { EditReceiptModal } from './EditReceiptModal';
import { toast } from 'react-hot-toast';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { BUSINESS_EXPENSE_CATEGORIES } from '../../../constants/us-tax';
import { useAuth } from '../../../auth/CognitoAuthContext';
import { api } from '../../../utils/api';

const iconMap: { [key: string]: any } = {
  Award,      // Advertising
  Car,        // Car and Truck Expenses
  Building,   // Office Expenses
  Globe,      // Travel
  Utensils,   // Food & Dining
  Briefcase,  // Supplies
  FileText,   // Other Expenses
  Tag         // Default/Uncategorized
};

export function RecentReceiptsCard() {
  const { receipts, deleteReceipt, updateReceipt, refreshReceipts } = useReceipts();
  const { formatAmount } = useCurrency();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const { currentUser } = useAuth();

  const getBusinessCategoryIcon = (categoryId?: string, receipt?: any) => {
    if (!categoryId || !BUSINESS_EXPENSE_CATEGORIES[categoryId as keyof typeof BUSINESS_EXPENSE_CATEGORIES]) {
      // Set a default business category for uncategorized receipts
      if (receipt && categoryId !== 'other_expenses' && currentUser?.token) {
        api.receipts.update(receipt.id, { 
          category: 'other_expenses' // Default to Other Expenses
        }, currentUser.token)
          .then(() => {
            refreshReceipts();
          })
          .catch(error => {
            console.error('Error updating receipt category:', error);
          });
      }

      const defaultCategory = BUSINESS_EXPENSE_CATEGORIES['other_expenses'];
      return (
        <div className={`p-2 rounded-full ${defaultCategory.bgColor}`}>
          <FileText className={`h-5 w-5 ${defaultCategory.color}`} />
        </div>
      );
    }

    const category = BUSINESS_EXPENSE_CATEGORIES[categoryId as keyof typeof BUSINESS_EXPENSE_CATEGORIES];
    const IconComponent = iconMap[category.icon] || Tag;
    return (
      <div className={`p-2 rounded-full ${category.bgColor}`}>
        <IconComponent className={`h-5 w-5 ${category.color}`} />
      </div>
    );
  };

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

  const handleEditSubmit = async (updatedReceipt: any) => {
    try {
      const id = selectedReceipt.id || selectedReceipt.receiptId;
      
      // Update the receipt
      await updateReceipt(id, {
        ...updatedReceipt,
        receiptId: id
      });
      
      // Force refresh receipts to get updated data
      await refreshReceipts();
      
      setEditModalOpen(false);
      setSelectedReceipt(null);
      toast.success('Receipt updated successfully');
    } catch (error) {
      console.error('Error updating receipt:', error);
      toast.error('Failed to update receipt');
    }
  };

  const renderReceipt = (receipt: any) => {
    const receiptId = receipt.receiptId || receipt.id;
    const category = receipt.businessCategory ? 
      BUSINESS_EXPENSE_CATEGORIES[receipt.businessCategory as keyof typeof BUSINESS_EXPENSE_CATEGORIES] : 
      null;
    
    return (
      <motion.div
        key={receiptId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => isMultiSelectMode ? handleReceiptClick(receipt) : handleEdit(receipt)}
        className={`group relative flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 cursor-pointer
          ${selectedReceipts.has(receiptId) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}
          ${isMultiSelectMode ? 'hover:border-purple-500' : ''}`}
      >
        <div className="flex items-center gap-3">
          {getBusinessCategoryIcon(receipt.businessCategory, receipt)}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900">
              {formatAmount(receipt.total || 0)}
            </div>
            <div className="text-sm text-gray-500">
              {receipt.merchant || 'Unknown Merchant'}
            </div>
            <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
              <span className="font-medium">
                {category ? category.name : 'Uncategorized'}
              </span>
              <span>•</span>
              <span>{new Date(receipt.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="relative ml-auto">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === receiptId ? null : receiptId);
            }}
            className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </button>

          <AnimatePresence>
            {activeMenu === receiptId && (
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
        {receipts.map(receipt => renderReceipt(receipt))}
      </div>
      {receipts.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Tag className="h-12 w-12 text-gray-300 mb-2" />
          <p>No receipts yet</p>
        </div>
      )}
      {editModalOpen && selectedReceipt && (
        <EditReceiptModal
          isOpen={true}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedReceipt(null);
          }}
          receipt={selectedReceipt}
          onSave={handleEditSubmit}
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
