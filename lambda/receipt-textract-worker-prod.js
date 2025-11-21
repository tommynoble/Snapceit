/**
 * Production-Grade Receipt Textract Worker
 * 
 * Features:
 * - Atomic queue polling with FOR UPDATE SKIP LOCKED (safe concurrency)
 * - Idempotent Textract processing and Supabase updates
 * - Durable OCR JSON storage to S3
 * - Automatic retry with attempt tracking
 * - Dead Letter Queue (DLQ) for failed receipts
 * - Comprehensive error logging and monitoring
 * 
 * Environment Variables:
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (from Secrets Manager)
 * - DATABASE_URL: PostgreSQL connection string (Supabase DB)
 * - ARTIFACT_BUCKET: S3 bucket for storing OCR JSON artifacts
 * - SOURCE_BUCKET: S3 bucket where receipt images are stored
 * - AWS_REGION: AWS region (default: us-east-1)
 * - MAX_ATTEMPTS: Max retry attempts before DLQ (default: 5)
 * 
 * Deployment:
 * 1. Create Lambda function with Node.js 18+ runtime
 * 2. Add IAM policy for S3 (read source, write artifact), Textract, Secrets Manager
 * 3. Set environment variables or use Secrets Manager
 * 4. Create CloudWatch scheduled rule: rate(30 seconds) → trigger this Lambda
 * 5. Optional: Configure SQS DLQ for Lambda itself
 */

const AWS = require('aws-sdk');
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Initialize AWS clients
const s3 = new AWS.S3({ region: process.env.AWS_REGION || 'us-east-1' });
const textract = new AWS.Textract({ region: process.env.AWS_REGION || 'us-east-1' });
const secretsManager = new AWS.SecretsManager({ region: process.env.AWS_REGION || 'us-east-1' });

// Configuration
const ARTIFACT_BUCKET = process.env.ARTIFACT_BUCKET;
const SOURCE_BUCKET = process.env.SOURCE_BUCKET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const MAX_ATTEMPTS = parseInt(process.env.MAX_ATTEMPTS || '5');
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10');
const PROCESSOR_VERSION = 'textract-worker-prod-v1';
const AMOUNT_PATTERN = /[\$€£]?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+[.,]\d{2})\b/;
const AMOUNT_GLOBAL = new RegExp(AMOUNT_PATTERN.source, 'g');
const SUM_TOLERANCE_ABS = 0.05; // absolute cents tolerance when reconciling totals
const SUM_TOLERANCE_REL = 0.01; // 1% relative tolerance when reconciling totals

// Logging helper
const log = {
  info: (msg, data) => console.log(JSON.stringify({ level: 'INFO', msg, ...data })),
  error: (msg, data) => console.error(JSON.stringify({ level: 'ERROR', msg, ...data })),
  warn: (msg, data) => console.warn(JSON.stringify({ level: 'WARN', msg, ...data }))
};

/**
 * Normalize currency strings with optional thousand separators into floats
 */
function parseAmount(raw) {
  if (!raw) return null;
  const numeric = raw.replace(/[^\d.,-]/g, '');
  if (!numeric) return null;

  const decimalMatch = numeric.match(/[.,](\d{2})$/);
  const decimalSep = decimalMatch ? decimalMatch[0][0] : null;
  const thousandSep = decimalSep === '.' ? ',' : decimalSep === ',' ? '.' : '';
  const withoutThousands = thousandSep ? numeric.replace(new RegExp(`\\${thousandSep}`, 'g'), '') : numeric;
  const normalized = decimalSep ? withoutThousands.replace(decimalSep, '.') : withoutThousands;
  const value = parseFloat(normalized);

  return Number.isFinite(value) ? value : null;
}

function extractAmounts(text) {
  const matches = text.match(AMOUNT_GLOBAL) || [];
  return matches
    .map(match => parseAmount(match))
    .filter(val => val !== null);
}

