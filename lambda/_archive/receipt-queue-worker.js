// Receipt Queue Worker - Polls receipt_queue and processes pending receipts
// This is a fallback/robust alternative to webhook delivery

const { createClient } = require('@supabase/supabase-js');
const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const textractClient = new TextractClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function processReceiptQueue() {
  try {
    console.log('Starting receipt queue worker...');

    // Get unprocessed receipts from queue
    const { data: queueItems, error: queueError } = await supabase
      .from('receipt_queue')
      .select('id, receipt_id')
      .eq('processed', false)
      .lt('retry_count', 3)
      .order('enqueued_at', { ascending: true })
      .limit(10);

    if (queueError) throw queueError;

    console.log(`Found ${queueItems.length} unprocessed receipts`);

    for (const item of queueItems) {
      try {
        // Fetch receipt details
        const { data: receipt, error: receiptError } = await supabase
          .from('receipts')
          .select('*')
          .eq('id', item.receipt_id)
          .single();

        if (receiptError) throw receiptError;

        console.log(`Processing receipt ${receipt.id}`);

        // Download image from Supabase Storage
        const { data, error: downloadError } = await supabase.storage
          .from('receipts')
          .download(receipt.image_url);

        if (downloadError) throw downloadError;

        const imageBytes = await data.arrayBuffer();

        // Call Textract
        const textractResponse = await textractClient.send(
          new DetectDocumentTextCommand({
            Document: { Bytes: new Uint8Array(imageBytes) }
          })
        );

        // Extract and normalize data
        const fullText = textractResponse.Blocks
          .filter(block => block.BlockType === 'LINE')
          .map(block => block.Text)
          .join('\n');

        // Parse vendor, amount, date from text (simplified)
        const vendorMatch = fullText.match(/^(.+?)(?:\n|$)/);
        const amountMatch = fullText.match(/(\d+\.\d{2})/);

        // Update receipt with OCR data
        const { error: updateError } = await supabase
          .from('receipts')
          .update({
            status: 'ocr_done',
            vendor_text: vendorMatch ? vendorMatch[1] : 'Unknown',
            total_amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
            raw_ocr: fullText,
            ocr_confidence: 0.85
          })
          .eq('id', receipt.id);

        if (updateError) throw updateError;

        // Mark as processed
        await supabase.rpc('mark_receipt_processed', {
          p_receipt_id: receipt.id
        });

        console.log(`✅ Successfully processed receipt ${receipt.id}`);

      } catch (error) {
        console.error(`❌ Error processing receipt ${item.receipt_id}:`, error);

        // Mark with error
        await supabase.rpc('mark_receipt_processed', {
          p_receipt_id: item.receipt_id,
          p_error_message: error.message
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ processed: queueItems.length })
    };

  } catch (error) {
    console.error('Queue worker error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

// Handler for CloudWatch scheduled event
exports.handler = async (event) => {
  console.log('Queue worker invoked:', JSON.stringify(event));
  return await processReceiptQueue();
};
