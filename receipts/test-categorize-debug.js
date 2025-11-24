#!/usr/bin/env node

/**
 * Debug categorize function with detailed logging
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
  console.log('🧪 Testing Categorize Function with Debug Logging\n');

  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'tommynoble71@gmail.com');

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  // Create a test receipt with Stop&Shop
  console.log('📝 Creating test receipt...');
  const { data: receipt, error: insertError } = await supabase
    .from('receipts_v2')
    .insert({
      user_id: user.id,
      merchant: 'Stop & Shop',
      total: 35.01,
      subtotal: 32.00,
      tax: 3.01,
      receipt_date: new Date().toISOString().split('T')[0],
      raw_ocr: `STOP & SHOP
Store #2123
JSPH ORG HUMMUS $5.99
SB SW BLEND 10Z $4.99
AMYS LS CHNKY TO $3.99
TOTAL $35.01`,
      status: 'ocr_done'
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ Insert failed:', insertError);
    process.exit(1);
  }

  console.log(`✅ Created receipt: ${receipt.id}\n`);

  // Call categorize function with detailed response
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

  console.log('📊 Response Details:');
  console.log(JSON.stringify(categoryData, null, 2));

  // Check database
  console.log('\n📋 Checking database...');
  const { data: updatedReceipt } = await supabase
    .from('receipts_v2')
    .select('*')
    .eq('id', receipt.id)
    .single();

  console.log('Receipt Status:', updatedReceipt.status);
  console.log('Category:', updatedReceipt.category || '(none)');
  console.log('Category ID:', updatedReceipt.category_id || '(none)');
  console.log('Confidence:', updatedReceipt.category_confidence || '(none)');

  // Check predictions
  console.log('\n🤖 Checking predictions...');
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('subject_id', receipt.id)
    .order('created_at', { ascending: false });

  if (predictions && predictions.length > 0) {
    console.log(`Found ${predictions.length} prediction(s):`);
    predictions.forEach((p, idx) => {
      console.log(`${idx + 1}. Method: ${p.method}, Category ID: ${p.category_id}, Confidence: ${(p.confidence * 100).toFixed(0)}%`);
    });
  } else {
    console.log('❌ No predictions found!');
  }

  console.log('\n✨ Debug complete!');
}

test().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
