import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Building2, DollarSign, Tag, Receipt } from 'lucide-react';

interface EditReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: {
    id: string;
    date: string;
    merchant: string;
    total: number;
    category: string;
    preview?: string;
    tax?: {
      total: number;
    };
    items?: Array<{
      name: string;
      price: number;
    }>;
  };
  onSave: (formData: any) => void;
}

export function EditReceiptModal({ isOpen, onClose, receipt, onSave }: EditReceiptModalProps) {
  const formatDateForInput = (date: string) => {
    return date.split('T')[0];
  };

  const [formData, setFormData] = useState({
    date: formatDateForInput(receipt.date),
    merchant: receipt.merchant,
    total: receipt.total,
    category: receipt.category,
    tax: receipt.tax?.total || 0,
    items: receipt.items || []
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b bg-gray-50/80 p-5">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Receipt className="text-purple-600" size={20} />
            Edit Receipt Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {receipt.preview && (
            <div className="mb-5 relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              <img 
                src={receipt.preview} 
                alt="Receipt preview" 
                className="w-full h-48 object-contain rounded-lg bg-gray-50 border shadow-sm transition-transform group-hover:scale-[1.02]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <Calendar size={16} className="text-purple-600" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="block w-full text-base rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-shadow hover:border-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <Building2 size={16} className="text-purple-600" />
                Merchant
              </label>
              <input
                type="text"
                name="merchant"
                value={formData.merchant}
                onChange={handleChange}
                className="block w-full text-base rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-shadow hover:border-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <DollarSign size={16} className="text-purple-600" />
                Total
              </label>
              <input
                type="number"
                name="total"
                value={formData.total}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="block w-full text-base rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-shadow hover:border-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <DollarSign size={16} className="text-purple-600" />
                Tax
              </label>
              <input
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="block w-full text-base rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-shadow hover:border-gray-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-base font-medium text-gray-700">
              <Tag size={16} className="text-purple-600" />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="block w-full text-base rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-shadow hover:border-gray-400"
            >
              <option value="Advertising">Advertising</option>
              <option value="Car and Truck Expenses">Car and Truck Expenses</option>
              <option value="Office Expenses">Office Expenses</option>
              <option value="Travel">Travel</option>
              <option value="Meals">Meals</option>
              <option value="Utilities">Utilities</option>
              <option value="Taxes and Licenses">Taxes and Licenses</option>
              <option value="Supplies">Supplies</option>
            </select>
          </div>

          {formData.items.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <Receipt size={16} className="text-purple-600" />
                Items
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border bg-gray-50/50 p-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-center bg-white p-2 rounded-md shadow-sm">
                    <input
                      type="text"
                      value={item.name}
                      className="flex-1 text-base rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      placeholder="Item name"
                      readOnly
                    />
                    <input
                      type="number"
                      value={item.price}
                      className="w-28 text-base rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      step="0.01"
                      min="0"
                      readOnly
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-base font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}