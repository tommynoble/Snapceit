#!/usr/bin/env node

/**
 * Test fresh Stop&Shop receipt through full categorization flow
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

async function testFreshStopShop() {
  console.log('🧪 Testing Fresh Stop&Shop Receipt\n');

  // Get user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'tommynoble71@gmail.com');

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  // Create fresh receipt
  console.log('📝 Creating fresh Stop&Shop receipt...');
  const { data: receipt, error: insertError } = await supabase
    .from('receipts_v2')
    .insert({
      user_id: user.id,
      merchant: 'Stop&Shop',
      total: 961.00,
      subtotal: 961.00,
      tax: 0,
      receipt_date: '2020-07-04',
      raw_ocr: `STOP&SHOP
Store #2123
123 Main St
Anytown, NJ 07001
DIESEL SHOP
FROZEN PEAS
PRODUCE
MILK
EGGS
BREAD
TOTAL: $961.00`,
      status: 'ocr_done'
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ Insert failed:', insertError.message);
    process.exit(1);
  }

  console.log(`✅ Created receipt: ${receipt.id}\n`);

  // Call categorize
  console.log('🔄 Calling categorize function...');
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/categorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ receipt_id: receipt.id })
    });

    const data = await response.json();
    console.log(`✅ Categorize response: ${JSON.stringify(data, null, 2)}\n`);

    // Fetch updated receipt
    console.log('📊 Fetching updated receipt...');
    const { data: updated } = await supabase
      .from('receipts_v2')
      .select('*')
      .eq('id', receipt.id)
      .single();

    console.log(`Status: ${updated.status}`);
    console.log(`Category: ${updated.category || '(none)'}`);
    console.log(`Confidence: ${updated.category_confidence ? (updated.category_confidence * 100).toFixed(0) + '%' : '(none)'}`);

    if (updated.category === 'Supplies') {
      console.log('\n✅ SUCCESS! Stop&Shop correctly categorized as Supplies');
    } else {
      console.log('\n❌ FAILED! Stop&Shop not categorized correctly');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFreshStopShop().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
