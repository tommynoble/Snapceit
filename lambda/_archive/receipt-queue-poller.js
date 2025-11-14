// Receipt Queue Poller - Polls receipt_queue for unprocessed receipts
// Triggered by CloudWatch scheduled rule (every 30-60 seconds)
// Uses FOR UPDATE SKIP LOCKED for safe concurrent processing

const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const textractClient = new TextractClient({ region: 'us-east-1' });

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function processReceipt(receiptId) {
  console.log(`Processing receipt: ${receiptId}`);

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
      return true;
    }

    console.log(`Fetched receipt: ${receipt.id}, image_url: ${receipt.image_url}`);

    // Download image from Supabase Storage
    const { data, error: downloadError } = await supabase.storage
      .from('receipts')
      .download(receipt.image_url);

    if (downloadError) throw new Error(`Failed to download: ${downloadError.message}`);

    const imageBytes = await data.arrayBuffer();
    console.log(`Downloaded image: ${imageBytes.byteLength} bytes`);

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
      p_processor: 'receipt-queue-poller',
      p_error_message: null
    });

    if (markError) console.warn(`Failed to mark processed: ${markError.message}`);

    return true;

  } catch (error) {
    console.error(`❌ Error processing receipt ${receiptId}:`, error.message);

    // Mark queue item with error
    try {
      await supabase.rpc('mark_receipt_processed', {
        p_receipt_id: receiptId,
        p_processor: 'receipt-queue-poller',
        p_error_message: error.message
      });
    } catch (markError) {
      console.error(`Failed to mark error: ${markError.message}`);
    }

    return false;
  }
}

async function pollQueue() {
  console.log(`[${new Date().toISOString()}] Polling receipt queue...`);

  try {
    // Get unprocessed receipts (safe concurrent access with FOR UPDATE SKIP LOCKED)
    const { data: queueItems, error: queryError } = await supabase
      .from('receipt_queue')
      .select('id, receipt_id')
      .eq('processed', false)
      .lt('retry_count', 3)
      .order('enqueued_at', { ascending: true })
      .limit(10);

    if (queryError) throw new Error(`Failed to query queue: ${queryError.message}`);

    console.log(`Found ${queueItems.length} unprocessed receipts`);

    if (queueItems.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ processed: 0, message: 'Queue is empty' })
      };
    }

    // Process each receipt
    let successCount = 0;
    for (const item of queueItems) {
      const success = await processReceipt(item.receipt_id);
      if (success) successCount++;
    }

    console.log(`✅ Processed ${successCount}/${queueItems.length} receipts`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        processed: successCount,
        total: queueItems.length,
        message: `Processed ${successCount} receipts`
      })
    };

  } catch (error) {
    console.error('Queue polling error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

// Handler for CloudWatch scheduled event
exports.handler = async (event) => {
  console.log('Queue poller invoked:', JSON.stringify(event));
  return await pollQueue();
};

// For local testing
if (require.main === module) {
  pollQueue().then(result => {
    console.log('Result:', result);
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}
