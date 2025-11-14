// Receipt Listener Worker - Uses pg LISTEN/NOTIFY for near real-time processing
// This is a persistent process that listens for receipt_channel notifications
// Can run as a container, EC2 instance, or long-running Lambda

const { Client } = require('pg');
const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');

// Initialize clients
const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
  statement_timeout: 30000
});

const s3Client = new S3Client({ region: 'us-east-1' });
const textractClient = new TextractClient({ region: 'us-east-1' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function processReceipt(receiptId) {
  console.log(`[${new Date().toISOString()}] Processing receipt: ${receiptId}`);

  try {
    // Get receipt details
    const { data: receipt, error: fetchError } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', receiptId)
      .single();

    if (fetchError) throw new Error(`Failed to fetch receipt: ${fetchError.message}`);
    if (!receipt) throw new Error(`Receipt not found: ${receiptId}`);

    // Skip if already processed
    if (receipt.status === 'ocr_done' || receipt.status === 'categorized') {
      console.log(`Receipt ${receiptId} already processed (status: ${receipt.status})`);
      return;
    }

    console.log(`Fetched receipt: ${receipt.id}, image_url: ${receipt.image_url}`);

    // Download image from Supabase Storage
    let imageBytes;
    try {
      const { data, error: downloadError } = await supabase.storage
        .from('receipts')
        .download(receipt.image_url);

      if (downloadError) throw downloadError;
      imageBytes = await data.arrayBuffer();
      console.log(`Downloaded image: ${imageBytes.byteLength} bytes`);
    } catch (error) {
      throw new Error(`Failed to download from Supabase Storage: ${error.message}`);
    }

    // Call Textract
    console.log('Calling Textract...');
    const textractResponse = await textractClient.send(
      new DetectDocumentTextCommand({
        Document: { Bytes: new Uint8Array(imageBytes) }
      })
    );

    // Extract text blocks
    const fullText = textractResponse.Blocks
      .filter(block => block.BlockType === 'LINE')
      .map(block => block.Text)
      .join('\n');

    console.log(`Textract extracted ${fullText.length} characters`);

    // Parse vendor, amount, date from text (simplified)
    const vendorMatch = fullText.match(/^(.+?)(?:\n|$)/);
    const amountMatch = fullText.match(/(\d+\.\d{2})/);
    const dateMatch = fullText.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);

    const vendor = vendorMatch ? vendorMatch[1].trim() : 'Unknown Vendor';
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    console.log(`Parsed: vendor=${vendor}, amount=${amount}, date=${date}`);

    // Update receipt with OCR data
    const { error: updateError } = await supabase
      .from('receipts')
      .update({
        status: 'ocr_done',
        vendor_text: vendor,
        total_amount: amount,
        receipt_date: date,
        raw_ocr: fullText,
        ocr_confidence: 0.85
      })
      .eq('id', receiptId);

    if (updateError) throw new Error(`Failed to update receipt: ${updateError.message}`);

    console.log(`✅ Updated receipt ${receiptId} to ocr_done`);

    // Mark queue item as processed
    const { error: markError } = await supabase.rpc('mark_receipt_processed', {
      p_receipt_id: receiptId,
      p_processor: 'receipt-listener-worker',
      p_error_message: null
    });

    if (markError) console.warn(`Failed to mark processed: ${markError.message}`);

    console.log(`✅ Successfully processed receipt ${receiptId}`);

  } catch (error) {
    console.error(`❌ Error processing receipt ${receiptId}:`, error.message);

    // Mark queue item with error
    try {
      await supabase.rpc('mark_receipt_processed', {
        p_receipt_id: receiptId,
        p_processor: 'receipt-listener-worker',
        p_error_message: error.message
      });
    } catch (markError) {
      console.error(`Failed to mark error: ${markError.message}`);
    }
  }
}

async function startListener() {
  try {
    console.log('Connecting to PostgreSQL...');
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL');

    // Set up notification handler
    pgClient.on('notification', async (msg) => {
      try {
        const payload = JSON.parse(msg.payload);
        console.log(`📬 Received notification:`, payload);

        if (payload.receipt_id) {
          await processReceipt(payload.receipt_id);
        }
      } catch (error) {
        console.error('Error handling notification:', error.message);
      }
    });

    // Listen for receipt_channel notifications
    console.log('Listening for receipt_channel notifications...');
    await pgClient.query('LISTEN receipt_channel');
    console.log('✅ Listener started');

    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\nShutting down gracefully...');
      await pgClient.end();
      process.exit(0);
    });

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Start the listener
if (require.main === module) {
  startListener();
}

module.exports = { processReceipt, startListener };
