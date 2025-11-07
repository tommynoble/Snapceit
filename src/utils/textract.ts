import { TextractClient, AnalyzeExpenseCommand } from "@aws-sdk/client-textract";
import { detectCategory } from './categoryDetection';
import { parseNumber } from './formatters';

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

function extractTaxInformation(blocks: any[], summaryFields: any[] = []) {
  console.log('Starting tax extraction...');
  
  const taxInfo = {
    total: 0,
    breakdown: {
      salesTax: 0,
      stateTax: 0,
      localTax: 0,
      otherTaxes: [] as { name: string; amount: number }[]
    }
  };

  // First check Textract's tax fields
  for (const field of summaryFields) {
    if (field.Type?.Text === 'TAX' && field.ValueDetection?.Text) {
      const amount = parseNumber(field.ValueDetection.Text);
      if (!isNaN(amount)) {
        console.log('Found tax in Textract fields:', amount);
        taxInfo.total = amount;
        taxInfo.breakdown.salesTax = amount; // Default to sales tax
        return taxInfo;
      }
    }
  }

  // Common tax-related keywords and patterns
  const taxKeywords = [
    'tax:', 'tax', 'taxes', 'tx:', 'tx', 'hst', 'gst', 'vat',
    'sales tax', 'state tax', 'local tax', 'service tax', 'excise tax',
    'mwst', 'tva', 'iva' // Add international tax terms
  ];

  // Enhanced tax line patterns including international formats
  const taxPatterns = [
    /(?:tax|tx|gst|hst|vat|mwst|tva|iva)[:\s]+[$€£¥]?\s*([0-9.,]+)/i,
    /[$€£¥]?\s*([0-9.,]+)\s*(?:tax|tx|gst|hst|vat|mwst|tva|iva)/i,
    /total\s+tax[:\s]+[$€£¥]?\s*([0-9.,]+)/i,
    /tax\s+total[:\s]+[$€£¥]?\s*([0-9.,]+)/i,
    /sales\s+tax[:\s]+[$€£¥]?\s*([0-9.,]+)/i,
    /state\s+tax[:\s]+[$€£¥]?\s*([0-9.,]+)/i,
    /mwst\.?\s*([0-9.,]+)/i,  // German VAT
    /tva\.?\s*([0-9.,]+)/i,   // French VAT
    /iva\.?\s*([0-9.,]+)/i    // Italian/Spanish VAT
  ];

  // Sort blocks by vertical position (top to bottom)
  const sortedBlocks = blocks
    .filter(block => block.Text && block.Geometry?.BoundingBox?.Top)
    .sort((a, b) => a.Geometry.BoundingBox.Top - b.Geometry.BoundingBox.Top);

  // Look for tax amounts near tax keywords
  let previousBlock = null;
  for (const block of sortedBlocks) {
    const text = block.Text.toLowerCase();
    console.log('Analyzing block:', text);

    // Check if this block contains a tax keyword
    const isTaxBlock = taxKeywords.some(keyword => text.includes(keyword.toLowerCase()));

    if (isTaxBlock) {
      console.log('Found tax keyword in block:', text);
      
      // Try to find amount in current block
      const amount = extractAmount(text);
      if (amount !== null) {
        console.log('Found tax amount in same block:', amount);
        taxInfo.total = amount;
        taxInfo.breakdown.salesTax = amount;
        return taxInfo;
      }

      // Check next block for amount if current block is just "tax"
      const nextBlock = sortedBlocks[sortedBlocks.indexOf(block) + 1];
      if (nextBlock && text.trim().toLowerCase() === 'tax') {
        const nextAmount = extractAmount(nextBlock.Text);
        if (nextAmount !== null) {
          console.log('Found tax amount in next block:', nextAmount);
          taxInfo.total = nextAmount;
          taxInfo.breakdown.salesTax = nextAmount;
          return taxInfo;
        }
      }
    }

    // Check if this block contains just a number and previous block was tax-related
    if (previousBlock) {
      const prevText = previousBlock.Text.toLowerCase();
      const isTaxRelated = taxKeywords.some(keyword => prevText.includes(keyword.toLowerCase()));
      
      if (isTaxRelated) {
        const amount = extractAmount(text);
        if (amount !== null) {
          console.log('Found tax amount after tax keyword:', amount);
          taxInfo.total = amount;
          taxInfo.breakdown.salesTax = amount;
          return taxInfo;
        }
      }
    }

    previousBlock = block;
  }

  // Helper function to extract amount from text
  function extractAmount(text: string): number | null {
    // Remove any currency symbols and trim
    const cleanText = text.replace(/[^0-9.\s,€£¥]/g, '').trim();
    
    // Try tax patterns first
    for (const pattern of taxPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const amount = parseNumber(match[1].replace(',', '.'));
        if (!isNaN(amount) && amount > 0) return amount;
      }
    }

    // If no pattern match, try to extract any number from the cleaned text
    if (cleanText.length > 0) {
      const amount = parseNumber(cleanText.replace(',', '.'));
      if (!isNaN(amount) && amount > 0) return amount;
    }

    return null;
  }

  console.log('No tax information found');
  return taxInfo;
}

