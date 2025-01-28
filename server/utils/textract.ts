import { Textract } from 'aws-sdk';
import { AnalyzeDocumentCommandOutput } from '@aws-sdk/client-textract';

interface ExtractedReceiptData {
  merchantName?: string;
  total?: number;
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
  date?: string;
  items?: Array<{
    description: string;
    price: number;
  }>;
}

export function extractMerchantName(blocks: any[]): string {
  // Find blocks that might contain merchant name (usually at the top of receipt)
  const potentialMerchantBlocks = blocks.filter(block => 
    block.BlockType === 'LINE' && 
    block.Page === 1 && 
    block.Geometry.BoundingBox.Top < 0.2 // Look at top 20% of receipt
  );

  if (potentialMerchantBlocks.length > 0) {
    return potentialMerchantBlocks[0].Text;
  }

  return 'Unknown Merchant';
}

export function extractDate(blocks: any[]): string | undefined {
  const dateRegex = /(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})|(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/;
  
  for (const block of blocks) {
    if (block.BlockType === 'LINE') {
      const match = block.Text.match(dateRegex);
      if (match) {
        return match[0];
      }
    }
  }

  return new Date().toISOString().split('T')[0];
}

export function extractTotal(blocks: any[]): number {
  // Look for common total identifiers
  const totalKeywords = ['total', 'amount due', 'amount paid', 'grand total'];
  
  for (const block of blocks) {
    if (block.BlockType === 'LINE') {
      const text = block.Text.toLowerCase();
      if (totalKeywords.some(keyword => text.includes(keyword))) {
        // Extract number from text
        const match = block.Text.match(/\$?\s*(\d+\.?\d*)/);
        if (match) {
          return parseFloat(match[1]);
        }
      }
    }
  }

  return 0;
}

export function extractItems(blocks: any[]): Array<{ description: string; price: number }> {
  const items: Array<{ description: string; price: number }> = [];
  
  // Look for table cells or key-value relationships
  blocks.forEach(block => {
    if (block.BlockType === 'LINE' && block.Confidence > 80) {
      // Look for lines with price patterns
      const match = block.Text.match(/(.*?)\$?\s*(\d+\.?\d*)\s*$/);
      if (match) {
        items.push({
          description: match[1].trim(),
          price: parseFloat(match[2])
        });
      }
    }
  });

  return items;
}

export async function analyzeReceiptFromS3(bucketName: string, objectKey: string): Promise<ExtractedReceiptData> {
  const textract = new Textract({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const params = {
    Document: {
      S3Object: {
        Bucket: bucketName,
        Name: objectKey
      }
    },
    FeatureTypes: ['FORMS', 'TABLES']
  };

  try {
    const result = await textract.analyzeDocument(params).promise();
    const blocks = result.Blocks || [];

    return {
      merchantName: extractMerchantName(blocks),
      total: extractTotal(blocks),
      date: extractDate(blocks),
      items: extractItems(blocks),
      tax: {
        total: 0 // Add tax extraction logic if needed
      }
    };
  } catch (error) {
    console.error('Error analyzing receipt with Textract:', error);
    throw error;
  }
}
