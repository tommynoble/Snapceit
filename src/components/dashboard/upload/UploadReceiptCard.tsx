import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader, AlertCircle, Check, X } from 'lucide-react';
import { useReceipts } from '../receipts/ReceiptContext';
import { useAuth } from '../../../auth/SupabaseAuthContext';
import { processReceipt } from '../../../utils/receipt-processor';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { detectCategory } from '../../../utils/categoryDetection';

interface ExtractedData {
  merchantName?: string;
  total?: number;
  date?: string;
  items?: Array<{
    description: string;
    price: number;
  }>;
  tax?: {
    total: number;
    breakdown: {
      salesTax: number;
      stateTax: number;
      localTax: number;
      otherTaxes?: Array<{
        name: string;
        amount: number;
      }>;
    };
  };
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
  const { addReceipt, refreshReceipts } = useReceipts();
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
    'Advertising',
    'Car and Truck Expenses',
    'Office Expenses',
    'Travel',
    'Meals',
    'Utilities',
    'Taxes and Licenses',
    'Supplies'
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
    setError(null);
    
    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Process receipt with Textract
      const processedData = await processReceipt(file, currentUser.id, setUploadProgress);
      
      // Detect category using enhanced detection
      const detectedCategory = detectCategory(
        processedData.rawTextractData || '', // Full text
        processedData.merchantName || '',     // Merchant name
        processedData.items || []            // Line items
      );

      setExtractedData({
        ...processedData,
        merchantName: processedData.merchantName || 'Unknown Merchant',
        total: processedData.total || 0,
        date: processedData.date || new Date().toISOString(),
        items: processedData.items || [],
        imageUrl: processedData.imageUrl || '',
        dataUrl: processedData.dataUrl || ''
      });

      // Set the detected category
      setSelectedCategory(detectedCategory);
      setIsVerifying(true);
      
    } catch (error) {
      console.error('Error processing receipt:', error);
      setError(error instanceof Error ? error.message : 'Failed to process receipt');
      toast.error('Failed to process receipt');
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAndUpload = async () => {
    if (!extractedData || !currentUser) return;

    try {
      // Create receipt data object
      // Status flow: pending → ocr_done (Lambda processes) → categorized (Batch job)
      const receiptData = {
        merchant: extractedData.merchantName || 'Unknown Merchant',
        total: extractedData.total || 0,
        date: extractedData.date || new Date().toISOString(),
        items: extractedData.items?.map(item => ({
          name: item.description || '',
          price: item.price || 0
        })) || [],
        imageUrl: extractedData.imageUrl || '',
        status: 'pending' as const, // Will be updated to ocr_done by Lambda, then categorized by batch job
        category: selectedCategory,
        tax: extractedData.tax?.total ? {
          total: extractedData.tax.total,
          breakdown: {
            salesTax: extractedData.tax.breakdown?.salesTax || 0,
            stateTax: extractedData.tax.breakdown?.stateTax || 0,
            localTax: extractedData.tax.breakdown?.localTax || 0,
            otherTaxes: extractedData.tax.breakdown?.otherTaxes || []
          }
        } : undefined,
        rawTextractData: extractedData.dataUrl ? { url: extractedData.dataUrl } : undefined
      };

      // Add receipt through context
      await addReceipt(receiptData);
      
      // Show success message
      toast.success('Receipt uploaded successfully!');
      
      // Reset form
      cancelUpload();
      
      // Refresh receipts list
      refreshReceipts();
      
    } catch (error) {
      console.error('Error saving receipt:', error);
      toast.error('Failed to save receipt. Please try again.');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        // Process multiple files sequentially
        acceptedFiles.forEach((file, index) => {
          setTimeout(() => {
            handleReceipt(file);
          }, index * 500); // Stagger uploads by 500ms
        });
      }
    }, []),
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01]">
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
              {isDragActive ? 'Drop receipts here' : 'Drag & drop receipts, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: JPG, PNG, PDF (max 10MB) • Upload multiple files at once
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-8 items-start justify-between">
          {/* Left Side - Image */}
          <div className="flex flex-col items-center">
            {/* Receipt Preview - Fixed Size */}
            {previewUrl && (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Receipt preview" 
                  className="w-64 h-96 object-contain rounded-lg shadow-lg bg-gray-50"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
            )}
          </div>

          {/* Right Side - Info & Buttons */}
          <div className="flex-1 space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Receipt Preview</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Image successfully captured and ready for processing</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Our system will automatically extract vendor, amount, and date</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Receipt will be categorized and stored securely</span>
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">💡 Tip:</span> Clear, well-lit receipt images produce better results
              </p>
            </div>

            {/* Buttons - Below Text */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmAndUpload}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center justify-center space-x-2 font-medium text-sm"
              >
                <Check className="w-4 h-4" />
                <span>Upload</span>
              </button>
              
              <button
                onClick={cancelUpload}
                className="flex-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center space-x-2 font-medium border border-red-200 text-sm"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
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