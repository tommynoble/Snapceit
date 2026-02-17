import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { X, Building2, DollarSign, Tag, Upload, Pencil, CheckCircle2 } from 'lucide-react';
import { useReceipts } from './ReceiptContext';

interface EditReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: {
    id: string;
    date: string;
    merchant: string;
    total: number;
    category: string;
    imageUrl?: string;
    image_url?: string;
    preview?: string;
    tax?: number | { total: number };
    items?: Array<{
      name: string;
      price: number;
    }>;
    taxDeductible?: boolean;
    taxCategory?: 'advertising' | 'car_and_truck' | 'office' | 'taxes_and_licenses' | 'supplies' | 'travel_and_meals';
    category_confidence?: number;
    created_at?: string;
  };
  onSave: (formData: any) => void;
  readOnly?: boolean;
}

export function EditReceiptModal({ isOpen, onClose, receipt, onSave, readOnly = false }: EditReceiptModalProps) {
  const { correctReceipt } = useReceipts();

  const formatDateForInput = (date: string) => {
    return date ? date.split('T')[0] : new Date().toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    date: formatDateForInput(receipt.date),
    merchant: receipt.merchant,
    total: receipt.total,
    category: receipt.category,
    tax: typeof receipt.tax === 'number' ? receipt.tax : (receipt.tax?.total || 0),
    items: receipt.items || [],
    imageUrl: receipt.imageUrl || receipt.image_url || receipt.preview || '',
    taxDeductible: receipt.taxDeductible || false,
    taxCategory: receipt.taxCategory || ''
  });

  const [previewImage, setPreviewImage] = useState<string>(receipt.imageUrl || receipt.image_url || receipt.preview || '');
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  useEffect(() => {
    setFormData({
      date: formatDateForInput(receipt.date),
      merchant: receipt.merchant,
      total: receipt.total,
      category: receipt.category,
      tax: typeof receipt.tax === 'number' ? receipt.tax : (receipt.tax?.total || 0),
      items: receipt.items || [],
      imageUrl: receipt.imageUrl || receipt.image_url || receipt.preview || '',
      taxDeductible: receipt.taxDeductible || false,
      taxCategory: receipt.taxCategory || ''
    });
    setPreviewImage(receipt.imageUrl || receipt.image_url || receipt.preview || '');
  }, [receipt, isOpen]);

  useEffect(() => {
    setFormData({
      date: formatDateForInput(receipt.date),
      merchant: receipt.merchant,
      total: receipt.total,
      category: receipt.category,
      tax: typeof receipt.tax === 'number' ? receipt.tax : (receipt.tax?.total || 0),
      items: receipt.items || [],
      imageUrl: receipt.imageUrl || receipt.image_url || receipt.preview || '',
      taxDeductible: receipt.taxDeductible || false,
      taxCategory: receipt.taxCategory || ''
    });
    setPreviewImage(receipt.imageUrl || receipt.image_url || receipt.preview || '');
  }, [receipt, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'total' || name === 'tax' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    // If category changed, call correctReceipt
    if (value !== receipt.category && value !== '') {
      // Map category name to ID (simulated mapping)
      const categoryMap: { [key: string]: number } = {
        'Advertising': 1,
        'Car and Truck Expenses': 2,
        'Office Expenses': 3,
        'Travel': 4,
        'Meals': 5,
        'Utilities': 6,
        'Taxes and Licenses': 7,
        'Supplies': 8,
        'Other': 9,
      };

      const categoryId = categoryMap[value];
      if (categoryId && receipt.id) {
        correctReceipt(receipt.id, categoryId, 'User override from edit modal');
      }
    }

    setFormData(prev => ({ ...prev, category: value }));
    setIsEditingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  const confidence = receipt.category_confidence ? Math.round(receipt.category_confidence * 100) : 75;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative mx-auto my-2 sm:my-8 w-full max-w-6xl p-2 sm:p-4"
      >
        <div className="relative rounded-2xl bg-[#F8F9FE] shadow-2xl overflow-hidden flex flex-col lg:flex-row h-full lg:h-[800px]">

          {/* Left side - Image section */}
          <div className="w-full lg:w-1/2 p-6 bg-gray-50 border-r border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Receipt Image</h3>
            <div
              className="relative h-[400px] lg:h-[calc(100%-3rem)] rounded-xl border-2 border-gray-200 bg-white overflow-hidden shadow-inner"
            >
              {previewImage ? (
                <div className="relative h-full w-full flex items-center justify-center bg-gray-100">
                  <img
                    src={previewImage}
                    alt="Receipt"
                    className="max-h-full max-w-full object-contain p-4"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="text-center text-gray-400">
                    <Upload className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No receipt image</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Form fields */}
          <div className="w-full lg:w-1/2 flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Details</h2>
                {!readOnly && <Pencil size={16} className="text-gray-400" />}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Category Card */}
              <div className="relative group">
                <div
                  className={`rounded-xl p-5 text-white transition-colors cursor-pointer relative overflow-hidden ${formData.category === 'Supplies' ? 'bg-[#EA580C]' : // Orange like screenshot
                    formData.category === 'Meals' ? 'bg-[#10B981]' :
                      formData.category === 'Travel' ? 'bg-[#3B82F6]' :
                        'bg-[#6366F1]' // Default Indigo
                    }`}
                  onClick={() => !readOnly && setIsEditingCategory(true)}
                >
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/50"></div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/90">Categorized</span>
                    </div>
                    {!readOnly && <Pencil size={14} className="text-white/60 group-hover:text-white transition-colors" />}
                  </div>

                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <Tag className="h-6 w-6 text-white" />
                    <h3 className="text-2xl font-bold">{formData.category || 'Uncategorized'}</h3>
                  </div>

                  <div className="space-y-1 relative z-10">
                    <div className="flex justify-between text-xs text-white/80">
                      <span>Confidence</span>
                      <span>{confidence}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Decorative faint icon */}
                  <Tag className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
                </div>

                {/* Edit Category Overlay */}
                {isEditingCategory && (
                  <div className="absolute inset-0 bg-white rounded-xl p-4 shadow-lg border border-gray-100 z-20 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-sm font-medium text-gray-700 mb-2">Select Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleCategoryChange}
                      onBlur={() => setIsEditingCategory(false)}
                      autoFocus
                      className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="">Select a category</option>
                      <option value="Advertising">Advertising</option>
                      <option value="Car and Truck Expenses">Car and Truck Expenses</option>
                      <option value="Office Expenses">Office Expenses</option>
                      <option value="Travel">Travel</option>
                      <option value="Meals">Meals</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Taxes and Licenses">Taxes and Licenses</option>
                      <option value="Supplies">Supplies</option>
                      <option value="Other">Other</option>
                    </select>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setIsEditingCategory(false); }}
                      className="mt-2 text-xs text-gray-500 hover:text-gray-700 self-end"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="merchant" className="block text-sm font-medium text-gray-500 mb-1">
                    Vendor / Merchant
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="merchant"
                      name="merchant"
                      value={formData.merchant}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="block w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 focus:bg-white transition-all font-medium"
                      placeholder="Enter merchant name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="total" className="block text-sm font-medium text-gray-500 mb-1">
                    Total Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      id="total"
                      name="total"
                      value={formData.total}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="block w-full rounded-lg border-gray-200 bg-gray-50 pl-10 p-3 text-xl font-bold text-gray-900 focus:border-purple-500 focus:ring-purple-500 focus:bg-white transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-500 mb-1">
                    Receipt Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="block w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Information Accordion */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" />
                    Tax Information
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.taxDeductible}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          taxDeductible: e.target.checked,
                          taxCategory: e.target.checked ? prev.taxCategory : ''
                        }));
                      }}
                      disabled={readOnly}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    <span className="ml-2 text-sm font-medium text-gray-600">Deductible</span>
                  </label>
                </div>

                {formData.taxDeductible ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-purple-50 rounded-lg p-4 border border-purple-100"
                  >
                    <div className="flex items-center gap-2 mb-3 text-purple-700">
                      <CheckCircle2 size={16} />
                      <span className="text-sm font-medium">Eligible for Tax Deduction</span>
                    </div>

                    <label className="block text-xs font-medium text-purple-700/60 mb-1">
                      IRS Schedule C Category
                    </label>
                    <select
                      className="w-full rounded-md border-purple-200 bg-white p-2 text-sm focus:border-purple-500 focus:ring-purple-500 text-gray-700"
                      value={formData.taxCategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxCategory: e.target.value }))}
                      disabled={readOnly}
                    >
                      <option value="">Select a category</option>
                      <option value="advertising">Advertising</option>
                      <option value="car_and_truck">Car and Truck</option>
                      <option value="office">Office Expenses</option>
                      <option value="supplies">Supplies</option>
                      <option value="travel_and_meals">Travel/Meals</option>
                      <option value="taxes_and_licenses">Taxes/Licenses</option>
                    </select>

                    <p className="mt-3 text-xs text-purple-600">
                      <span className="font-semibold">Estimated Savings:</span> ${(formData.total * 0.25).toFixed(2)} (at 25% tax rate)
                    </p>
                  </motion.div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-500 italic">
                    Mark as deductible to track for Schedule C reports.
                  </div>
                )}
              </div>

            </form>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                Uploaded: {receipt.created_at ? new Date(receipt.created_at).toLocaleString() : 'Just now'}
              </div>

              {!readOnly && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-lg shadow-lg shadow-gray-200 transition-all transform hover:scale-[1.02]"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}