import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Building2, DollarSign, Tag, Receipt, Upload, Camera, Percent } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

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
    preview?: string;
    tax?: {
      total: number;
    };
    items?: Array<{
      name: string;
      price: number;
    }>;
    taxDeductible?: boolean;
    taxCategory?: 'advertising' | 'car_and_truck' | 'office' | 'taxes_and_licenses' | 'supplies' | 'travel_and_meals';
  };
  onSave: (formData: any) => void;
  readOnly?: boolean;
}

export function EditReceiptModal({ isOpen, onClose, receipt, onSave, readOnly = false }: EditReceiptModalProps) {
  const formatDateForInput = (date: string) => {
    return date.split('T')[0];
  };

  const [formData, setFormData] = useState({
    date: formatDateForInput(receipt.date),
    merchant: receipt.merchant,
    total: receipt.total,
    category: receipt.category,
    tax: receipt.tax?.total || 0,
    items: receipt.items || [],
    imageUrl: receipt.imageUrl || receipt.preview || '',
    taxDeductible: receipt.taxDeductible || false,
    taxCategory: receipt.taxCategory || ''
  });

  const [previewImage, setPreviewImage] = useState<string>(receipt.imageUrl || receipt.preview || '');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreviewImage(dataUrl);
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic']
    },
    disabled: readOnly,
    maxFiles: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total' || name === 'tax' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative mx-auto my-2 sm:my-8 w-full max-w-6xl p-2 sm:p-4"
      >
        <div className="relative rounded-xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-gray-50/80 p-3 sm:p-5">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Receipt className="text-purple-600" size={20} />
              {readOnly ? 'View Receipt Details' : 'Edit Receipt Details'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-200"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row p-3 sm:p-6 gap-4 sm:gap-6">
            {/* Left side - Image section */}
            <div className="w-full lg:w-1/3 flex-shrink-0">
              <div
                {...getRootProps()}
                className={`relative h-[300px] lg:h-full min-h-[300px] rounded-lg border-2 ${
                  isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50'
                } ${!readOnly && 'cursor-pointer hover:border-purple-500 hover:bg-purple-50'}`}
              >
                {!readOnly && <input {...getInputProps()} />}
                
                {previewImage ? (
                  <div className="relative h-full">
                    <img
                      src={previewImage}
                      alt="Receipt"
                      className="h-full w-full rounded-lg object-contain p-2"
                    />
                    {!readOnly && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <div className="text-center text-white p-2">
                          <Camera className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm">Click or drag to replace image</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    {!readOnly ? (
                      <div className="text-center text-gray-500">
                        <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                        <p className="text-xs sm:text-sm">Click or drag image here</p>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <Receipt className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                        <p className="text-xs sm:text-sm">No receipt image available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Form fields */}
            <div className="flex-1 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="merchant" className="block text-sm font-medium text-gray-700">
                    Merchant
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="merchant"
                      name="merchant"
                      value={formData.merchant}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="total" className="block text-sm font-medium text-gray-700">
                    Total Amount
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      id="total"
                      name="total"
                      value={formData.total}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Items</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto rounded-md border border-gray-200 p-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <span className="text-sm text-gray-600">{item.name}</span>
                      <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax Deductible Section */}
              <div className="space-y-4 mt-6 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Percent className="h-5 w-5 text-purple-500" />
                    <h3 className="text-lg font-medium text-black">Tax Deduction</h3>
                    <label className="relative flex items-center cursor-pointer">
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
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      <span className="ms-3 text-sm font-medium text-white">Mark as Deductible</span>
                    </label>
                  </div>
                </div>
                
                {/* Potential Deduction Note */}
                {!formData.taxDeductible && (
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-sm text-black">
                      Based on the amount (${formData.total.toFixed(2)}) and category ({formData.category}), 
                      this expense might be tax deductible. Mark it as deductible to track it for tax season.
                    </p>
                  </div>
                )}

                {formData.taxDeductible ? (
                  <div className="mt-4 space-y-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-black">
                        <span className="font-medium text-green-400">Tax Savings</span>
                        <br />
                        At a 25% tax rate, this deduction could save you up to ${(formData.total * 0.25).toFixed(2)} in taxes.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">
                        Deduction Category
                      </label>
                      <select
                        className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-purple-500"
                        value={formData.taxCategory}
                        onChange={(e) => setFormData(prev => ({ ...prev, taxCategory: e.target.value }))}
                        disabled={readOnly}
                      >
                        <option value="">Select a category</option>
                        <option value="advertising">Advertising</option>
                        <option value="car_and_truck">Car and Truck Expenses</option>
                        <option value="office">Office Expenses</option>
                        <option value="taxes_and_licenses">Taxes and Licenses</option>
                        <option value="supplies">Supplies</option>
                        <option value="travel_and_meals">Travel and Meals</option>
                      </select>
                    </div>
                  </div>
                ) : null}
              </div>

              {!readOnly && (
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}