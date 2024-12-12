import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader, AlertCircle } from 'lucide-react';
import { useReceipts } from '../receipts/ReceiptContext';
import { useAuth } from '../../../firebase/AuthContext';
import { uploadToS3 } from '../../../utils/s3';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

interface ProcessedReceipt {
  date: string;
  total: number;
  merchant: string;
  items: Array<{ name: string; price: number }>;
  category: string;
  status: 'processing' | 'completed' | 'error';
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
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debug log for auth state
  useEffect(() => {
    console.log('Auth State:', { currentUser });
  }, [currentUser]);

  const validateReceiptData = (data: Partial<ProcessedReceipt>): data is ProcessedReceipt => {
    return !!(
      data.date &&
      typeof data.total === 'number' &&
      data.merchant &&
      Array.isArray(data.items) &&
      data.category &&
      data.status
    );
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setUploadProgress(0);
      setError(null);
      toast.error('Upload cancelled');
    }
  };

  const processReceipt = async (file: File) => {
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

    // Create new AbortController for this upload
    abortControllerRef.current = new AbortController();

    try {
      // Compress image if it's an image file
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await compressImage(file);
      }

      // Upload to S3 with progress tracking
      const s3Url = await uploadToS3(processedFile, currentUser.uid, (progress) => {
        setUploadProgress(progress);
      });

      let receiptData;
      
      try {
        // Send S3 URL to backend for Textract processing
        const response = await fetch('http://localhost:3000/api/scan-receipt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          },
          body: JSON.stringify({ 
            imageUrl: s3Url,
            userId: currentUser.uid 
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error(`Failed to process receipt: ${response.statusText}`);
        }

        receiptData = await response.json();
      } catch (error) {
        console.warn('Backend processing failed, storing receipt without extracted data:', error);
        // If backend fails, store basic receipt info
        receiptData = {
          date: new Date().toISOString(),
          total: 0,
          merchant: 'Receipt Uploaded',
          items: [],
          status: 'processing' as const
        };
      }
      
      // Validate and format receipt data
      const formattedReceipt = {
        date: receiptData.date || new Date().toISOString(),
        total: Number(receiptData.total) || 0,
        merchant: receiptData.merchant || 'Receipt Uploaded',
        items: Array.isArray(receiptData.items) ? receiptData.items : [],
        category: 'Uncategorized',
        status: 'completed' as const,
        imageUrl: s3Url,
        uploadedAt: new Date().toISOString(),
        userId: currentUser.uid,
      };

      // Add to Firestore through context
      await addReceipt(formattedReceipt);

      toast.success('Receipt uploaded successfully');
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return; // Upload was cancelled, don't show error
        }
        setError(error.message);
        console.error('Error processing receipt:', error);
        toast.error(error.message);
      }
      
      // Attempt to add failed receipt to Firestore for retry
      try {
        await addReceipt({
          userId: currentUser.uid,
          imageUrl: '',
          date: new Date().toISOString(),
          total: 0,
          merchant: 'Processing Failed',
          items: [],
          category: 'Uncategorized',
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
          uploadedAt: new Date().toISOString(),
        });
      } catch (firebaseError) {
        console.error('Failed to save error state:', firebaseError);
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
      abortControllerRef.current = null;
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = () => resolve(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        processReceipt(acceptedFiles[0]);
      }
    }, []),
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: isLoading
  });

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = Object.keys(ACCEPTED_FILE_TYPES).join(',');
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Receipt</h3>
      
      <div className="space-y-4">
        <button
          onClick={handleCameraCapture}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader className="animate-spin" size={20} /> : <Camera size={20} />}
          {isLoading ? `Processing (${uploadProgress}%)` : 'Capture Receipt'}
        </button>

        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed ${
            isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
          } p-6 rounded-lg text-center cursor-pointer transition-colors duration-200`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            <div className="rounded-full bg-purple-100 p-3">
              {isLoading ? (
                <Loader className="h-6 w-6 text-purple-600 animate-spin" />
              ) : error ? (
                <AlertCircle className="h-6 w-6 text-red-600" />
              ) : (
                <Upload className="h-6 w-6 text-purple-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {isLoading ? (
                <span>Processing receipt... {uploadProgress}%
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelUpload();
                    }}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    Cancel
                  </button>
                </span>
              ) : error ? (
                <span className="text-red-600">{error}</span>
              ) : (
                'Drag and drop your receipt here, or click to browse'
              )}
            </p>
            {!isLoading && !error && (
              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, PDF (max 10MB)
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}