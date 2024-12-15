import { uploadToS3 } from './s3';
import { analyzeReceiptFromS3 } from './textract';

const BUCKET_NAME = 'snapceit';

interface ProcessedReceipt {
  imageUrl: string;
  dataUrl: string;
  merchantName?: string;
  total?: number;
  date?: string;
  category?: string;  
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
  userId: string;
  createdAt: Date;
}

export const processReceipt = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<ProcessedReceipt> => {
  try {
    // Step 1: Upload image to S3
    const timestamp = Date.now();
    const imageKey = `receipts/${userId}/${timestamp}/image.${file.name.split('.').pop()}`;
    const { url: imageUrl } = await uploadToS3(file, imageKey, onProgress);

    // Step 2: Analyze with Textract
    const extractedData = await analyzeReceiptFromS3(BUCKET_NAME, imageKey);

    // Step 3: Store extracted data in S3
    const dataKey = `receipts/${userId}/${timestamp}/data.json`;
    const dataBlob = new Blob([JSON.stringify(extractedData)], { type: 'application/json' });
    const { url: dataUrl } = await uploadToS3(dataBlob as File, dataKey, onProgress);

    // Step 4: Return combined data with category
    const receiptData: ProcessedReceipt = {
      imageUrl,
      dataUrl,
      merchantName: extractedData.merchantName,
      total: extractedData.total,
      date: extractedData.date,
      category: extractedData.category, 
      items: extractedData.items,
      tax: extractedData.tax,
      userId,
      createdAt: new Date()
    };

    return receiptData;
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
};
