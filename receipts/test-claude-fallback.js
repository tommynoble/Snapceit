#!/usr/bin/env node

/**
 * Test Claude fallback with unknown vendor
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
  console.log('🧪 Testing Claude Fallback\n');

  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'tommynoble71@gmail.com');

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  // Create receipt with vendor that WON'T match rules
  console.log('📝 Creating receipt with UNKNOWN vendor (should trigger Claude)...');
  const { data: receipt, error: err } = await supabase
    .from('receipts_v2')
    .insert({
      user_id: user.id,
      merchant: 'Acme Corp International Ltd',  // Unlikely to match rules
      total: 125.50,
      subtotal: 110.00,
      tax: 15.50,
      receipt_date: new Date().toISOString().split('T')[0],
      raw_ocr: `ACME CORP INTERNATIONAL LTD
LAPTOP STAND $45.00
WIRELESS MOUSE $25.00
USB CABLES $15.00
DESK LAMP $25.00
TOTAL $125.50`,
      line_items_json: [
        { description: 'LAPTOP STAND', amount: 45.00 },
        { description: 'WIRELESS MOUSE', amount: 25.00 },
        { description: 'USB CABLES', amount: 15.00 },
        { description: 'DESK LAMP', amount: 25.00 }
      ],
      status: 'ocr_done'
    })
    .select()
    .single();

  if (err) {
    console.error('❌ Insert failed:', err);
    process.exit(1);
  }

  console.log(`✅ Created receipt: ${receipt.id}\n`);

  // Call process-receipt
  console.log('🔄 Calling process-receipt (should call Claude)...');
  const resp = await fetch(
    `${SUPABASE_URL}/functions/v1/process-receipt`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ receipt_id: receipt.id })
    }
  );

  const data = await resp.json();
  console.log('📊 Response:', JSON.stringify(data, null, 2));
  
  if (data.category_source === 'claude') {
    console.log(`\n✅ SUCCESS! Claude categorized as: ${data.category} (${data.confidence * 100}%)`);
  } else if (data.category_source === 'rules') {
    console.log(`\n⚠️  Rules matched instead: ${data.category} (${data.confidence * 100}%)`);
  } else {
    console.log(`\n❌ Failed to categorize`);
  }
}

test().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
