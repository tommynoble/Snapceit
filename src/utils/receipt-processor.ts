import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'receipts';

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
    // Step 1: Upload image to Supabase Storage
    const timestamp = Date.now();
    const imageKey = `${userId}/${timestamp}/image.${file.name.split('.').pop()}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(imageKey, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl: imageUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(imageKey);

    // Step 2: Return minimal data - Textract will process later in batch
    const receiptData: ProcessedReceipt = {
      imageUrl,
      dataUrl: imageUrl,
      merchantName: 'Unknown Merchant', // Will be filled by Textract batch job
      total: 0, // Will be filled by Textract batch job
      date: new Date().toISOString(),
      category: undefined, // Will be filled by Textract batch job
      items: [], // Will be filled by Textract batch job
      tax: undefined, // Will be filled by Textract batch job
      userId,
      createdAt: new Date()
    };

    return receiptData;
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
};
