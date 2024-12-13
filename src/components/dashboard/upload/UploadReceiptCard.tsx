import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader, AlertCircle, Check, X } from 'lucide-react';
import { useReceipts } from '../receipts/ReceiptContext';
import { useAuth } from '../../../firebase/AuthContext';
import { processReceipt } from '../../../utils/receipt-processor';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

interface ExtractedData {
  merchantName?: string;
  total?: number;
  date?: string;
  items?: Array<{
    description: string;
    price: number;
  }>;
  imageUrl: string;
  dataUrl: string;  // URL to the JSON data in S3
}

const MAX_FILE_SIZE = 10000000; // 10MB
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf']
};

export function UploadReceiptCard() {
  const { addReceipt } = useReceipts();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Uncategorized');
  const abortControllerRef = useRef<AbortController | null>(null);

  const categories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Travel',
    'Other'
  ];

  // Debug log for auth state
  useEffect(() => {
    console.log('Auth State:', { currentUser });
  }, [currentUser]);

  const cancelUpload = () => {
    // Cancel any ongoing upload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Reset all states
    setIsLoading(false);
    setUploadProgress(0);
    setError(null);
    setIsVerifying(false);
    setSelectedCategory('Uncategorized');
    setExtractedData(null);
    
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleReceipt = async (file: File) => {
    if (!currentUser) {
      toast.error('Please log in to upload receipts');
      return;
    }

    if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
      toast.error('Please upload a valid image (JPG, PNG) or PDF file');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    setError(null);

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      // Process the receipt with our updated utility
      const result = await processReceipt(file, currentUser.uid, setUploadProgress);
      
      // Update state with extracted data
      setExtractedData({
        merchantName: result.merchantName,
        total: result.total,
        date: result.date,
        items: result.items,
        imageUrl: result.imageUrl,
        dataUrl: result.dataUrl
      });
      
      // Set the detected category if available
      if (result.category) {
        setSelectedCategory(result.category);
      }
      
      setIsVerifying(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Receipt processing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process receipt');
      toast.error('Failed to process receipt');
      setIsLoading(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  const confirmAndUpload = async () => {
    if (!extractedData) return;

    try {
      // Add to Firestore through ReceiptContext
      await addReceipt({
        merchant: extractedData.merchantName || '',
        total: extractedData.total || 0,
        date: extractedData.date || new Date().toISOString(),
        items: extractedData.items?.map(item => ({
          name: item.description,
          price: item.price
        })) || [],
        imageUrl: extractedData.imageUrl,
        status: 'completed',
        category: selectedCategory // Use the selected category
      });

      toast.success('Receipt uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload receipt');
      toast.error('Failed to upload receipt');
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
      setExtractedData(null);
      setSelectedCategory('Uncategorized'); // Reset category
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleReceipt(acceptedFiles[0]);
      }
    }, []),
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Upload Receipt</h2>
      
      {!isVerifying ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <Upload className="w-12 h-12 text-gray-400" />
            <p className="text-gray-600">
              {isDragActive ? 'Drop the receipt here' : 'Drag & drop a receipt, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: JPG, PNG, PDF (max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview Section */}
          {previewUrl && (
            <div className="relative w-full max-w-md mx-auto">
              <img 
                src={previewUrl} 
                alt="Receipt preview" 
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Verification Form */}
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant
                </label>
                <input
                  type="text"
                  value={extractedData?.merchantName || ''}
                  onChange={(e) => setExtractedData(prev => prev ? {
                    ...prev,
                    merchantName: e.target.value
                  } : null)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="number"
                  value={extractedData?.total || 0}
                  onChange={(e) => setExtractedData(prev => prev ? {
                    ...prev,
                    total: parseFloat(e.target.value)
                  } : null)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={extractedData?.date ? new Date(extractedData.date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setExtractedData(prev => prev ? {
                    ...prev,
                    date: e.target.value
                  } : null)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {extractedData.items && extractedData.items.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="space-y-2">
                    {extractedData.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input 
                          type="text" 
                          value={item.description} 
                          onChange={(e) => {
                            const newItems = [...extractedData.items!];
                            newItems[index].description = e.target.value;
                            setExtractedData(prev => prev ? {...prev, items: newItems} : null);
                          }}
                          className="flex-1 p-2 border rounded"
                        />
                        <input 
                          type="number" 
                          value={item.price} 
                          onChange={(e) => {
                            const newItems = [...extractedData.items!];
                            newItems[index].price = parseFloat(e.target.value);
                            setExtractedData(prev => prev ? {...prev, items: newItems} : null);
                          }}
                          className="w-24 p-2 border rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={cancelUpload}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              
              <button
                onClick={confirmAndUpload}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Upload</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && !isVerifying && (
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Processing receipt...</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}