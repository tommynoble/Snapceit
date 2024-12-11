import React, { useState, useCallback } from 'react';
import { Camera, Upload, X, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReceipts } from './ReceiptContext';

interface UploadedReceipt {
  preview: string;
  date: string;
  amount: number;
  merchant: string;
  items: any[];
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

      // Create preview URL for the image
      const previewUrl = URL.createObjectURL(file);

      const newReceipt = {
        preview: previewUrl,
        date: receiptData.date || new Date().toLocaleDateString(),
        amount: receiptData.total || 0,
        merchant: receiptData.merchant || 'Unknown Merchant',
        items: receiptData.items || [],
      };

      setUploadedReceipt(newReceipt);

      // Add to receipts list
      addReceipt({
        ...newReceipt,
        category: 'Food & Dining', // You might want to detect this from the merchant name
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
              <img 
                src={uploadedReceipt.preview} 
                alt="Receipt preview" 
                className="w-full rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="text-lg font-semibold">
                  ${uploadedReceipt.amount.toFixed(2)}
                </div>
                <div className="text-sm opacity-90">
                  {uploadedReceipt.merchant}
                </div>
                <div className="text-xs opacity-75">
                  {uploadedReceipt.date}
                </div>
              </div>
              <button
                onClick={() => setUploadedReceipt(null)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
              >
                <X size={16} />
              </button>
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