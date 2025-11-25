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
      .map(b => b.Text);

    // Look for vendor name in first 5 lines
    for (const line of lines.slice(0, 5)) {
      if (line.length < 2) continue; // Need at least 2 chars
      
      const letters = (line.match(/[A-Z]/gi) || []).length;
      const digits = (line.match(/\d/g) || []).length;
      const letterRatio = letters / line.length;
      
      // Skip if mostly numbers/special chars
      if (letterRatio < 0.5) continue;
      
      // Skip common non-vendor lines
      if (/^(RECEIPT|INVOICE|BILL|STATEMENT|QUOTE|ORDER|REGULAR|SALE|TRANSACTION|PURCHASE|THANK YOU)$/i.test(line)) {
        continue;
      }
      
      // This is the vendor!
      let vendor = line;
      let rawText = line;
      
      // Calculate confidence based on line characteristics
      let confidence = 0.7; // Base confidence
      
      // Higher confidence if line is short (typical vendor names are short)
      if (line.length < 30) confidence += 0.15;
      
      // Higher confidence if it has mixed case (typical for brand names)
      if (/[a-z]/.test(line) && /[A-Z]/.test(line)) confidence += 0.1;
      
      // Lower confidence if it has many special characters
      const specialChars = (line.match(/[^A-Za-z0-9\s&]/g) || []).length;
      if (specialChars > 3) confidence -= 0.15;
      
      // Cap confidence at 1.0
      confidence = Math.min(confidence, 1.0);
      
      // Clean up vendor name - be careful not to remove important parts
      vendor = vendor
        .replace(/SUPERSTORE/gi, '')
        .replace(/SUPERCENTER/gi, '')
        .replace(/\bSTORE\b/gi, '') // Only remove standalone "STORE", not part of name
        .replace(/INC\.|LLC\.|CO\./gi, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();
      
      // Capitalize properly
      vendor = vendor.split(' ')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
      
      return {
        vendor: vendor || 'Unknown Vendor',
        confidence: confidence,
        rawText: rawText
      };
    }
    
    // Fallback if no vendor found in first 5 lines
    return {
      vendor: 'Unknown Vendor',
      confidence: 0.3,
      rawText: ''
    };
  } catch (error) {
    log.warn('Failed to extract vendor', { error: error.message });
    return {
      vendor: 'Unknown Vendor',
      confidence: 0.0,
      rawText: ''
    };
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

    // Fallback: find total by looking at amounts near the end of receipt
    if (!total) {
      const amountsWithIndex = [];
      
      for (let i = 0; i < lines.length; i++) {
        const amounts = extractAmounts(lines[i]);
        for (const amt of amounts) {
          if (amt > 0) {
            amountsWithIndex.push({ amount: amt, lineIndex: i });
          }
        }
      }
      
      if (amountsWithIndex.length > 0) {
        // Prefer amounts from the last 20% of the receipt (where totals usually are)
        const lastLineIndex = lines.length - 1;
        const recentThreshold = Math.max(0, lastLineIndex - Math.ceil(lines.length * 0.2));
        
        const recentAmounts = amountsWithIndex.filter(a => a.lineIndex >= recentThreshold);
        
        if (recentAmounts.length > 0) {
          // Among recent amounts, prefer one that's reasonable (not too small, not absurdly large)
          const candidates = recentAmounts
            .map(a => a.amount)
            .sort((a, b) => b - a); // Sort descending
          
          // If we have a subtotal hint, prefer amounts close to it or slightly larger
          if (subtotalHint !== null) {
            const reasonableAmounts = candidates.filter(a => a >= subtotalHint * 0.8 && a <= subtotalHint * 1.5);
            total = reasonableAmounts.length > 0 ? reasonableAmounts[0] : candidates[0];
          } else {
            total = candidates[0];
          }
        } else {
          // Fall back to largest amount if nothing near end
          total = Math.max(...amountsWithIndex.map(a => a.amount));
        }
      }
    }

    // If subtotal and tax exist and total is missing or less than subtotal, reconcile
    const taxData = extractTax(textractResponse);
    const reconciliation = reconcileTotals(taxData.subtotal, taxData.tax, total);
    return reconciliation.total;
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

    const now = new Date();
    const currentYear = now.getFullYear();
    const twoYearsAgo = currentYear - 2;
    const validDates = [];

    // Try multiple date formats
    const datePatterns = [
      { pattern: /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})(?:\s+\d{1,2}:\d{2})?/, format: 'DDMMYYYYsep' }, // DD/MM/YYYY
      { pattern: /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})(?:\s+\d{1,2}:\d{2})?/, format: 'DDMMYY' }, // DD.MM.YY (European)
      { pattern: /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})(?:\s+\d{1,2}:\d{2})?/, format: 'YYYYMMDD' }, // YYYY/MM/DD
      { pattern: /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})(?:\s+\d{1,2}:\d{2})?/, format: 'MMDDYYYY' }, // MM/DD/YYYY (disambiguated below)
      { pattern: /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})(?:\s+\d{1,2}:\d{2})?/, format: 'MMDDYY' }, // MM/DD/YY (disambiguated below)
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
          } else if (format === 'MMDDYYYY') {
            month = parseInt(match[1], 10);
            day = parseInt(match[2], 10);
            year = parseInt(match[3], 10);
          } else if (format === 'MMDDYY') {
            month = parseInt(match[1], 10);
            day = parseInt(match[2], 10);
            year = 2000 + parseInt(match[3], 10);
          }
          
          // Validate date ranges
          if (month < 1 || month > 12 || day < 1 || day > 31) {
            log.warn('Invalid date extracted', { year, month, day });
            continue; // Skip invalid dates
          }
          
          // Reject dates older than 2 years (likely old receipts or OCR errors)
          if (year < twoYearsAgo) {
            log.warn('Date too old, skipping', { year, month, day, twoYearsAgo });
            continue;
          }
          
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          validDates.push({ dateStr, year, month, day });
        }
      }
    }

    // Prefer the most recent valid date
    if (validDates.length > 0) {
      validDates.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        if (a.month !== b.month) return b.month - a.month;
        return b.day - a.day;
      });
      return validDates[0].dateStr;
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
          const matches = lines[idx].match(AMOUNT_GLOBAL) || [];
          if (matches.length > 0) {
            // Prefer the rightmost amount on the line (tax amounts often appear last)
            const picked = matches[matches.length - 1];
            amount = parseAmount(picked);
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
      taxRate,
      taxBreakdown
    };
  } catch (error) {
    log.warn('Failed to extract tax', { error: error.message });
    return {
      subtotal: null,
      tax: null,
      taxRate: null,
      taxBreakdown: []
    };
  }
}

