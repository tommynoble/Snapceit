#!/usr/bin/env node

/**
 * Frontend UI Test
 * Tests the full receipt upload and categorization flow through the UI
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testFrontendFlow() {
  console.log('🧪 Frontend UI Test - Receipt Upload & Categorization');
  console.log('======================================================\n');

  // Authenticate
  const supabaseAnon = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data } = await supabaseAnon.auth.signInWithPassword({
    email: 'tommynoble71@gmail.com',
    password: 'Anomaa2012@!'
  });

  const user = data.user;
  console.log('✅ Authenticated as: ' + user.email + '\n');

  // Upload a receipt (simulating frontend upload)
  const receiptPath = path.join(__dirname, '../public/test_reciepts/Lidl.jpg');
  const fileBuffer = fs.readFileSync(receiptPath);
  const fileName = `${Date.now()}-Lidl.jpg`;
  const filePath = `${user.id}/${fileName}`;

  console.log('📤 Uploading Lidl.jpg to Supabase Storage...');
  const { error: uploadError } = await supabaseAnon.storage
    .from('receipts')
    .upload(filePath, fileBuffer, { contentType: 'image/jpeg' });

  if (uploadError) {
    console.error('❌ Upload failed:', uploadError);
    process.exit(1);
  }

  console.log('✅ Uploaded successfully\n');

  // Wait for Lambda to process
  console.log('⏳ Waiting for Lambda to process (90 seconds)...');
  let receipt = null;
  let attempts = 0;
  const maxAttempts = 18; // 90 seconds / 5 seconds per check

  while (attempts < maxAttempts && !receipt) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;

    const { data: receipts } = await supabase
      .from('receipts_v2')
      .select('id, merchant, total, category, category_confidence, status')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 120000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (receipts && receipts.length > 0 && receipts[0].status !== 'pending') {
      receipt = receipts[0];
    }

    process.stdout.write('.');
  }

  console.log('\n');

  if (!receipt) {
    console.log('❌ Receipt not processed after 90 seconds');
    process.exit(1);
  }

  // Display results
  console.log('📊 Receipt Processing Results:');
  console.log('=============================\n');
  console.log('Vendor: ' + receipt.merchant);
  console.log('Total: $' + receipt.total);
  console.log('Status: ' + receipt.status);

  if (receipt.category) {
    console.log('\n✅ CATEGORIZED');
    console.log('   Category: ' + receipt.category);
    console.log('   Confidence: ' + (receipt.category_confidence * 100).toFixed(0) + '%');
    
    if (receipt.category_confidence >= 0.75) {
      console.log('   Confidence Level: 🟢 HIGH');
    } else if (receipt.category_confidence >= 0.65) {
      console.log('   Confidence Level: 🟡 MEDIUM');
    } else {
      console.log('   Confidence Level: 🔴 LOW');
    }
  } else {
    console.log('\n❌ NOT CATEGORIZED');
  }

  console.log('\n✨ Frontend test complete!');
}

testFrontendFlow().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