function sumArray(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function reconcileTotals(subtotal, tax, total) {
  if (subtotal !== null && tax !== null) {
    const expectedTotal = subtotal + tax;
    const tolerance = Math.max(SUM_TOLERANCE_ABS, expectedTotal * SUM_TOLERANCE_REL);
    if (total === null || Math.abs(expectedTotal - total) <= tolerance) {
      return { total: expectedTotal, reconciled: true };
    }
  }
  return { total, reconciled: false };
}

/**
 * Get secrets from Secrets Manager (cache in memory for performance)
 */
let secretsCache = null;
async function getSecrets() {
  if (secretsCache) return secretsCache;

  try {
    const data = await secretsManager.getSecretValue({
      SecretId: process.env.SUPABASE_SERVICE_ROLE_KEY_SECRET || 'snapceit/supabase-service-role'
    }).promise();

    secretsCache = JSON.parse(data.SecretString);
    return secretsCache;
  } catch (error) {
    // Fallback to environment variable if Secrets Manager not available
    log.warn('Secrets Manager failed, using env var', { error: error.message });
    return {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
    };
  }
}

/**
 * Fetch and lock a batch of unprocessed receipts (safe concurrent processing)
 */
async function fetchAndLockBatch(pgClient) {
  try {
    const query = `
      SELECT q.id, q.receipt_id, q.s3_key
      FROM public.receipt_queue q
      WHERE q.processed = FALSE
        AND q.attempts < $1
      ORDER BY q.enqueued_at ASC
      LIMIT $2
      FOR UPDATE SKIP LOCKED
    `;

    const result = await pgClient.query(query, [MAX_ATTEMPTS, BATCH_SIZE]);
    
    // Increment attempts for locked rows
    if (result.rows.length > 0) {
      const ids = result.rows.map(r => r.id);
      await pgClient.query(
        'UPDATE public.receipt_queue SET attempts = attempts + 1 WHERE id = ANY($1)',
        [ids]
      );
    }

    return result.rows;
  } catch (error) {
    log.error('Failed to fetch queue batch', { error: error.message });
    throw error;
  }
}

/**
 * Download image from S3 or Supabase Storage
 */
async function downloadImage(bucket, key, supabaseClient) {
  try {
    log.info('Downloading image', { bucket, key });
    
    // Check if key is a Supabase Storage URL
    if (key.includes('supabase.co/storage')) {
      log.info('Detected Supabase Storage URL, downloading via Supabase SDK');
      
      // Extract bucket and path from Supabase Storage URL
      // URL format: https://project.supabase.co/storage/v1/object/public/receipts/...
      const urlMatch = key.match(/\/object\/public\/([^/]+)\/(.*)/);
      if (!urlMatch) {
        throw new Error(`Invalid Supabase Storage URL format: ${key}`);
      }
      
      const storageBucket = urlMatch[1];
      const storagePath = urlMatch[2];
      
      log.info('Downloading from Supabase Storage', { storageBucket, storagePath });
      
      const { data, error } = await supabaseClient
        .storage
        .from(storageBucket)
        .download(storagePath);
      
      if (error) {
        throw new Error(`Supabase Storage download failed: ${error.message}`);
      }
      
      // Convert Blob to Buffer for Textract
      return Buffer.from(await data.arrayBuffer());
    } else {
      // Assume it's an AWS S3 key
      log.info('Downloading from AWS S3');
      const obj = await s3.getObject({ Bucket: bucket, Key: key }).promise();
      return obj.Body;
    }
  } catch (error) {
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

/**
 * Call AWS Textract to extract text from image
 */
async function callTextract(imageBytes) {
  try {
    log.info('Calling Textract', { imageSize: imageBytes.length });

    const params = {
      Document: { Bytes: imageBytes }
    };

    const response = await textract.detectDocumentText(params).promise();
    return response;
  } catch (error) {
    throw new Error(`Textract failed: ${error.message}`);
  }
}

/**
 * Extract vendor from Textract response with cleanup
 */
function extractVendor(textractResponse) {
  try {
    const lines = textractResponse.Blocks
      .filter(b => b.BlockType === 'LINE')
      .map(b => b.Text.trim())
      .filter(b => b.length > 0)
      .slice(0, 5); // First 5 lines likely contain vendor

    let vendor = lines[0] || 'Unknown Vendor';
    
    // Clean up vendor name
    vendor = vendor
      .replace(/SUPERSTORE/gi, '')
      .replace(/SUPERCENTER/gi, '')
      .replace(/STORE/gi, '')
      .replace(/INC\.|LLC\.|CO\./gi, '')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
    
    // Capitalize properly
    vendor = vendor.split(' ')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
    
    return vendor || 'Unknown Vendor';
  } catch (error) {
    log.warn('Failed to extract vendor', { error: error.message });
    return 'Unknown Vendor';
  }
}

/**
 * Extract total amount from Textract response
 */
function extractTotal(textractResponse) {
  try {
    const lines = textractResponse.Blocks
      .filter(b => b.BlockType === 'LINE')
      .map(b => b.Text);

    // Look for "Total" line and get the amount after it
    // Skip "SUBTOTAL" lines - only match "TOTAL"
    let total = null;
    let subtotalHint = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toUpperCase();
      if (line.includes('SUBTOTAL') || line.includes('SUB-TOTAL') || line.includes('SUBTOT')) {
        const subMatch = lines[i].match(AMOUNT_PATTERN);
        if (subMatch) subtotalHint = parseAmount(subMatch[0]);
        continue;
      }

      if ((line.includes('TOTAL') && !line.includes('SUBTOTAL')) || line.includes('TOTAL GERAL')) {
        // Try to find amount on same line
        const match = lines[i].match(AMOUNT_PATTERN);
        if (match) {
          total = parseAmount(match[0]);
          break;
        }
        // Or on next line
        if (i + 1 < lines.length) {
          const nextMatch = lines[i + 1].match(AMOUNT_PATTERN);
          if (nextMatch) {
            total = parseAmount(nextMatch[0]);
            break;
          }
        }
      }
    }

    // Fallback: get the largest amount (likely the total)
    if (!total) {
      const amounts = lines
        .flatMap(line => extractAmounts(line))
        .filter(n => n > 0);
      
      if (amounts.length > 0) {
        // Prefer an amount larger than subtotal hint if present
        if (subtotalHint !== null) {
          const largerThanSub = amounts.filter(a => a > subtotalHint);
          total = largerThanSub.length ? Math.max(...largerThanSub) : Math.max(...amounts);
        } else {
          total = Math.max(...amounts);
        }
      }
    }

    return total;
  } catch (error) {
    log.warn('Failed to extract total', { error: error.message });
    return null;
  }
}

/**
 * Extract date from Textract response and convert to ISO format
 */
function extractDate(textractResponse) {
  try {
    const lines = textractResponse.Blocks
      .filter(b => b.BlockType === 'LINE')
      .map(b => b.Text);

    // Try multiple date formats
    const datePatterns = [
      { pattern: /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/, format: 'DDMMYYYYsep' }, // DD/MM/YYYY
      { pattern: /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})/, format: 'DDMMYY' }, // DD.MM.YY (European)
      { pattern: /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/, format: 'YYYYMMDD' }, // YYYY/MM/DD
    ];

    for (const line of lines) {
      for (const { pattern, format } of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          let year, month, day;
          
          if (format === 'DDMMYYYYsep') {
            day = parseInt(match[1], 10);
            month = parseInt(match[2], 10);
            year = parseInt(match[3], 10);
          } else if (format === 'DDMMYY') {
            day = parseInt(match[1], 10);
            month = parseInt(match[2], 10);
            year = 2000 + parseInt(match[3], 10);
          } else if (format === 'YYYYMMDD') {
            year = parseInt(match[1], 10);
            month = parseInt(match[2], 10);
            day = parseInt(match[3], 10);
          }
          
          // Validate date ranges
          if (month < 1 || month > 12 || day < 1 || day > 31) {
            log.warn('Invalid date extracted', { year, month, day });
            continue; // Skip invalid dates
          }
          
          // Return ISO format: YYYY-MM-DD
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
    }

    return null;
  } catch (error) {
    log.warn('Failed to extract date', { error: error.message });
    return null;
  }
}

/**
 * Extract tax information from Textract response
 */
function extractTax(textractResponse) {
  try {
    const lines = textractResponse.Blocks
      .filter(b => b.BlockType === 'LINE')
      .map(b => b.Text);

    let subtotal = null;
    const taxBreakdown = [];
    let taxRate = null;
    const taxKeywords = ['TAX', 'VAT', 'GST', 'IVA', 'SALES TAX', 'SERVICE CHARGE', 'LEVY', 'SURCHARGE', 'INCLUDED'];

    // Look for tax-related lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toUpperCase();
      
      // Look for subtotal
      if ((line.includes('SUBTOTAL') || line.includes('SUB-TOTAL') || line.includes('SUBTOT')) && !subtotal) {
        const match = lines[i].match(AMOUNT_PATTERN);
        if (match) {
          subtotal = parseAmount(match[0]);
        }
      }
      
      // Look for tax lines (TAX, VAT, GST, SALES TAX, etc.)
      if (taxKeywords.some(k => line.includes(k))) {
        const candidateIndexes = [i, i + 1, i - 1].filter(idx => idx >= 0 && idx < lines.length);
        let amount = null;
        let lineRate = null;

        for (const idx of candidateIndexes) {
          const match = lines[idx].match(AMOUNT_PATTERN);
          if (match) {
            amount = parseAmount(match[0]);
            if (amount !== null) break;
          }
        }

        // Try to extract tax rate if available (e.g., "6%" or "VAT 6%")
        for (const idx of candidateIndexes) {
          const rateMatch = lines[idx].match(/(\d+(?:[.,]\d{1,2})?)\s*%/);
          if (rateMatch) {
            lineRate = parseFloat(rateMatch[1].replace(',', '.')) / 100;
            break;
          }
        }

        if (amount !== null) {
          taxBreakdown.push({ amount, rate: lineRate });
        }
      }
    }

    const tax = taxBreakdown.length ? sumArray(taxBreakdown.map(t => t.amount)) : null;
    const explicitRate = taxBreakdown.find(t => t.rate !== null)?.rate ?? null;
    if (explicitRate !== null) {
      taxRate = explicitRate;
    } else if (tax !== null && subtotal !== null && subtotal > 0) {
      taxRate = tax / subtotal;
    }

    return {
      subtotal,
      tax,
      taxRate
    };
  } catch (error) {
    log.warn('Failed to extract tax', { error: error.message });
    return {
      subtotal: null,
      tax: null,
      taxRate: null
    };
  }
}

