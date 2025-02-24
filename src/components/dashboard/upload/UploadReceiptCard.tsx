import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader, AlertCircle, Check, X } from 'lucide-react';
import { useReceipts } from '../receipts/ReceiptContext';
import { useAuth } from '../../../auth/CognitoAuthContext';
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
  const [selectedCategory, setSelectedCategory] = useState('Awaiting Categorization');
  const abortControllerRef = useRef<AbortController | null>(null);

  const categories = [
    'Awaiting Categorization',
    'Food & Dining',
    'Travel',
    'Office Expenses',
    'Utilities',
    'Advertising',
    'Car and Truck Expenses',
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
    setSelectedCategory('Awaiting Categorization');
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
      const processedData = await processReceipt(file, currentUser.uid, setUploadProgress);
      
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
      const receiptData = {
        merchant: extractedData.merchantName || 'Unknown Merchant',
        total: extractedData.total || 0,
        date: extractedData.date || new Date().toISOString(),
        items: extractedData.items?.map(item => ({
          name: item.description || '',
          price: item.price || 0
        })) || [],
        imageUrl: extractedData.imageUrl || '',
        status: 'completed' as const,
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
        handleReceipt(acceptedFiles[0]);
      }
    }, []),
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false
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
              {isDragActive ? 'Drop the receipt here' : 'Drag & drop a receipt, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: JPG, PNG, PDF (max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Receipt Preview Section */}
            {previewUrl && (
              <div className="relative mx-auto">
                <img 
                  src={previewUrl} 
                  alt="Receipt preview" 
                  className="w-[350px] h-[525px] object-contain rounded-lg shadow-xl flex-shrink-0 mx-auto bg-gray-50"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
            )}

            {/* Form Section */}
            <div className="space-y-4 max-w-xl mx-auto w-full">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Merchant
                    </label>
                    <input
                      type="text"
                      value={extractedData?.merchantName || ''}
                      onChange={(e) => setExtractedData(prev => prev ? {
                        ...prev,
                        merchantName: e.target.value
                      } : null)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm h-8"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      value={extractedData?.total || 0}
                      onChange={(e) => setExtractedData(prev => prev ? {
                        ...prev,
                        total: parseFloat(e.target.value)
                      } : null)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm h-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      value={extractedData?.date || ''}
                      onChange={(e) => setExtractedData(prev => prev ? {
                        ...prev,
                        date: e.target.value
                      } : null)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm h-8"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="text"
                      value="Awaiting Categorization..."
                      readOnly
                      className="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-sm h-8 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Items</h4>
                  <div className="space-y-1">
                    {extractedData?.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...(extractedData?.items || [])];
                            newItems[index] = { ...item, description: e.target.value };
                            setExtractedData(prev => prev ? { ...prev, items: newItems } : null);
                          }}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm h-8"
                          placeholder="Item description"
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...(extractedData?.items || [])];
                            newItems[index] = { ...item, price: parseFloat(e.target.value) };
                            setExtractedData(prev => prev ? { ...prev, items: newItems } : null);
                          }}
                          className="w-20 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm h-8"
                          placeholder="Price"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tax Information */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Tax Information
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">
                        Total Tax
                      </label>
                      <input
                        type="number"
                        value={extractedData?.tax?.total || 0}
                        onChange={(e) => setExtractedData(prev => prev ? {
                          ...prev,
                          tax: {
                            ...prev.tax,
                            total: parseFloat(e.target.value)
                          }
                        } : null)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm h-8"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">
                        Sales Tax
                      </label>
                      <input
                        type="number"
                        value={extractedData?.tax?.breakdown?.salesTax || 0}
                        onChange={(e) => setExtractedData(prev => prev ? {
                          ...prev,
                          tax: {
                            ...prev.tax,
                            breakdown: {
                              ...prev.tax?.breakdown,
                              salesTax: parseFloat(e.target.value)
                            }
                          }
                        } : null)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm h-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Tax Information Section */}
                {extractedData?.tax && (
                  <div className="space-y-2">
                    <div className="font-medium mt-4">Tax Information</div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Total Tax: ${(extractedData.tax.total || 0).toFixed(2)}</div>
                      {extractedData.tax.breakdown?.salesTax && (
                        <div>Sales Tax: ${extractedData.tax.breakdown.salesTax.toFixed(2)}</div>
                      )}
                      {extractedData.tax.breakdown?.stateTax && (
                        <div>State Tax: ${extractedData.tax.breakdown.stateTax.toFixed(2)}</div>
                      )}
                      {extractedData.tax.breakdown?.localTax && (
                        <div>Local Tax: ${extractedData.tax.breakdown.localTax.toFixed(2)}</div>
                      )}
                      {extractedData.tax.breakdown?.otherTaxes?.map((tax, index) => (
                        <div key={index}>{tax.name}: ${(tax.amount || 0).toFixed(2)}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Receipt Preview Details */}
              <div className="space-y-4">
                {/* Merchant Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Merchant</label>
                  <div className="mt-1 text-sm text-gray-900">{extractedData?.merchantName || 'Unknown Merchant'}</div>
                </div>

                {/* Date */}
                {extractedData?.date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date(extractedData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}

                {/* Total Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <div className="mt-1 text-sm text-gray-900">
                    ${(extractedData?.total || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Buttons */}
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