/**
 * Extract line items from Textract response
 * Identifies individual items purchased with their amounts
 */
function extractLineItems(textractResponse) {
  try {
    const lines = textractResponse.Blocks
      .filter(b => b.BlockType === 'LINE')
      .map(b => b.Text.trim())
      .filter(b => b.length > 0);

    const items = [];
    const skipPatterns = [
      /^(ITEM|DESCRIPTION|QTY|QUANTITY|PRICE|AMOUNT|TOTAL|SUBTOTAL|TAX|VAT|GST|THANK YOU|RECEIPT|INVOICE|STORE|WELCOME|HAVE A NICE DAY|PLEASE COME AGAIN)/i,
      /^(CARD|CASH|PAYMENT|METHOD|CHANGE|BALANCE|ACCOUNT|TRANSACTION|REFERENCE|AUTHORIZATION)/i,
      /^\d{4}-\d{4}-\d{4}-\d{4}/, // Credit card numbers
      /^[A-Z0-9]{10,}$/ // Long alphanumeric codes
    ];

    for (const line of lines) {
      // Skip header/footer lines
      if (skipPatterns.some(pattern => pattern.test(line))) {
        continue;
      }

      // Look for lines with amounts (item + price pattern)
      const amountMatch = line.match(AMOUNT_PATTERN);
      if (!amountMatch) {
        continue; // Skip lines without amounts
      }

      const amount = parseAmount(amountMatch[0]);
      if (amount === null || amount <= 0) {
        continue; // Skip invalid amounts
      }

      // Extract description (everything before the amount)
      const description = line.replace(AMOUNT_PATTERN, '').trim();
      
      // Skip if description is too short or looks like metadata
      if (description.length < 2 || /^[0-9\-\s]+$/.test(description)) {
        continue;
      }

      // Avoid duplicates (same description and amount)
      const isDuplicate = items.some(
        item => item.description === description && Math.abs(item.amount - amount) < 0.01
      );
      if (isDuplicate) {
        continue;
      }

      items.push({
        description: description,
        amount: amount
      });
    }

    log.info('Extracted line items', { count: items.length });
    return items.length > 0 ? items : null;
  } catch (error) {
    log.warn('Failed to extract line items', { error: error.message });
    return null;
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
 * Verify vendor name with Claude for low-confidence extractions
 * Only calls Claude if vendor confidence < 0.75
 */
async function verifyVendorWithClaude(vendor, vendorConfidence, lineItems, rawOcrText) {
  try {
    // Skip Claude verification if confidence is already high
    if (vendorConfidence >= 0.75) {
      log.info('Vendor confidence high, skipping Claude verification', { vendor, vendorConfidence });
      return { vendor, confidence: vendorConfidence, verified: false };
    }

    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      log.warn('CLAUDE_API_KEY not set, skipping vendor verification');
      return { vendor, confidence: vendorConfidence, verified: false };
    }

    // Build context for Claude
    const lineItemsText = lineItems && lineItems.length > 0
      ? lineItems.map(item => `- ${item.description}`).join('\n')
      : 'No line items extracted';

    const prompt = `You are a receipt analysis expert. Based on the receipt text and line items below, verify or correct the vendor name.

Extracted vendor name: "${vendor}"
Confidence: ${(vendorConfidence * 100).toFixed(0)}%

Line items:
${lineItemsText}

Receipt text (first 1000 chars):
${rawOcrText.substring(0, 1000)}

Task: 
1. If the vendor name looks correct, respond with: VENDOR: [exact name]
2. If the vendor name is incorrect or unclear, correct it based on context, respond with: VENDOR: [corrected name]
3. Only respond with the vendor line, nothing else.

Examples:
- If you see "Stbaw" with grocery items, respond: VENDOR: Stop & Shop
- If you see "Mrshls" with clothing items, respond: VENDOR: Marshalls
- If the name looks correct, respond: VENDOR: ${vendor}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      log.warn('Claude vendor verification failed', { status: response.status, error });
      return { vendor, confidence: vendorConfidence, verified: false };
    }

    const data = await response.json();
    const claudeResponse = data.content[0].text.trim();
    
    // Parse Claude's response
    const vendorMatch = claudeResponse.match(/VENDOR:\s*(.+?)(?:\n|$)/i);
    if (vendorMatch) {
      const verifiedVendor = vendorMatch[1].trim();
      const changed = verifiedVendor.toLowerCase() !== vendor.toLowerCase();
      
      log.info('Claude vendor verification complete', {
        original: vendor,
        verified: verifiedVendor,
        changed: changed,
        confidence: 0.9
      });

      return {
        vendor: verifiedVendor,
        confidence: 0.9, // High confidence after Claude verification
        verified: true,
        changed: changed
      };
    }

    log.warn('Could not parse Claude vendor response', { response: claudeResponse });
    return { vendor, confidence: vendorConfidence, verified: false };
  } catch (error) {
    log.warn('Claude vendor verification error', { error: error.message });
    return { vendor, confidence: vendorConfidence, verified: false };
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
    const vendorData = extractVendor(textractResponse);
    const vendor = vendorData.vendor;
    const vendorConfidence = vendorData.confidence;
    const extractedTotal = extractTotal(textractResponse);
    const receiptDate = extractDate(textractResponse);
    const taxData = extractTax(textractResponse);
    const reconciled = reconcileTotals(taxData.subtotal, taxData.tax, extractedTotal);
    const total = reconciled.total;
    const ocrConfidence = computeConfidence(textractResponse);

    // 4) Store OCR JSON to S3 (durable artifact)
    const ocrS3Key = await storeOcrArtifact(receiptId, textractResponse);

    // 5) Extract raw OCR text for Claude
    const rawOcrText = textractResponse.Blocks
      .filter(b => b.BlockType === 'LINE')
      .map(b => b.Text)
      .join('\n');

    // 5b) Extract line items for Claude reasoning
    const lineItems = extractLineItems(textractResponse);

    // 5c) Verify vendor with Claude if confidence is low
    let finalVendor = vendor;
    let finalVendorConfidence = vendorConfidence;
    if (vendorConfidence < 0.75) {
      log.info('Vendor confidence low, requesting Claude verification', { vendor, vendorConfidence });
      const verificationResult = await verifyVendorWithClaude(vendor, vendorConfidence, lineItems, rawOcrText);
      finalVendor = verificationResult.vendor;
      finalVendorConfidence = verificationResult.confidence;
      if (verificationResult.verified && verificationResult.changed) {
        log.info('Vendor corrected by Claude', { original: vendor, corrected: finalVendor });
      }
    }

    // 6) Update Supabase idempotently (only if not already processed)
    // NOTE: We now write into receipts_v2 (new table) and only touch columns that exist there
    const rawOcrData = rawOcrText || null;

    const updatePayload = {
      merchant: finalVendor,
      total: total,
      subtotal: taxData.subtotal,
      tax: taxData.tax,
      tax_amount: taxData.tax,
      tax_breakdown: taxData.taxBreakdown && taxData.taxBreakdown.length ? taxData.taxBreakdown : null,
      tax_rate: taxData.taxRate,
      receipt_date: receiptDate || null,
      raw_ocr: rawOcrData,
      line_items_json: lineItems,
      status: 'ocr_done',
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('receipts_v2')
      .update(updatePayload)
      .eq('id', receiptId)
      .not('status', 'eq', 'ocr_done'); // Idempotency: do not overwrite if already processed

    if (updateError) throw new Error(`Supabase update failed: ${updateError.message}`);

    // 7) Trigger categorization via process-receipt edge function
    try {
      log.info('Triggering categorization', { receiptId });
      const categoryResponse = await fetch(
        `${process.env.SUPABASE_URL}/functions/v1/process-receipt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ receipt_id: receiptId })
        }
      );

      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        log.info('Categorization triggered successfully', {
          receiptId,
          category: categoryData.category,
          category_source: categoryData.category_source,
          confidence: categoryData.confidence
        });
      } else {
        const errorText = await categoryResponse.text();
        log.warn('Categorization failed', {
          receiptId,
          status: categoryResponse.status,
          error: errorText.substring(0, 200)
        });
      }
    } catch (categoryError) {
      log.warn('Error triggering categorization', {
        receiptId,
        error: categoryError.message
      });
    }

    // 8) Mark queue item as processed
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
