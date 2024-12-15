import React, { useState, useCallback } from 'react';
import { Camera, Upload, X, Scan, Edit2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReceipts } from './ReceiptContext';
import { Calendar } from 'lucide-react';

interface UploadedReceipt {
  preview: string;
  amount: number;
  merchant: string;
  date: string;
  items: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  tax?: {
    total: number;
    type?: string;
  };
  subtotal?: number;
  category: string;
  paymentMethod?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  phone?: string;
  invoiceNumber?: string;
  isEditing?: boolean;
}

export function ReceiptUploader() {
  const { addReceipt } = useReceipts();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedReceipt, setUploadedReceipt] = useState<UploadedReceipt | null>(null);

  const processReceipt = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Create form data for the file
      const formData = new FormData();
      formData.append('receipt', file);

      // Send to backend for Textract processing
      const response = await fetch('http://localhost:3000/api/scan-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process receipt');
      }

      const receiptData = await response.json();
      console.log('Receipt data:', receiptData);

      // Create preview URL for the image
      const previewUrl = URL.createObjectURL(file);

      const newReceipt = {
        preview: previewUrl,
        amount: receiptData.total || 0,
        merchant: receiptData.merchant || 'Unknown Merchant',
        date: receiptData.date || new Date().toLocaleDateString(),
        items: receiptData.items || [],
        tax: receiptData.tax || undefined,
        subtotal: receiptData.subtotal || undefined,
        category: 'Food & Dining', // Default value
        paymentMethod: receiptData.paymentMethod || undefined,
        address: receiptData.address || undefined,
        phone: receiptData.phone || undefined,
        invoiceNumber: receiptData.invoiceNumber || undefined,
      };

      console.log('New receipt:', newReceipt);
      setUploadedReceipt(newReceipt);

      // Add to receipts list
      addReceipt({
        ...newReceipt,
        status: 'completed',
      });
    } catch (error) {
      console.error('Error processing receipt:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false);
    }
  }, [addReceipt]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      processReceipt(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processReceipt(file);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        processReceipt(file);
      }
    };
    input.click();
  };

  const handleConfirmUpload = () => {
    // Add uploaded receipt to receipts list
    if (uploadedReceipt) {
      addReceipt({
        ...uploadedReceipt,
        status: 'completed',
      });
      setUploadedReceipt(null);
    }
  };

  const handleDownload = (receipt: UploadedReceipt) => {
    const link = document.createElement('a');
    link.href = receipt.preview;
    link.download = `receipt-${receipt.merchant}-${receipt.date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditToggle = () => {
    if (uploadedReceipt) {
      setUploadedReceipt({
        ...uploadedReceipt,
        isEditing: !uploadedReceipt.isEditing
      });
    }
  };

  const handleInputChange = (field: keyof UploadedReceipt, value: any) => {
    if (uploadedReceipt) {
      setUploadedReceipt({
        ...uploadedReceipt,
        [field]: value
      });
    }
  };

  function ReceiptPreview({ receipt }: { receipt: UploadedReceipt }) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <img 
            src={receipt.preview} 
            alt="Receipt preview" 
            className="w-[350px] h-[525px] object-contain mx-auto rounded-lg shadow-xl flex-shrink-0 bg-gray-50" 
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={() => handleDownload(receipt)}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
              title="Download Receipt"
            >
              <Download size={16} className="text-gray-600" />
            </button>
            <button
              onClick={handleEditToggle}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
              title="Edit Receipt Details"
            >
              <Edit2 size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="font-medium">Merchant</div>
          {receipt.isEditing ? (
            <input
              type="text"
              value={receipt.merchant}
              onChange={(e) => handleInputChange('merchant', e.target.value)}
              className="w-full p-2 border rounded"
            />
          ) : (
            <div>{receipt.merchant}</div>
          )}

          {receipt.tax && receipt.tax.total > 0 && (
            <>
              <div className="font-medium mt-4">Tax</div>
              {receipt.isEditing ? (
                <input
                  type="number"
                  value={receipt.tax.total}
                  onChange={(e) => handleInputChange('tax', { 
                    ...receipt.tax, 
                    total: parseFloat(e.target.value) 
                  })}
                  className="w-full p-2 border rounded"
                  step="0.01"
                />
              ) : (
                <div className="text-gray-600">${receipt.tax.total.toFixed(2)}</div>
              )}
            </>
          )}

          <div className="font-medium mt-4">Total Amount</div>
          {receipt.isEditing ? (
            <input
              type="number"
              value={receipt.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
              className="w-full p-2 border rounded"
              step="0.01"
            />
          ) : (
            <div>${receipt.amount.toFixed(2)}</div>
          )}

          <div className="font-medium mt-4">Date</div>
          {receipt.isEditing ? (
            <input
              type="date"
              value={receipt.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full p-2 border rounded"
            />
          ) : (
            <div>{receipt.date}</div>
          )}

          <div className="font-medium mt-4">Category</div>
          <select
            value={receipt.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full p-2 border rounded"
            disabled={!receipt.isEditing}
          >
            <option value="Food & Dining">Food & Dining</option>
            <option value="Shopping">Shopping</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Utilities">Utilities</option>
            <option value="Other">Other</option>
          </select>

          {receipt.isEditing && (
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpload}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleCameraCapture}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
        >
          <Camera size={20} />
          Capture Receipt
        </button>
      </div>

      <div 
        className={`rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors ${
          isDragging ? 'border-purple-500 bg-purple-50' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div className="flex items-center gap-3">
                <Scan className="h-6 w-6 animate-pulse text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Processing receipt...</span>
              </div>
            </motion.div>
          ) : uploadedReceipt ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <ReceiptPreview receipt={uploadedReceipt} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-4 p-8"
            >
              <div className="rounded-full bg-purple-100 p-4">
                <Upload className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  Drag and drop your receipt here, or
                </p>
                <label className="mt-2 cursor-pointer text-sm font-medium text-purple-600 hover:text-purple-500">
                  browse files
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">Supports: JPG, PNG, PDF</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}