const { TextractClient, AnalyzeExpenseCommand } = require("@aws-sdk/client-textract");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { createClient } = require("@supabase/supabase-js");

const textractClient = new TextractClient({ region: process.env.AWS_REGION || "us-east-1" });
const s3Client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });

// Initialize Supabase with service role key (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

// Post-processing: Normalize and validate extracted data
const normalizeAmount = (value) => {
  if (!value) return 0;
  // Remove currency symbols and non-numeric characters, keep decimal point
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100; // Round to 2 decimals
};

const normalizeDate = (value) => {
  if (!value) return new Date().toISOString().split('T')[0];
  
  // Try to parse various date formats
  const dateStr = String(value).trim();
  
  // Already ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // MM/DD/YYYY or M/D/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [month, day, year] = dateStr.split('/');
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  // DD/MM/YYYY (European format - try to detect)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    const first = parseInt(parts[0]);
    const second = parseInt(parts[1]);
    
    // If first > 12, it must be day (DD/MM/YYYY)
    if (first > 12) {
      return `${parts[2]}-${String(second).padStart(2, '0')}-${String(first).padStart(2, '0')}`;
    }
  }
  
  // Try Date constructor
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch (e) {
    // Fall through
  }
  
  // Default to today if parsing fails
  console.warn(`Could not parse date: ${dateStr}, using today's date`);
  return new Date().toISOString().split('T')[0];
};

const normalizeCurrency = (value) => {
  if (!value) return 'USD';
  
  const currencyMap = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR',
    'USD': 'USD',
    'EUR': 'EUR',
    'GBP': 'GBP',
    'JPY': 'JPY',
    'INR': 'INR',
  };
  
  const normalized = String(value).trim().toUpperCase();
  return currencyMap[normalized] || normalized || 'USD';
};