/**
 * Compute OCR confidence (simplified)
 */
function computeConfidence(textractResponse) {
  try {
    // Average confidence of all detected text blocks
    const confidences = textractResponse.Blocks
      .filter(b => b.BlockType === 'LINE' && b.Confidence)
      .map(b => b.Confidence / 100);

    if (confidences.length === 0) return 0.85;
    return confidences.reduce((a, b) => a + b, 0) / confidences.length;
  } catch (error) {
    log.warn('Failed to compute confidence', { error: error.message });
    return 0.85;
  }
}

/**
 * Store OCR JSON to S3 (durable artifact)
 */
async function storeOcrArtifact(receiptId, ocrData) {
  try {
    const key = `ocr/${receiptId}.json`;
    const payload = {
      receipt_id: receiptId,
      textract_response: ocrData,
      processed_at: new Date().toISOString(),
      processor_version: PROCESSOR_VERSION
    };

    await s3.putObject({
      Bucket: ARTIFACT_BUCKET,
      Key: key,
      Body: JSON.stringify(payload),
      ContentType: 'application/json'
    }).promise();

    log.info('Stored OCR artifact', { receiptId, key });
    return key;
  } catch (error) {
    throw new Error(`Failed to store OCR artifact: ${error.message}`);
  }
}

/**
 * Process a single receipt
 */
