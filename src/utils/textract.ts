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
  date?: string;
  items?: Array<{
    description: string;
    price: number;
  }>;
  category?: string;
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

export const analyzeReceiptFromS3 = async (
  bucketName: string,
  objectKey: string
): Promise<ExtractedReceiptData> => {
  try {
    const command = new AnalyzeExpenseCommand({
      Document: {
        S3Object: {
          Bucket: bucketName,
          Name: objectKey,
        },
      }
    });

    const response = await textractClient.send(command);
    console.log('Textract response:', response);
    
    // Initialize the receipt data
    const receiptData: ExtractedReceiptData = {};

    if (response.ExpenseDocuments && response.ExpenseDocuments.length > 0) {
      const document = response.ExpenseDocuments[0];
      console.log('Processing document:', document);

      // Extract merchant name - first try VENDOR field
      const merchantField = document.SummaryFields?.find(
        field => field.Type?.Text === 'VENDOR'
      );

      if (merchantField?.ValueDetection?.Text) {
        receiptData.merchantName = merchantField.ValueDetection.Text;
      } else {
        // Look for logo-like text (usually at the top with large font)
        const allFields = document.SummaryFields || [];
        const potentialMerchants = allFields
          .filter(field => 
            field.ValueDetection?.Text && 
            field.ValueDetection.Confidence && 
            field.ValueDetection.Confidence > 85 && // High confidence
            field.ValueDetection.Text.length > 2 && // More than 2 characters
            field.ValueDetection.Text.length < 30 && // Not too long (to avoid addresses)
            !/^\d/.test(field.ValueDetection.Text) && // Doesn't start with a number
            !/^[A-Z0-9\s]{10,}$/.test(field.ValueDetection.Text) && // Not all caps long text (likely address)
            !/street|road|ave|avenue|suite|st\.|rd\./i.test(field.ValueDetection.Text) && // Not address-like
            field.ValueDetection.Geometry?.BoundingBox?.Top < 0.3 // In the top 30% of receipt
          )
          .sort((a, b) => {
            // Prioritize by position (top to bottom) and text size
            const aBox = a.ValueDetection?.Geometry?.BoundingBox;
            const bBox = b.ValueDetection?.Geometry?.BoundingBox;
            if (!aBox || !bBox) return 0;
            
            // Calculate text size (height * width)
            const aSize = aBox.Height * aBox.Width;
            const bSize = bBox.Height * bBox.Width;
            
            // Combine position and size for scoring
            const aScore = (1 - aBox.Top) * 0.7 + aSize * 0.3;
            const bScore = (1 - bBox.Top) * 0.7 + bSize * 0.3;
            
            return bScore - aScore;
          });

        console.log('Potential merchant names:', potentialMerchants.map(m => m.ValueDetection?.Text));
        
        if (potentialMerchants.length > 0) {
          receiptData.merchantName = potentialMerchants[0].ValueDetection?.Text || '';
        }
      }

      console.log('Found merchant name:', receiptData.merchantName);

      // Extract total amount
      const totalField = document.SummaryFields?.find(
        field => field.Type?.Text === 'TOTAL'
      );
      console.log('Found total field:', totalField);
      if (totalField?.ValueDetection?.Text) {
        receiptData.total = parseFloat(totalField.ValueDetection.Text.replace(/[^0-9.]/g, ''));
        console.log('Extracted total:', receiptData.total);
      }

      // Extract date
      const dateField = document.SummaryFields?.find(
        field => field.Type?.Text === 'INVOICE_RECEIPT_DATE'
      );
      console.log('Found date field:', dateField);
      if (dateField?.ValueDetection?.Text) {
        receiptData.date = dateField.ValueDetection.Text;
        console.log('Extracted date:', receiptData.date);
      }

      // Extract line items
      if (document.LineItemGroups && document.LineItemGroups.length > 0) {
        receiptData.items = document.LineItemGroups[0].LineItems?.map(item => {
          const description = item.LineItemExpenseFields?.find(
            field => field.Type?.Text === 'ITEM'
          )?.ValueDetection?.Text || '';
          console.log('Found item description:', description);
          
          const priceStr = item.LineItemExpenseFields?.find(
            field => field.Type?.Text === 'PRICE'
          )?.ValueDetection?.Text || '0';
          console.log('Found item price:', priceStr);

          return {
            description,
            price: parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
          };
        }) || [];
        console.log('Extracted items:', receiptData.items);
      }

      // After extracting items and merchant name, detect category
      const detectedCategory = detectCategory(
        receiptData.merchantName || '',
        receiptData.items || []
      );
      console.log('Detected category:', detectedCategory);
      
      // Add category to receipt data
      receiptData.category = detectedCategory;
    }

    return receiptData;
  } catch (error) {
    console.error('Error analyzing receipt with Textract:', error);
    throw error;
  }
};
