#!/usr/bin/env node

/**
 * Check Claude categorization results and predictions
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

async function checkLogs() {
  console.log('📋 Checking Claude Categorization Results\n');

  // Get recent receipts (last 10)
  const { data: receipts, error: receiptsError } = await supabase
    .from('receipts_v2')
    .select('id, merchant, total, status, category, category_confidence, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (receiptsError) {
    console.error('❌ Error fetching receipts:', receiptsError.message);
    process.exit(1);
  }

  console.log('📊 Recent Receipts:');
  console.log('==================\n');

  for (const receipt of receipts) {
    console.log(`Receipt ID: ${receipt.id}`);
    console.log(`Merchant: ${receipt.merchant}`);
    console.log(`Total: $${receipt.total}`);
    console.log(`Status: ${receipt.status}`);
    console.log(`Category: ${receipt.category || '(none)'}`);
    console.log(`Confidence: ${receipt.category_confidence ? (receipt.category_confidence * 100).toFixed(0) + '%' : '(none)'}`);
    console.log(`Created: ${new Date(receipt.created_at).toLocaleString()}`);

    // Get predictions for this receipt
    const { data: predictions, error: predError } = await supabase
      .from('predictions')
      .select('*')
      .eq('subject_id', receipt.id)
      .order('created_at', { ascending: false });

    if (!predError && predictions && predictions.length > 0) {
      console.log(`\n  Predictions (${predictions.length}):`);
      predictions.forEach((pred, idx) => {
        console.log(`    ${idx + 1}. Method: ${pred.method} | Category ID: ${pred.category_id} | Confidence: ${(pred.confidence * 100).toFixed(0)}%`);
        if (pred.details) {
          console.log(`       Details: ${JSON.stringify(pred.details).substring(0, 100)}`);
        }
      });
    }

    console.log('\n---\n');
  }
}

checkLogs().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
