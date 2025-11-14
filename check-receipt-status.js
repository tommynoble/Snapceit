#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
  console.log('🔍 Checking receipt processing status...\n');

  try {
    // Check receipts_v2 table
    console.log('📋 Recent Receipts (receipts_v2):');
    const { data: receipts, error: receiptError } = await supabase
      .from('receipts_v2')
      .select('id, merchant, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (receiptError) throw receiptError;

    if (receipts && receipts.length > 0) {
      receipts.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.merchant || 'Unknown'} - Status: ${r.status} (${r.created_at})`);
      });
    } else {
      console.log('  No receipts found');
    }

    // Check queue
    console.log('\n📦 Receipt Queue:');
    const { data: queue, error: queueError } = await supabase
      .from('receipt_queue')
      .select('receipt_id, processed, attempts, last_error, processed_at')
      .order('enqueued_at', { ascending: false })
      .limit(5);

    if (queueError) throw queueError;

    if (queue && queue.length > 0) {
      queue.forEach((q, i) => {
        const status = q.processed ? '✅ DONE' : '⏳ PENDING';
        console.log(`  ${i + 1}. ${q.receipt_id.substring(0, 8)}... - ${status} (Attempts: ${q.attempts})`);
        if (q.last_error) console.log(`     Error: ${q.last_error}`);
      });
    } else {
      console.log('  Queue is empty');
    }

    // Check DLQ (failed receipts)
    console.log('\n❌ Dead Letter Queue (Failed):');
    const { data: dlq, error: dlqError } = await supabase
      .from('receipt_queue_dlq')
      .select('receipt_id, error_message, attempts, failed_at')
      .order('failed_at', { ascending: false })
      .limit(5);

    if (dlqError) throw dlqError;

    if (dlq && dlq.length > 0) {
      dlq.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d.receipt_id.substring(0, 8)}... - ${d.error_message}`);
      });
    } else {
      console.log('  No failed receipts');
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`  Total receipts: ${receipts?.length || 0}`);
    console.log(`  In queue: ${queue?.length || 0}`);
    console.log(`  Failed: ${dlq?.length || 0}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStatus();
