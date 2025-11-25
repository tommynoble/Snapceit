import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt as ReceiptIcon, 
  MoreVertical, 
  Trash2, 
  X, 
  ShoppingBag, 
  Car, 
  Utensils, 
  Briefcase, 
  Plane, 
  Zap, 
  Megaphone, 
  FileText,
  AlertTriangle,
  DollarSign,
  Home,
  Edit2,
  Check,
  XCircle
} from 'lucide-react';
import { useReceipts } from './ReceiptContext';
import { toast } from 'react-hot-toast';
import { useCurrency } from '../../../hooks/useCurrency';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export function RecentReceiptsCard() {
  const { receipts, deleteReceipt, updateReceipt, refreshReceipts } = useReceipts();
  const { formatCurrency } = useCurrency();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState<{ [key: string]: any }>({});
  const cardRef = useRef<HTMLDivElement>(null);

  // Category icon mapping - using widely accepted, accurate icons
  const categoryIcons: { [key: string]: { 
    icon: React.ComponentType<any>, 
    color: string,
    bgColor: string
  }} = {
    'Advertising': { icon: Megaphone, color: 'text-pink-500', bgColor: 'bg-pink-100' },
    'Car and Truck Expenses': { icon: Car, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    'Office Expenses': { icon: Briefcase, color: 'text-indigo-500', bgColor: 'bg-indigo-100' },
    'Travel': { icon: Plane, color: 'text-cyan-500', bgColor: 'bg-cyan-100' },
    'Meals': { icon: Utensils, color: 'text-green-500', bgColor: 'bg-green-100' },
    'Utilities': { icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    'Taxes and Licenses': { icon: DollarSign, color: 'text-red-500', bgColor: 'bg-red-100' },
    'Supplies': { icon: ShoppingBag, color: 'text-orange-500', bgColor: 'bg-orange-100' },
    'Other': { icon: ReceiptIcon, color: 'text-gray-500', bgColor: 'bg-gray-100' }
  };

  const getCategoryIcon = (category: string | null | undefined) => {
    const config = categoryIcons[category || 'Other'] || categoryIcons['Other'];
    const Icon = config.icon;
    
    // If no category (not categorized yet), use purple
    if (!category) {
      return (
        <div className={`p-2.5 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center`}>
          <Icon className={`h-5 w-5 text-white`} />
        </div>
      );
    }
    
    const categoryGradients: { [key: string]: string } = {
      'Travel': 'from-cyan-500 to-cyan-700',
      'Meals': 'from-green-500 to-green-700',
      'Supplies': 'from-orange-500 to-orange-700',
      'Car and Truck Expenses': 'from-blue-500 to-blue-700',
      'Advertising': 'from-pink-500 to-pink-700',
      'Office Expenses': 'from-indigo-500 to-indigo-700',
      'Utilities': 'from-yellow-500 to-yellow-700',
      'Taxes and Licenses': 'from-red-500 to-red-700',
      'Other': 'from-gray-500 to-gray-700'
    };
    
    const gradient = categoryGradients[category] || categoryGradients['Other'];
    
    return (
      <div className={`p-2.5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 text-white`} />
      </div>
    );
  };

  // Get confidence badge with color coding
  const getConfidenceBadge = (confidence?: number, category?: string) => {
    if (!confidence) return null;
    
    // Use category color if provided, otherwise use confidence-based colors
    let bgColor = 'bg-red-100';
    let textColor = 'text-red-800';
    let label = 'Low';
    
    if (category) {
      // Use category colors
      if (category === 'Travel') {
        bgColor = 'bg-cyan-100';
        textColor = 'text-cyan-800';
      } else if (category === 'Meals') {
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
      } else if (category === 'Supplies') {
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
      } else if (category === 'Car and Truck Expenses') {
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
      } else if (category === 'Advertising') {
        bgColor = 'bg-pink-100';
        textColor = 'text-pink-800';
      } else if (category === 'Office Expenses') {
        bgColor = 'bg-indigo-100';
        textColor = 'text-indigo-800';
      } else if (category === 'Utilities') {
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
      } else if (category === 'Taxes and Licenses') {
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
      } else {
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
      }
      label = 'High';
    } else {
      // Fallback to confidence-based colors if no category
      if (confidence >= 0.75) {
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        label = 'High';
      } else if (confidence >= 0.65) {
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        label = 'Medium';
      }
    }
    
    return (
      <span className={`inline-flex items-center rounded-full ${bgColor} px-2 py-1 text-xs font-medium ${textColor}`}>
        {label} ({(confidence * 100).toFixed(0)}%)
      </span>
    );
  };

  // Handle shift key press
  const toggleSelectMode = () => {
    setIsMultiSelectMode((prev) => {
      if (prev) {
        // Leaving select mode clears selections
        setSelectedReceipts(new Set());
      }
      return !prev;
    });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the card
      if (cardRef.current && !cardRef.current.contains(target)) {
        setActiveMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenu]);

  // Auto-close menu after 5 seconds
  useEffect(() => {
    if (activeMenu) {
      const timer = setTimeout(() => {
        setActiveMenu(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeMenu]);

  useEffect(() => {
    console.log('Current receipts:', receipts); // Debug log
  }, [receipts]);

  const getReceiptId = (receipt: any) => receipt?.receiptId || receipt?.id;

  const handleReceiptClick = (receipt: any) => {
    const id = getReceiptId(receipt);
    if (!id) return;

    if (isMultiSelectMode) {
      const newSelected = new Set(selectedReceipts);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
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
      // Handle bulk delete if multiple receipts selected
      if (selectedReceipts.size > 0) {
        let successCount = 0;
        let failureCount = 0;

        for (const receiptId of selectedReceipts) {
          try {
            await deleteReceipt(receiptId);
            successCount++;
          } catch (error) {
            console.error('Error deleting receipt:', receiptId, error);
            failureCount++;
          }
        }

        await refreshReceipts();
        
        if (failureCount === 0) {
          toast.success(`${successCount} receipt${successCount !== 1 ? 's' : ''} deleted successfully`);
        } else {
          toast.error(`Deleted ${successCount}, failed to delete ${failureCount}`);
        }
        
        setSelectedReceipts(new Set());
        setIsMultiSelectMode(false);
      } else if (selectedReceipt) {
        // Handle single delete
        const id = selectedReceipt?.receiptId || selectedReceipt?.id;
        if (!id) {
          console.error('No receipt selected:', selectedReceipt);
          toast.error('No receipt selected');
          return;
        }

        console.log('Deleting receipt with ID:', id);
        await deleteReceipt(id);
        await refreshReceipts();
        toast.success('Receipt deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast.error('Failed to delete receipt');
    } finally {
      setDeleteModalOpen(false);
      setSelectedReceipt(null);
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
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 pb-3 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Recent Receipts</h3>
          <button
            onClick={toggleSelectMode}
            className={`text-sm font-medium px-3 py-1 rounded-full border transition-colors ${
              isMultiSelectMode
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-purple-200 hover:text-purple-700'
            }`}
          >
            {isMultiSelectMode ? 'Exit Select Mode' : 'Select Mode'}
          </button>
          {isMultiSelectMode && selectedReceipts.size > 0 && (
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
              {selectedReceipts.size} selected
            </span>
          )}
        </div>
        {selectedReceipts.size > 0 && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setDeleteModalOpen(true);
                setActiveMenu(null);
              }}
              className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={16} />
              Delete ({selectedReceipts.size})
            </button>
          </div>
        )}
      </div>

      <div className="h-[400px] overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
        {receipts.map((receipt, index) => (
          <motion.div
            key={getReceiptId(receipt) || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              // Don't handle card click if checkbox or menu was clicked
              const target = e.target as HTMLElement;
              if (target.closest('[role="checkbox"]') || target.closest('button')) {
                return;
              }
              if (isMultiSelectMode) {
                // In multi-select mode, clicking card toggles it
                handleReceiptClick(receipt);
              } else {
                setViewModalOpen(true);
                setSelectedReceipt(receipt);
              }
            }}
            className={`group relative flex items-center justify-between rounded-lg border p-3 sm:p-4 hover:bg-gray-50 cursor-pointer shadow-sm
              ${selectedReceipts.has(receipt.receiptId) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}
              ${selectedReceipts.has(getReceiptId(receipt)) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}
              ${isMultiSelectMode ? 'hover:border-purple-500' : ''}`}
          >
            {isMultiSelectMode && (
              <div className="mr-3 flex-shrink-0">
                <Checkbox
                  checked={selectedReceipts.has(getReceiptId(receipt))}
                  onCheckedChange={() => handleReceiptClick(receipt)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div className="flex items-center gap-3 sm:gap-4">
              {getCategoryIcon(receipt.category)}
              <div>
                <div className="font-medium text-gray-900 text-base sm:text-lg">
                  ${(receipt.total || 0).toFixed(2)}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <div className="text-sm text-gray-500 max-w-[180px] sm:max-w-none truncate">
                    {receipt.merchant && receipt.merchant !== 'Unknown Merchant' 
                      ? receipt.merchant 
                      : (receipt.status === 'pending' || receipt.status === 'ocr_done')
                        ? <div className="flex items-center gap-1"><ReceiptIcon className="h-4 w-4" /> Processing...</div>
                        : 'Unknown Merchant'}
                  </div>
                  
                  {/* Status badges */}
                  {receipt.status === 'pending' && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 animate-pulse">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-1.5 animate-bounce"></span>
                      Processing...
                    </span>
                  )}
                  {receipt.status === 'categorized' && receipt.category && (
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      receipt.category === 'Travel' ? 'bg-cyan-100 text-cyan-800' :
                      receipt.category === 'Meals' ? 'bg-green-100 text-green-800' :
                      receipt.category === 'Supplies' ? 'bg-orange-100 text-orange-800' :
                      receipt.category === 'Car and Truck Expenses' ? 'bg-blue-100 text-blue-800' :
                      receipt.category === 'Advertising' ? 'bg-pink-100 text-pink-800' :
                      receipt.category === 'Office Expenses' ? 'bg-indigo-100 text-indigo-800' :
                      receipt.category === 'Utilities' ? 'bg-yellow-100 text-yellow-800' :
                      receipt.category === 'Taxes and Licenses' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    } opacity-80`}>
                      {receipt.category}
                    </span>
                  )}
                  {receipt.status === 'categorized' && !receipt.category && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 opacity-80">
                      Uncategorized
                    </span>
                  )}
                  
                  {/* OCR Confidence (during ocr_done phase) */}
                  {receipt.ocr_confidence && receipt.status === 'ocr_done' && (
                    getConfidenceBadge(receipt.ocr_confidence)
                  )}
                  
                  {/* Category Confidence (after categorized) */}
                  {receipt.category_confidence && receipt.status === 'categorized' && (
                    getConfidenceBadge(receipt.category_confidence, receipt.category)
                  )}
                  
                  {/* Review chip for low confidence */}
                  {receipt.category_confidence && receipt.category_confidence < 0.75 && receipt.status === 'categorized' && (
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                      ⚠️ Review
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {/* Show receipt date if extracted, otherwise show upload date */}
                  {receipt.receipt_date || receipt.date ? (
                    <div className="font-medium text-gray-600">
                      📅 {new Date(receipt.receipt_date || receipt.date || '').toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric'
                      })}
                    </div>
                  ) : (
                    <div>
                      Uploaded: {new Date(receipt.createdAt || receipt.created_at || '').toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative ml-auto">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === (receipt.id || receipt.receiptId) ? null : (receipt.id || receipt.receiptId));
                }}
                className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>

              <AnimatePresence>
                {activeMenu === (receipt.id || receipt.receiptId) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    style={{ top: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1" role="menu">
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

      {viewModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start lg:items-center justify-center px-0 sm:px-4 py-0 sm:py-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl sm:rounded-2xl shadow-2xl w-full max-w-full lg:max-w-6xl max-h-[100vh] lg:max-h-[90vh] overflow-hidden flex flex-col"
          >
            <button
              onClick={() => {
                setViewModalOpen(false);
                setSelectedReceipt(null);
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 rounded-full z-20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col h-full overflow-y-auto lg:flex-row lg:overflow-hidden">
              {/* Left side - Receipt Image */}
              <div className="w-full lg:w-1/2 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-200">
                <h2 className="text-xl font-semibold mb-4 pb-4 border-b border-gray-300">Receipt Image</h2>
                <div className="flex items-center justify-center p-2 sm:p-4 max-h-[65vh] overflow-hidden lg:max-h-none">
                  {selectedReceipt?.imageUrl || selectedReceipt?.image_url || selectedReceipt?.preview ? (
                    <img
                      src={selectedReceipt?.imageUrl || selectedReceipt?.image_url || selectedReceipt?.preview}
                      alt="Receipt"
                      className="w-full max-w-[520px] h-auto rounded-lg object-contain shadow-2xl hover:shadow-3xl transition-shadow duration-300"
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <ReceiptIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>No receipt image available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Extracted Fields */}
              <div className="w-full lg:w-1/2 p-4 sm:p-6 bg-white lg:overflow-y-auto lg:max-h-full relative z-10 -mt-6 sm:-mt-8 lg:mt-0 rounded-t-3xl lg:rounded-none shadow-lg lg:shadow-none">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {selectedReceipt.status === 'pending' ? 'Processing Receipt...' : 'Details'}
                  </h2>
                  {selectedReceipt.status !== 'pending' && (
                    <div className="flex items-center gap-4">
                      {isEditMode ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setIsEditMode(false);
                              setEditedValues({});
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="h-5 w-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => {
                              // Save corrections and track them
                              Object.entries(editedValues).forEach(([field, value]) => {
                                if (value !== selectedReceipt[field]) {
                                  // Save correction to database
                                  console.log(`Correction: ${field} changed from ${selectedReceipt[field]} to ${value}`);
                                }
                              });
                              setIsEditMode(false);
                              setEditedValues({});
                              toast.success('Changes saved!');
                            }}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="Save"
                          >
                            <Check className="h-5 w-5 text-green-600" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setIsEditMode(true);
                            setEditedValues({
                              merchant: selectedReceipt.merchant,
                              category: selectedReceipt.category,
                              total: selectedReceipt.total,
                              tax: selectedReceipt.tax,
                              receipt_date: selectedReceipt.receipt_date
                            });
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-5 w-5 text-blue-600" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Show extracted fields only if processed */}
                {(selectedReceipt.status === 'ocr_done' || selectedReceipt.status === 'categorized') ? (
                  <div className="space-y-5">
                    {/* Status & Category (Unified) */}
                    {selectedReceipt.status === 'categorized' && selectedReceipt.category ? (
                      <div className={`p-6 rounded-xl border-0 shadow-lg ${
                        selectedReceipt.category === 'Travel' ? 'bg-gradient-to-br from-cyan-500 to-cyan-700' :
                        selectedReceipt.category === 'Meals' ? 'bg-gradient-to-br from-green-500 to-green-700' :
                        selectedReceipt.category === 'Supplies' ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
                        selectedReceipt.category === 'Car and Truck Expenses' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                        selectedReceipt.category === 'Advertising' ? 'bg-gradient-to-br from-pink-500 to-pink-700' :
                        selectedReceipt.category === 'Office Expenses' ? 'bg-gradient-to-br from-indigo-500 to-indigo-700' :
                        selectedReceipt.category === 'Utilities' ? 'bg-gradient-to-br from-yellow-500 to-yellow-700' :
                        selectedReceipt.category === 'Taxes and Licenses' ? 'bg-gradient-to-br from-red-500 to-red-700' :
                        'bg-gradient-to-br from-gray-500 to-gray-700'
                      }`}>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-3 w-3 bg-white rounded-full animate-pulse opacity-70"></div>
                          <span className="text-sm text-white font-semibold tracking-wide">CATEGORIZED</span>
                        </div>
                        <div className="mb-5 flex items-center gap-2">
                          {(() => {
                            const config = categoryIcons[selectedReceipt.category] || categoryIcons['Other'];
                            const Icon = config.icon;
                            return <Icon className="h-6 w-6 text-white" />;
                          })()}
                          <p className="text-2xl font-bold text-white">{selectedReceipt.category}</p>
                        </div>
                        {selectedReceipt.category_confidence && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-white text-opacity-80 font-medium">Confidence</span>
                              <span className="text-sm font-bold text-white">
                                {(selectedReceipt.category_confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className={`w-full rounded-full h-2.5 overflow-hidden ${
                              selectedReceipt.category === 'Meals' ? 'bg-green-500' :
                              selectedReceipt.category === 'Supplies' ? 'bg-orange-500' :
                              selectedReceipt.category === 'Car and Truck Expenses' ? 'bg-blue-500' :
                              selectedReceipt.category === 'Advertising' ? 'bg-pink-500' :
                              selectedReceipt.category === 'Office Expenses' ? 'bg-indigo-500' :
                              selectedReceipt.category === 'Utilities' ? 'bg-yellow-500' :
                              selectedReceipt.category === 'Taxes and Licenses' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`}>
                              <div
                                className={`h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r ${
                                  selectedReceipt.category_confidence >= 0.75 ? 'from-white to-white opacity-100' :
                                  selectedReceipt.category_confidence >= 0.65 ? 'from-white to-white opacity-80' :
                                  'from-white to-white opacity-60'
                                }`}
                                style={{ width: `${selectedReceipt.category_confidence * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : selectedReceipt.status === 'categorized' && !selectedReceipt.category ? (
                      <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-xl border-0 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-3 w-3 bg-white rounded-full animate-pulse opacity-70"></div>
                          <span className="text-sm text-white font-semibold tracking-wide">UNCATEGORIZED</span>
                        </div>
                        <div className="mb-5 flex items-center gap-2">
                          <p className="text-2xl font-bold text-white">Uncategorized</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl border-0 shadow-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-emerald-300 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-100 font-semibold tracking-wide">PROCESSING</span>
                        </div>
                        {selectedReceipt.status === 'ocr_done' && (
                          <p className="text-white font-medium mt-2">✅ OCR Complete</p>
                        )}
                      </div>
                    )}

                    {/* Vendor */}
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Vendor / Merchant</label>
                      <div className="mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={editedValues.merchant || ''}
                            onChange={(e) => setEditedValues({ ...editedValues, merchant: e.target.value })}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg font-semibold"
                            placeholder="Enter vendor name"
                          />
                        ) : (
                          <p className="text-base sm:text-lg font-semibold text-gray-900">{selectedReceipt.merchant || 'Unknown'}</p>
                        )}
                      </div>
                    </div>


                    {/* Subtotal */}
                    {selectedReceipt.subtotal !== null && selectedReceipt.subtotal !== undefined && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600">Subtotal</label>
                        <div className="mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-base sm:text-lg font-semibold text-gray-900">
                            {formatCurrency(selectedReceipt.subtotal || 0)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tax Amount */}
                    {(() => {
                      const taxAmount = typeof selectedReceipt.tax_amount === 'number'
                        ? selectedReceipt.tax_amount
                        : (typeof selectedReceipt.tax === 'number' ? selectedReceipt.tax : null);
                      return taxAmount !== null && taxAmount !== undefined;
                    })() && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600">Tax / VAT</label>
                        <div className="mt-1 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <p className="text-base sm:text-lg font-semibold text-blue-900">{(() => {
                              const taxAmount = typeof selectedReceipt.tax_amount === 'number'
                                ? selectedReceipt.tax_amount
                                : (typeof selectedReceipt.tax === 'number' ? selectedReceipt.tax : 0);
                              return formatCurrency(taxAmount);
                            })()}</p>
                            {selectedReceipt.tax_rate && (
                              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                {(selectedReceipt.tax_rate * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                          {(selectedReceipt.tax_breakdown || selectedReceipt.taxBreakdown)?.length ? (
                            <div className="mt-2 space-y-1">
                              {(selectedReceipt.tax_breakdown || selectedReceipt.taxBreakdown).map((entry: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-sm text-blue-800">
                                  <span>{entry.label || `Tax ${idx + 1}`}{entry.rate ? ` (${(entry.rate * 100).toFixed(1)}%)` : ''}</span>
                                  <span>{formatCurrency(entry.amount || 0)}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {/* Total Amount */}
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Total Amount</label>
                      <div className="mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {isEditMode ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editedValues.total || 0}
                            onChange={(e) => setEditedValues({ ...editedValues, total: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl sm:text-2xl font-bold"
                            placeholder="0.00"
                          />
                        ) : (
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            {formatCurrency(selectedReceipt.total || 0)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Receipt Date */}
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Receipt Date</label>
                      <div className="mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs sm:text-sm text-gray-900">
                          {(selectedReceipt.receipt_date || selectedReceipt.date) ? new Date(selectedReceipt.receipt_date || selectedReceipt.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Not available'}
                        </p>
                      </div>
                    </div>

                    {/* OCR Confidence */}
                    {selectedReceipt.ocr_confidence && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">OCR Confidence</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  selectedReceipt.ocr_confidence >= 0.8 ? 'bg-green-500' :
                                  selectedReceipt.ocr_confidence >= 0.6 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${selectedReceipt.ocr_confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {(selectedReceipt.ocr_confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-6">
                      <div className="relative h-16 w-16 mb-4">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
                        {/* Middle rotating ring (slower) */}
                        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
                        {/* Center dot */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-3 w-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 font-medium text-lg">Processing receipt...</p>
                    <div className="mt-3 flex items-center justify-center gap-1">
                      <span className="text-sm text-gray-400">Extracting information</span>
                      <span className="inline-flex gap-1">
                        <span className="h-1 w-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                        <span className="h-1 w-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="h-1 w-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Timestamp - Always visible */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Uploaded:</span> {new Date(selectedReceipt.created_at || selectedReceipt.createdAt || '').toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogHeader>
                <DialogTitle>Delete Receipt</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {selectedReceipts.size > 0 ? `these ${selectedReceipts.size} receipts` : 'this receipt'}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedReceipt(null);
              }}
              className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
