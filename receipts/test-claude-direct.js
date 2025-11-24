#!/usr/bin/env node

/**
 * Test Claude categorize function directly
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

async function testClaudeDirect() {
  console.log('🧪 Testing Claude Directly\n');

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
  console.log(`📝 Testing with receipt: ${receipt.id}`);
  console.log(`   Merchant: ${receipt.merchant}`);
  console.log(`   Total: $${receipt.total}`);
  console.log(`   Status: ${receipt.status}`);
  console.log(`   Raw OCR: ${receipt.raw_ocr ? receipt.raw_ocr.substring(0, 100) : '(none)'}\n`);

  // Call claude-categorize directly
  console.log('🔄 Calling claude-categorize...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/claude-categorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ receipt_id: receipt.id })
    });

    const data = await response.json();

    console.log('📊 Claude Response:');
    console.log(JSON.stringify(data, null, 2));

    if (data.ok && data.category_id) {
      console.log(`\n✅ Success! Category: ${data.category} (ID: ${data.category_id}, Confidence: ${(data.confidence * 100).toFixed(0)}%)`);
    } else {
      console.log(`\n❌ Failed. Reason: ${data.reason || data.error}`);
    }
  } catch (error) {
    console.error('❌ Error calling claude-categorize:', error.message);
  }
}

testClaudeDirect().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