const normalizeVendor = (value) => {
  if (!value) return '';
  
  // Remove extra whitespace and normalize case
  return String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const reconcileTotals = (lineItems, totalAmount) => {
  if (!lineItems || lineItems.length === 0) {
    return { reconciled: true, itemsTotal: 0, difference: 0 };
  }
  
  const itemsTotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const difference = Math.abs(itemsTotal - totalAmount);
  
  // Allow small difference (rounding errors, tax not included in items)
  const reconciled = difference < 0.5;
  
  return { reconciled, itemsTotal, difference };
};

const parseTextractResponse = (response) => {
  const result = {
    vendor_text: '',
    total_amount: 0,
    currency: 'USD',
    receipt_date: new Date().toISOString().split('T')[0],
    line_items: [],
    confidence: 0.8,
  };

  // Process expense fields
  const documents = response.ExpenseDocuments || [];
  if (documents.length === 0) {
    console.warn('No expense documents found in Textract response');
    return result;
  }

  const doc = documents[0];
  let confidenceSum = 0;
  let fieldCount = 0;

  // Extract summary fields
  doc.SummaryFields?.forEach((field) => {
    if (!field.Type?.Text || !field.ValueDetection?.Text) return;

    fieldCount++;
    confidenceSum += field.Confidence || 0.8;

    switch (field.Type.Text) {
      case 'VENDOR_NAME':
      case 'VENDOR':
        result.vendor_text = normalizeVendor(field.ValueDetection.Text);
        break;
      case 'INVOICE_RECEIPT_DATE':
        result.receipt_date = normalizeDate(field.ValueDetection.Text);
        break;
      case 'TOTAL':
        result.total_amount = normalizeAmount(field.ValueDetection.Text);
        break;
      case 'CURRENCY':
        result.currency = normalizeCurrency(field.ValueDetection.Text);
        break;
    }
  });

  // Extract line items
  doc.LineItemGroups?.forEach((group) => {
    group.LineItems?.forEach((item) => {
      const lineItem = {
        description: '',
        qty: 1,
        unit_price: 0,
        total: 0,
      };

      item.LineItemExpenseFields?.forEach((field) => {
        if (!field.Type?.Text || !field.ValueDetection?.Text) return;

        switch (field.Type.Text) {
          case 'ITEM':
            lineItem.description = String(field.ValueDetection.Text).trim();
            break;
          case 'QUANTITY':
            lineItem.qty = parseFloat(field.ValueDetection.Text) || 1;
            break;
          case 'UNIT_PRICE':
            lineItem.unit_price = normalizeAmount(field.ValueDetection.Text);
            break;
          case 'PRICE':
            lineItem.total = normalizeAmount(field.ValueDetection.Text);
            break;
        }
      });

      if (lineItem.description && lineItem.total) {
        result.line_items.push(lineItem);
      }
    });
  });

  // Calculate average confidence
  result.confidence = fieldCount > 0 ? confidenceSum / fieldCount : 0.8;

  // Post-processing: Reconcile totals
  const reconciliation = reconcileTotals(result.line_items, result.total_amount);
  result.reconciliation = reconciliation;

  console.log('Post-processing results:', {
    vendor: result.vendor_text,
    date: result.receipt_date,
    currency: result.currency,
    total: result.total_amount,
    itemsCount: result.line_items.length,
    reconciliation,
  });

  return result;
};

const handler = async (event) => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));

    let receiptId, userId, filePath;

    // Handle Supabase webhook format
    if (event.type === 'INSERT' && event.record) {
      const record = event.record;
      filePath = record.name; // e.g., "receipts/userId/receiptId"
      const pathParts = filePath.split('/');
      
      if (pathParts.length < 3) {
        throw new Error(`Invalid Supabase storage path: ${filePath}`);
      }
      
      userId = pathParts[1];
      receiptId = pathParts[2].split('.')[0]; // Remove file extension
      
      console.log(`Supabase webhook: Processing receipt ${receiptId} for user ${userId}`);
    } 
    // Handle S3 event format (for backward compatibility)
    else if (event.Records?.[0]?.s3) {
      const record = event.Records[0];
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

      console.log(`S3 event: Processing receipt from ${bucket}/${key}`);

      // Extract receipt ID and user ID from S3 key
      // Expected format: receipts/userId/timestamp/filename
      const keyParts = key.split('/');
      if (keyParts.length < 3) {
        throw new Error(`Invalid S3 key format: ${key}`);
      }

      userId = keyParts[1];
      const filename = keyParts[keyParts.length - 1];
      receiptId = filename.split('.')[0];
      filePath = key;
    } 
    else {
      throw new Error('Unknown event format');
    }

    console.log(`User: ${userId}, Receipt: ${receiptId}`);

    let imageBytes;

    // Get image from Supabase Storage or AWS S3
    if (event.type === 'INSERT' && event.record) {
      // Download from Supabase Storage using signed URL
      console.log('Downloading from Supabase Storage...');
      const { data, error } = await supabase.storage
        .from('receipts')
        .download(filePath);
      
      if (error) {
        throw new Error(`Failed to download from Supabase Storage: ${error.message}`);
      }
      
      imageBytes = await data.arrayBuffer();
      imageBytes = Buffer.from(imageBytes);
    } else {
      // Download from AWS S3
      console.log('Downloading from AWS S3...');
      const getObjectResponse = await s3Client.send(
        new GetObjectCommand({ Bucket: 'snapceit-receipts-dev', Key: filePath })
      );

      imageBytes = await streamToBuffer(getObjectResponse.Body);
    }

    // Call Textract
    console.log('Calling Textract...');
    const textractResponse = await textractClient.send(
      new AnalyzeExpenseCommand({
        Document: {
          Bytes: imageBytes,
        },
      })
    );

    // Parse Textract response
    const ocrData = parseTextractResponse(textractResponse);
    console.log('OCR Data:', JSON.stringify(ocrData, null, 2));

    // Update receipt in Supabase
    console.log('Updating receipt in Supabase...');
    const { error: updateError } = await supabase
      .from('receipts')
      .update({
        vendor_text: ocrData.vendor_text,
        total_amount: ocrData.total_amount,
        currency: ocrData.currency,
        receipt_date: ocrData.receipt_date,
        ocr_json: {
          raw_textract: textractResponse,
          parsed: ocrData,
        },
        ocr_confidence: ocrData.confidence,
        status: 'ocr_done',
        updated_at: new Date().toISOString(),
      })
      .eq('id', receiptId)
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Failed to update receipt: ${updateError.message}`);
    }

    // Insert line items
    if (ocrData.line_items.length > 0) {
      console.log(`Inserting ${ocrData.line_items.length} line items...`);
      const { error: itemsError } = await supabase
        .from('line_items')
        .insert(
          ocrData.line_items.map((item) => ({
            receipt_id: receiptId,
            description: item.description,
            qty: item.qty,
            unit_price: item.unit_price,
            total: item.total,
          }))
        );

      if (itemsError) {
        console.warn(`Failed to insert line items: ${itemsError.message}`);
      }
    }

    console.log('Receipt processed successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Receipt processed successfully',
        receiptId,
        ocrData,
      }),
    };
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
};

module.exports = { handler };
