#!/usr/bin/env node

/**
 * CLI script to test receipt upload and diagnose 42P10 error
 * Usage: node test-receipt-upload.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReceiptUpload() {
  console.log('🧪 Testing receipt upload...\n');

  try {
    // Generate a valid UUID for testing
    const testUserId = uuidv4();
    
    console.log(`ℹ️  Using user ID: ${testUserId}\n`);

    // Test data
    const testReceipt = {
      user_id: testUserId,
      merchant: 'Test Merchant CLI',
      amount: 42.99,
      total: 42.99,
      receipt_date: new Date().toISOString(),
      items: [{ name: 'Test Item', price: 42.99 }],
      image_url: null,
      notes: 'CLI test receipt',
      status: 'pending'
    };

    console.log('📝 Test receipt data:');
    console.log(JSON.stringify(testReceipt, null, 2));
    console.log('\n');

    // Attempt insert
    console.log('🚀 Attempting insert...\n');
    
    const { data, error } = await supabase
      .from('receipts')
      .insert([testReceipt]);

    if (error) {
      console.error('❌ INSERT ERROR:');
      console.error(JSON.stringify(error, null, 2));
      
      // Diagnose the error
      if (error.code === '42P10') {
        console.error('\n🔍 DIAGNOSIS: 42P10 - "no unique or exclusion constraint matching ON CONFLICT"');
        console.error('This means Supabase is still using ON CONFLICT internally.');
        console.error('Check if there\'s an on_conflict parameter in the request URL.');
      }
      
      process.exit(1);
    }

    console.log('✅ INSERT SUCCESSFUL!');
    console.log('Response:', JSON.stringify(data, null, 2));

    // Verify it was inserted
    console.log('\n🔍 Verifying insert...\n');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
      process.exit(1);
    }

    if (verifyData && verifyData.length > 0) {
      console.log('✅ Receipt found in database:');
      console.log(JSON.stringify(verifyData[0], null, 2));
    } else {
      console.log('⚠️  No receipts found');
    }

  } catch (err) {
    console.error('❌ Unexpected error:');
    console.error(err);
    process.exit(1);
  }
}

testReceiptUpload();
