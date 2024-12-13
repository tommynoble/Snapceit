import { TextractClient, AnalyzeExpenseCommand } from "@aws-sdk/client-textract";

const textractClient = new TextractClient({
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

interface ExtractedReceiptData {
  merchantName?: string;
  total?: number;
  tax?: number;
  rawData?: any;
}

// Category detection keywords
const CATEGORY_KEYWORDS = {
  'Food & Dining': [
    // Restaurants and food places
    'restaurant', 'cafe', 'diner', 'bistro', 'grill', 'pizzeria', 'sushi', 
    'mcdonalds', 'burger king', 'wendys', 'subway', 'starbucks', 'dunkin',
    'kitchen', 'bakery', 'deli', 'food', 'dining', 'takeout', 'delivery',
    // Grocery stores
    'grocery', 'supermarket', 'market', 'foods', 'trader joes', 'whole foods',
    'safeway', 'kroger', 'costco', 'walmart', 'target'
  ],
  'Shopping': [
    'mall', 'store', 'retail', 'outlet', 'boutique', 'shop', 'mart',
    'amazon', 'ebay', 'walmart', 'target', 'best buy', 'clothing',
    'fashion', 'apparel', 'shoes', 'electronics', 'hardware'
  ],
  'Transportation': [
    'uber', 'lyft', 'taxi', 'cab', 'transport', 'transit', 'metro', 'subway',
    'bus', 'train', 'railway', 'gas', 'fuel', 'parking', 'garage',
    'shell', 'exxon', 'mobil', 'chevron', 'bp'
  ],
  'Entertainment': [
    'cinema', 'theater', 'theatre', 'movie', 'concert', 'show', 'ticket',
    'netflix', 'spotify', 'hulu', 'disney+', 'amazon prime',
    'game', 'playstation', 'xbox', 'nintendo', 'entertainment'
  ],
  'Healthcare': [
    'pharmacy', 'drug', 'medical', 'health', 'clinic', 'hospital', 'doctor',
    'dental', 'dentist', 'cvs', 'walgreens', 'rite aid', 'medicine',
    'prescription', 'healthcare', 'vitamin', 'wellness'
  ],
  'Utilities': [
    'utility', 'electric', 'water', 'gas', 'power', 'energy', 'internet',
    'phone', 'mobile', 'cable', 'broadband', 'att', 'verizon', 'comcast',
    'sprint', 't-mobile'
  ],
  'Travel': [
    'hotel', 'motel', 'inn', 'resort', 'airbnb', 'booking', 'expedia',
    'airline', 'airways', 'flight', 'travel', 'vacation', 'trip',
    'delta', 'united', 'american airlines', 'southwest'
  ]
};

function detectCategory(merchantName: string, items: Array<{ description: string }> = []): string {
  // Convert merchant name to lowercase for comparison
  const merchantLower = merchantName.toLowerCase();
  
  // Combine all item descriptions into a single string
  const itemsText = items.map(item => item.description.toLowerCase()).join(' ');
  
  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    // Check if any keyword matches the merchant name
    const merchantMatch = keywords.some(keyword => 
      merchantLower.includes(keyword.toLowerCase())
    );
    
    // Check if any keyword matches in the items
    const itemsMatch = keywords.some(keyword =>
      itemsText.includes(keyword.toLowerCase())
    );
    
    if (merchantMatch || itemsMatch) {
      console.log(`Detected category ${category} based on:`, {
        merchantMatch,
        itemsMatch,
        merchant: merchantName,
        matchedItems: items.filter(item => 
          keywords.some(keyword => 
            item.description.toLowerCase().includes(keyword.toLowerCase())
          )
        )
      });
      return category;
    }
  }
  
  return 'Other';
}

function extractTaxInformation(blocks: any[]): {
  total?: number;
  breakdown?: {
    salesTax?: number;
    stateTax?: number;
    localTax?: number;
    otherTaxes?: Array<{ name: string; amount: number }>;
  };
} {
  const taxKeywords = [
    { key: 'sales tax', type: 'salesTax' },
    { key: 'state tax', type: 'stateTax' },
    { key: 'local tax', type: 'localTax' },
    { key: 'tax', type: 'salesTax' }, // fallback
    { key: 'vat', type: 'salesTax' },
    { key: 'gst', type: 'salesTax' },
  ];

  const result: any = {
    breakdown: {}
  };

  let totalTax = 0;

  blocks.forEach((block) => {
    if (block.BlockType === 'LINE') {
      const text = block.Text?.toLowerCase() || '';
      
      // Look for tax-related lines
      taxKeywords.forEach(({ key, type }) => {
        if (text.includes(key)) {
          // Try to extract the amount using regex
          const amountMatch = text.match(/\$?\s*(\d+\.?\d*)/);
          if (amountMatch) {
            const amount = parseFloat(amountMatch[1]);
            if (!isNaN(amount)) {
              result.breakdown[type] = (result.breakdown[type] || 0) + amount;
              totalTax += amount;
            }
          }
        }
      });

      // Look for other potential tax items
      if (text.includes('tax') && !taxKeywords.some(k => text.includes(k.key))) {
        const amountMatch = text.match(/\$?\s*(\d+\.?\d*)/);
        if (amountMatch) {
          const amount = parseFloat(amountMatch[1]);
          if (!isNaN(amount)) {
            if (!result.breakdown.otherTaxes) {
              result.breakdown.otherTaxes = [];
            }
            result.breakdown.otherTaxes.push({
              name: text.replace(/\$?\s*\d+\.?\d*/, '').trim(),
              amount
            });
            totalTax += amount;
          }
        }
      }
    }
  });

  result.total = totalTax;
  return result;
}

export const analyzeReceiptFromS3 = async (
  bucketName: string,
  objectKey: string
): Promise<{
  merchantName: string;
  total: number;
  subtotal?: number;
  tax?: {
    total: number;
    type?: string;
  };
  items?: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  date?: string;
  paymentMethod?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  phone?: string;
  invoiceNumber?: string;
}> => {
  try {
    const command = new AnalyzeExpenseCommand({
      Document: {
        S3Object: {
          Bucket: bucketName,
          Name: objectKey,
        },
      },
    });

    const response = await textractClient.send(command);
    const document = response.ExpenseDocuments?.[0];
    
    if (!document) {
      throw new Error('No document found in Textract response');
    }

    const result: any = {
      merchantName: '',
      total: 0,
    };

    // Extract fields from SummaryFields
    document.SummaryFields?.forEach((field) => {
      const type = field.Type?.Text;
      const value = field.ValueDetection?.Text;

      switch (type) {
        case 'VENDOR_NAME':
          result.merchantName = value || '';
          break;
        case 'TOTAL':
          result.total = parseFloat(value?.replace(/[^0-9.]/g, '') || '0') || 0;
          break;
        case 'SUBTOTAL':
          result.subtotal = parseFloat(value?.replace(/[^0-9.]/g, '') || '0') || 0;
          break;
        case 'TAX':
          result.tax = {
            total: parseFloat(value?.replace(/[^0-9.]/g, '') || '0') || 0,
            type: field.LabelDetection?.Text || undefined,
          };
          break;
        case 'INVOICE_RECEIPT_DATE':
          result.date = value;
          break;
        case 'PAYMENT_TERMS':
          result.paymentMethod = value;
          break;
        case 'INVOICE_RECEIPT_ID':
          result.invoiceNumber = value;
          break;
        case 'VENDOR_ADDRESS':
          result.address = parseAddress(value || '');
          break;
        case 'VENDOR_PHONE':
          result.phone = value;
          break;
      }
    });

    // Extract line items
    if (document.LineItemGroups && document.LineItemGroups.length > 0) {
      result.items = document.LineItemGroups[0].LineItems?.map(item => {
        const itemFields = item.LineItemExpenseFields || [];
        return {
          name: itemFields.find(f => f.Type?.Text === 'ITEM')?.ValueDetection?.Text || '',
          price: parseFloat(itemFields.find(f => f.Type?.Text === 'PRICE')?.ValueDetection?.Text?.replace(/[^0-9.]/g, '') || '0') || 0,
          quantity: parseFloat(itemFields.find(f => f.Type?.Text === 'QUANTITY')?.ValueDetection?.Text || '0') || undefined,
        };
      }) || [];
    }

    return result;
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    throw error;
  }
};

function parseAddress(address: string) {
  // Basic address parsing - could be made more sophisticated
  const parts = address.split(',').map(part => part.trim());
  if (parts.length >= 2) {
    const stateZip = parts[parts.length - 1].split(' ');
    return {
      street: parts[0],
      city: parts[parts.length - 2],
      state: stateZip[0],
      zip: stateZip[1],
    };
  }
  return {
    street: address,
  };
}