function extractDate(blocks: any[]): string | undefined {
  console.log('Extracting date from blocks');
  
  // Common date patterns
  const datePatterns = [
    /date:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /date:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /date:?\s*([A-Za-z]+\s+\d{1,2})/i
  ];

  // Look for date in each block
  for (const block of blocks) {
    if (block.Text) {
      const text = block.Text.trim();
      console.log('Checking block for date:', text);

      // Try each pattern
      for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          console.log('Found date match:', match[1]);
          try {
            // Try to parse the date
            const parsedDate = new Date(match[1]);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate.toISOString();
            }
          } catch (error) {
            console.log('Error parsing date:', error);
          }
        }
      }
    }
  }

  return undefined;
}

function extractMerchantName(blocks: any[]): string {
  // Sort blocks by size (height * width) to find the largest text
  const sortedBlocks = blocks
    .filter(block => block.Text && block.Geometry)
    .map(block => ({
      text: block.Text,
      size: block.Geometry.BoundingBox.Height * block.Geometry.BoundingBox.Width,
      top: block.Geometry.BoundingBox.Top,
      confidence: block.Confidence
    }))
    .sort((a, b) => b.size - a.size);

  // First, look for blocks near the top of the receipt with high confidence
  const topBlocks = sortedBlocks.filter(block => 
    block.top < 0.3 && // Top 30% of receipt
    block.confidence > 80 && // High confidence
    block.text.length > 2 && // More than 2 characters
    !/^\d+$/.test(block.text) && // Not just numbers
    !/^(total|subtotal|tax|date|time|order|#)/i.test(block.text) // Not common receipt terms
  );

  // If we found any qualifying top blocks, use the largest one
  if (topBlocks.length > 0) {
    return topBlocks[0].text;
  }

  // Fallback to the largest text block that's not a number or common receipt term
  const fallbackBlock = sortedBlocks.find(block => 
    block.text.length > 2 &&
    !/^\d+$/.test(block.text) &&
    !/^(total|subtotal|tax|date|time|order|#)/i.test(block.text)
  );

  return fallbackBlock ? fallbackBlock.text : 'Unknown Merchant';
}

export async function analyzeReceiptFromS3(bucketName: string, objectKey: string) {
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
    console.log('Textract Response:', JSON.stringify(response, null, 2));

    let merchantName = '';
    let total = 0;
    let subtotal = 0;
    let items: Array<{ description: string; price: number; quantity?: number }> = [];
    let allText = '';
    let summaryFields: any[] = [];

    // Process expense fields
    response.ExpenseDocuments?.forEach(doc => {
      summaryFields = doc.SummaryFields || [];
      
      doc.SummaryFields?.forEach(field => {
        if (field.Type?.Text === 'VENDOR') {
          merchantName = field.ValueDetection?.Text || '';
        }
        if (field.Type?.Text === 'TOTAL') {
          const totalText = field.ValueDetection?.Text || '0';
          total = parseNumber(totalText);
        }
        if (field.Type?.Text === 'SUBTOTAL') {
          const subtotalText = field.ValueDetection?.Text || '0';
          subtotal = parseNumber(subtotalText);
        }
      });

      // Extract line items
      doc.LineItemGroups?.forEach(group => {
        group.LineItems?.forEach(lineItem => {
          const item: { description: string; price: number; quantity?: number } = {
            description: '',
            price: 0
          };

          lineItem.LineItemExpenseFields?.forEach(field => {
            if (field.Type?.Text === 'ITEM') {
              item.description = field.ValueDetection?.Text || '';
              allText += ' ' + item.description;
            }
            if (field.Type?.Text === 'PRICE') {
              const priceText = field.ValueDetection?.Text || '0';
              item.price = parseNumber(priceText);
            }
            if (field.Type?.Text === 'QUANTITY') {
              const quantityText = field.ValueDetection?.Text || '0';
              item.quantity = parseNumber(quantityText);
            }
          });

          if (item.description || item.price) {
            items.push(item);
          }
        });
      });
    });

    // If no merchant name found from expense fields, try extracting from blocks
    if (!merchantName) {
      const blocks = response.ExpenseDocuments?.[0]?.Blocks || [];
      merchantName = extractMerchantName(blocks);
    }

    // Extract tax information and date
    const blocks = response.ExpenseDocuments?.[0]?.Blocks || [];
    blocks.forEach(block => {
      if (block.Text) {
        allText += ' ' + block.Text;
      }
    });
    
    // Pass both blocks and summary fields for better tax detection
    const taxInfo = extractTaxInformation(blocks, summaryFields);
    const date = extractDate(blocks);

    // Detect category based on all collected text
    const category = detectCategory(allText);

    // Calculate tax if not found but we have total and subtotal
    if (taxInfo.total === 0 && total > 0 && subtotal > 0) {
      const calculatedTax = parseFloat((total - subtotal).toFixed(2));
      if (calculatedTax > 0) {
        taxInfo.total = calculatedTax;
        taxInfo.breakdown.salesTax = calculatedTax;
        console.log('Calculated tax from total and subtotal:', calculatedTax);
      }
    }

    return {
      merchantName,
      total,
      subtotal,
      tax: taxInfo,
      items,
      date,
      category
    };

  } catch (error) {
    console.error('Error analyzing receipt with Textract:', error);
    throw error;
  }
}

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
