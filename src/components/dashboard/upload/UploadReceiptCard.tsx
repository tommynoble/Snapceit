import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Loader, AlertCircle, Check, X } from 'lucide-react';
import { useReceipts } from '../receipts/ReceiptContext';
import { useAuth } from '../../../auth/SupabaseAuthContext';
import { processReceipt } from '../../../utils/receipt-processor';
import toast from 'react-hot-toast';
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
    breakdown?: {
      salesTax?: number;
      stateTax?: number;
      localTax?: number;
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



  const [manualMerchant, setManualMerchant] = useState('');
  const [manualTotal, setManualTotal] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

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
    setManualMerchant('');
    setManualTotal('');
    setManualDate(new Date().toISOString().split('T')[0]);
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

      // Set the detected category and reset manual fields
      setSelectedCategory(detectedCategory);
      setManualMerchant('');
      setManualTotal('');
      setManualDate(new Date().toISOString().split('T')[0]);
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
        merchant: manualMerchant || extractedData.merchantName || 'Unknown Merchant',
        total: manualTotal ? parseFloat(manualTotal) : (extractedData.total || 0),
        date: manualDate ? new Date(manualDate).toISOString() : (extractedData.date || new Date().toISOString()),
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
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01]">
      <h2 className="text-2xl font-semibold mb-4 pb-4 border-b border-white/10 text-white">Upload Receipt</h2>

      {!isVerifying ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors group
            ${isDragActive ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/20 hover:border-cyan-400/50 hover:bg-white/5'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full transition-colors ${isDragActive ? 'bg-cyan-400/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
              <Upload className={`w-8 h-8 ${isDragActive ? 'text-cyan-400' : 'text-white/70'}`} />
            </div>
            <p className="text-white/90 font-medium text-lg">
              {isDragActive ? 'Drop receipts here' : 'Drag & drop receipts, or click to select'}
            </p>
            <p className="text-sm text-white/50">
              Supported formats: JPG, PNG, PDF (max 10MB) • Upload multiple files at once
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Left Side - Image */}
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            {/* Receipt Preview - Fixed Size */}
            {previewUrl && (
              <div className="relative w-full">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-full h-auto max-h-[400px] object-contain rounded-lg shadow-lg bg-white/5 border border-white/10"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
            )}
          </div>

          {/* Right Side - Info & Buttons */}
          <div className="flex-1 space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Receipt Preview</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Image successfully captured and ready for processing</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Our system will automatically extract vendor, amount, and date</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Receipt will be categorized and stored securely</span>
                </p>
              </div>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
              <p className="text-xs text-cyan-300">
                <span className="font-semibold">💡 Tip:</span> Clear, well-lit receipt images produce better results
              </p>
            </div>

            {/* Buttons - Below Text */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmAndUpload}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg flex items-center justify-center space-x-2 font-medium text-sm transition-all shadow-lg shadow-cyan-500/20"
              >
                <Check className="w-4 h-4" />
                <span>Upload</span>
              </button>

              <button
                onClick={cancelUpload}
                className="flex-1 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg flex items-center justify-center space-x-2 font-medium border border-red-500/20 hover:border-red-500/50 text-sm transition-all"
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
          <div className="flex items-center space-x-2 text-white/80">
            <Loader className="w-5 h-5 animate-spin text-cyan-400" />
            <span>Processing receipt...</span>
          </div>
          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}