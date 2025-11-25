#!/usr/bin/env node

/**
 * Test the new process-receipt edge function
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
  console.log('🧪 Testing New process-receipt Edge Function\n');

  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'tommynoble71@gmail.com');

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  // Test 1: Known vendor (Stop & Shop) - should use rules
  console.log('📝 Test 1: Creating Stop & Shop receipt (rules should match)...');
  const { data: receipt1, error: err1 } = await supabase
    .from('receipts_v2')
    .insert({
      user_id: user.id,
      merchant: 'Stop & Shop',
      total: 35.01,
      subtotal: 32.00,
      tax: 3.01,
      receipt_date: new Date().toISOString().split('T')[0],
      raw_ocr: `STOP & SHOP
HUMMUS $5.99
BREAD $3.99
MILK $4.99
TOTAL $35.01`,
      line_items_json: [
        { description: 'HUMMUS', amount: 5.99 },
        { description: 'BREAD', amount: 3.99 },
        { description: 'MILK', amount: 4.99 }
      ],
      status: 'ocr_done'
    })
    .select()
    .single();

  if (err1) {
    console.error('❌ Insert failed:', err1);
    process.exit(1);
  }

  console.log(`✅ Created receipt: ${receipt1.id}`);

  // Call process-receipt
  console.log('🔄 Calling process-receipt...');
  const resp1 = await fetch(
    `${SUPABASE_URL}/functions/v1/process-receipt`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ receipt_id: receipt1.id })
    }
  );

  const data1 = await resp1.json();
  console.log('📊 Response:', JSON.stringify(data1, null, 2));
  console.log(`✅ Category: ${data1.category} (${data1.method})\n`);

  // Test 2: Unknown vendor - should call Claude
  console.log('📝 Test 2: Creating unknown vendor receipt (Claude should be called)...');
  const { data: receipt2, error: err2 } = await supabase
    .from('receipts_v2')
    .insert({
      user_id: user.id,
      merchant: 'XYZ Unknown Store',
      total: 50.00,
      subtotal: 45.00,
      tax: 5.00,
      receipt_date: new Date().toISOString().split('T')[0],
      raw_ocr: `XYZ UNKNOWN STORE
KITCHEN APPLIANCE $30.00
CLEANING SUPPLIES $15.00
TOTAL $50.00`,
      line_items_json: [
        { description: 'KITCHEN APPLIANCE', amount: 30.00 },
        { description: 'CLEANING SUPPLIES', amount: 15.00 }
      ],
      status: 'ocr_done'
    })
    .select()
    .single();

  if (err2) {
    console.error('❌ Insert failed:', err2);
    process.exit(1);
  }

  console.log(`✅ Created receipt: ${receipt2.id}`);

  // Call process-receipt
  console.log('🔄 Calling process-receipt...');
  const resp2 = await fetch(
    `${SUPABASE_URL}/functions/v1/process-receipt`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ receipt_id: receipt2.id })
    }
  );

  const data2 = await resp2.json();
  console.log('📊 Response:', JSON.stringify(data2, null, 2));
  console.log(`✅ Category: ${data2.category || 'Uncategorized'} (${data2.method || 'N/A'})\n`);

  console.log('✨ Tests complete!');
}

test().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
