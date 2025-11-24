#!/usr/bin/env node

/**
 * Debug Stop&Shop categorization flow
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function debug() {
  console.log('🔍 Debugging Stop&Shop Categorization\n');

  // Get the most recent Stop&Shop receipt
  const { data: receipts, error } = await supabase
    .from('receipts_v2')
    .select('*')
    .eq('merchant', 'Stop&Shop')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !receipts || receipts.length === 0) {
    console.error('❌ No Stop&Shop receipt found');
    process.exit(1);
  }

  const receipt = receipts[0];
  console.log('📋 Receipt Details:');
  console.log(`   ID: ${receipt.id}`);
  console.log(`   Merchant: ${receipt.merchant}`);
  console.log(`   Total: $${receipt.total}`);
  console.log(`   Status: ${receipt.status}`);
  console.log(`   Category: ${receipt.category || '(none)'}`);
  console.log(`   Confidence: ${receipt.category_confidence || '(none)'}`);
  console.log(`   Has raw_ocr: ${receipt.raw_ocr ? 'YES' : 'NO'}`);
  console.log(`   Created: ${new Date(receipt.created_at).toLocaleString()}\n`);

  // Get all predictions for this receipt
  const { data: predictions, error: predError } = await supabase
    .from('predictions')
    .select('*')
    .eq('subject_id', receipt.id)
    .order('created_at', { ascending: false });

  console.log('📊 Predictions:');
  if (predError) {
    console.log(`   ❌ Error: ${predError.message}`);
  } else if (!predictions || predictions.length === 0) {
    console.log(`   ❌ NO PREDICTIONS FOUND`);
    console.log(`   This means Claude never returned a valid category`);
  } else {
    predictions.forEach((pred, idx) => {
      console.log(`\n   ${idx + 1}. Method: ${pred.method}`);
      console.log(`      Category ID: ${pred.category_id}`);
      console.log(`      Confidence: ${(pred.confidence * 100).toFixed(0)}%`);
      console.log(`      Details: ${JSON.stringify(pred.details)}`);
    });
  }

  console.log('\n\n🔧 Diagnosis:');
  if (receipt.status === 'categorized' && !receipt.category) {
    console.log('   ⚠️  Receipt is marked as "categorized" but has NO category');
    console.log('   This means the categorize function ran but Claude returned ok: false');
    console.log('\n   Possible causes:');
    console.log('   1. Claude returned invalid JSON');
    console.log('   2. Claude returned a category name not in CATEGORY_MAP');
    console.log('   3. Claude timed out (8 second limit)');
    console.log('   4. Receipt data was incomplete/null');
  } else if (receipt.status === 'ocr_done') {
    console.log('   ⚠️  Receipt is still in "ocr_done" status');
    console.log('   This means categorize function was never called');
  }

  console.log('\n\n💡 Next Steps:');
  console.log('   1. Check Supabase dashboard logs for "categorize" function');
  console.log('   2. Look for "Claude request input summary" log entry');
  console.log('   3. Look for "Claude raw content" to see what Claude returned');
  console.log('   4. Check for "No JSON found" or "Failed to parse JSON" errors');
}

debug().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
