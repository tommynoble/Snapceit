#!/usr/bin/env node

/**
 * Test what data categorize sends to Claude
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

async function test() {
  console.log('🧪 Testing Claude via Categorize Function\n');

  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'tommynoble71@gmail.com');

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  // Create a receipt with UNKNOWN vendor (not in rules)
  console.log('📝 Creating receipt with UNKNOWN vendor (should trigger Claude)...');
  const { data: receipt, error: insertError } = await supabase
    .from('receipts_v2')
    .insert({
      user_id: user.id,
      merchant: 'XYZ Unknown Store',  // NOT in rules.json
      total: 50.00,
      subtotal: 45.00,
      tax: 5.00,
      receipt_date: new Date().toISOString().split('T')[0],
      raw_ocr: `XYZ UNKNOWN STORE
HUMMUS $5.99
BREAD $3.99
MILK $4.99
TOTAL $50.00`,
      status: 'ocr_done'
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ Insert failed:', insertError);
    process.exit(1);
  }

  console.log(`✅ Created receipt: ${receipt.id}\n`);
  console.log('📋 Receipt Details:');
  console.log(`   Merchant: ${receipt.merchant}`);
  console.log(`   Total: $${receipt.total}`);
  console.log(`   Raw OCR: ${receipt.raw_ocr.substring(0, 50)}...\n`);

  // Call categorize function
  console.log('🔄 Calling categorize function...');
  const categoryResponse = await fetch(
    `${SUPABASE_URL}/functions/v1/categorize`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ receipt_id: receipt.id })
    }
  );

  const categoryText = await categoryResponse.text();
  console.log(`Status: ${categoryResponse.status}`);
  console.log(`Response: ${categoryText}\n`);

  // Parse response
  let categoryData;
  try {
    categoryData = JSON.parse(categoryText);
  } catch (e) {
    console.error('❌ Failed to parse response:', e);
    process.exit(1);
  }

  console.log('📊 Categorize Response:');
  console.log(JSON.stringify(categoryData, null, 2));

  // Check if Claude was called
  if (categoryData.method === 'claude') {
    console.log('\n✅ Claude was called and succeeded!');
  } else if (categoryData.method === 'rule') {
    console.log('\n⚠️  Rules matched (Claude not needed)');
  } else {
    console.log('\n❌ Neither rules nor Claude worked');
  }

  // Check database
  console.log('\n📋 Database State:');
  const { data: updatedReceipt } = await supabase
    .from('receipts_v2')
    .select('*')
    .eq('id', receipt.id)
    .single();

  console.log(`   Status: ${updatedReceipt.status}`);
  console.log(`   Category: ${updatedReceipt.category || '(none)'}`);
  console.log(`   Confidence: ${updatedReceipt.category_confidence || '(none)'}`);

  // Check predictions
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('subject_id', receipt.id);

  console.log(`\n🤖 Predictions: ${predictions?.length || 0}`);
  if (predictions && predictions.length > 0) {
    predictions.forEach((p, idx) => {
      console.log(`   ${idx + 1}. Method: ${p.method}, Category: ${p.category_id}, Confidence: ${(p.confidence * 100).toFixed(0)}%`);
    });
  }

  console.log('\n✨ Test complete!');
}

test().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