async function processReceipt(pgClient, supabase, queueRow) {
  const { id: queueId, receipt_id: receiptId, s3_key: s3Key } = queueRow;

  try {
    log.info('Processing receipt', { receiptId, queueId, s3Key });

    // 1) Download image
    const imageBytes = await downloadImage(SOURCE_BUCKET, s3Key, supabase);

    // 2) Call Textract
    const textractResponse = await callTextract(imageBytes);

    // 3) Extract normalized fields
    const vendor = extractVendor(textractResponse);
    const extractedTotal = extractTotal(textractResponse);
    const receiptDate = extractDate(textractResponse);
    const taxData = extractTax(textractResponse);
    const reconciled = reconcileTotals(taxData.subtotal, taxData.tax, extractedTotal);
    const total = reconciled.total;
    const ocrConfidence = computeConfidence(textractResponse);

    // 4) Store OCR JSON to S3 (durable artifact)
    const ocrS3Key = await storeOcrArtifact(receiptId, textractResponse);

    // 5) Update Supabase idempotently (only if not already processed)
    // NOTE: We now write into receipts_v2 (new table) and only touch columns that exist there
    const rawOcrData = {
      s3_key: ocrS3Key,
      confidence: ocrConfidence,
      extracted_date: receiptDate,
      reconciled_total: reconciled.reconciled ? total : undefined
    };

    const updatePayload = {
      merchant: vendor,
      total: total,
      subtotal: taxData.subtotal,
      tax: taxData.tax,
      tax_rate: taxData.taxRate,
      raw_ocr: rawOcrData,
      status: 'ocr_done',
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('receipts_v2')
      .update(updatePayload)
      .eq('id', receiptId)
      .not('status', 'eq', 'ocr_done'); // Idempotency: do not overwrite if already processed

    if (updateError) throw new Error(`Supabase update failed: ${updateError.message}`);

    // 6) Mark queue item as processed
    await pgClient.query(
      `UPDATE public.receipt_queue 
       SET processed = TRUE, processor = $1, processed_at = NOW(), last_error = NULL
       WHERE id = $2`,
      [PROCESSOR_VERSION, queueId]
    );

    log.info('Successfully processed receipt', {
      receiptId,
      vendor,
      total,
      subtotal: taxData.subtotal,
      tax: taxData.tax,
      taxRate: taxData.taxRate,
      receiptDate,
      ocrConfidence,
      ocrS3Key,
      textractBlocksCount: textractResponse.Blocks?.length || 0,
      message: 'Full Textract response stored in S3 artifact'
    });

    return { success: true, receiptId };

  } catch (error) {
    log.error('Failed to process receipt', {
      receiptId,
      queueId,
      error: error.message,
      stack: error.stack
    });

    // Update queue with error
    try {
      await pgClient.query(
        `UPDATE public.receipt_queue 
         SET last_error = $1
         WHERE id = $2`,
        [error.message, queueId]
      );

      // Move to DLQ if max attempts exceeded
      const result = await pgClient.query(
        'SELECT attempts FROM public.receipt_queue WHERE id = $1',
        [queueId]
      );

      if (result.rows[0] && result.rows[0].attempts >= MAX_ATTEMPTS) {
        log.warn('Moving receipt to DLQ', { receiptId, attempts: result.rows[0].attempts });
        await pgClient.query(
          `SELECT public.move_to_dlq($1, $2)`,
          [queueId, `Max attempts (${MAX_ATTEMPTS}) exceeded`]
        );
      }
    } catch (markError) {
      log.error('Failed to mark error in queue', { error: markError.message });
    }

    return { success: false, receiptId, error: error.message };
  }
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  log.info('Worker invoked', { event });

  let pgClient = new Client({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Allow self-signed certs from Supabase pooler
  });
  let supabase;
  let successCount = 0;
  let failureCount = 0;

  try {
    // Connect to PostgreSQL
    await pgClient.connect();
    log.info('Connected to PostgreSQL');

    // Get secrets and initialize Supabase
    const secrets = await getSecrets();
    supabase = createClient(SUPABASE_URL, secrets.SUPABASE_SERVICE_ROLE_KEY);

    // Fetch batch of unprocessed receipts
    const batch = await fetchAndLockBatch(pgClient);
    log.info('Fetched batch', { count: batch.length });

    if (batch.length === 0) {
      return {
        statusCode: 204,
        body: JSON.stringify({ message: 'No work available' })
      };
    }

    // Process each receipt independently
    for (const row of batch) {
      try {
        const result = await processReceipt(pgClient, supabase, row);
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        log.error('Unexpected error processing row', { error: error.message });
        failureCount++;
      }
    }

    log.info('Batch processing complete', { successCount, failureCount, total: batch.length });

    return {
      statusCode: 200,
      body: JSON.stringify({
        processed: successCount,
        failed: failureCount,
        total: batch.length,
        message: `Processed ${successCount}/${batch.length} receipts`
      })
    };

  } catch (error) {
    log.error('Worker fatal error', { error: error.message, stack: error.stack });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };

  } finally {
    try {
      await pgClient.end();
    } catch (error) {
      log.error('Failed to close PostgreSQL connection', { error: error.message });
    }
  }
};

/**
 * Local testing (run with: node receipt-textract-worker-prod.js)
 */
if (require.main === module) {
  exports.handler({}).then(result => {
    console.log('Result:', result);
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}
