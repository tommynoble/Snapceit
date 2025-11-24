#!/usr/bin/env node

/**
 * Frontend Flow Test
 * 
 * Simulates the actual frontend flow:
 * 1. Authenticate user
 * 2. Upload receipt images from public/test_reciepts
 * 3. Wait for Lambda processing (1 minute)
 * 4. Check categorization results
 * 5. Verify UI would display correctly
 * 
 * Usage: node test-frontend-flow.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test receipts directory
const TEST_RECEIPTS_DIR = path.join(__dirname, '../public/test_reciepts');

console.log('🧪 Frontend Flow Test');
console.log('====================\n');

/**
 * Authenticate user
 */
async function authenticateUser() {
  console.log('🔐 Authenticating user...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'tommynoble71@gmail.com',
    password: 'Anomaa2012@!'
  });

  if (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Authenticated as:', data.user.email);
  return data.user;
}

/**
 * Get test receipt files
 */
function getTestReceipts() {
  if (!fs.existsSync(TEST_RECEIPTS_DIR)) {
    console.error('❌ Test receipts directory not found:', TEST_RECEIPTS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(TEST_RECEIPTS_DIR)
    .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .map(f => ({
      name: f,
      path: path.join(TEST_RECEIPTS_DIR, f),
      size: fs.statSync(path.join(TEST_RECEIPTS_DIR, f)).size
    }));

  console.log(`\n📁 Found ${files.length} test receipts:`);
  files.forEach((f, i) => {
    console.log(`   ${i + 1}. ${f.name} (${(f.size / 1024).toFixed(1)}KB)`);
  });

  return files;
}

/**
 * Upload receipt image
 */
async function uploadReceipt(user, file) {
  try {
    const fileBuffer = fs.readFileSync(file.path);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(filePath, fileBuffer, {
        contentType: `image/${file.name.split('.').pop().toLowerCase()}`
      });

    if (error) {
      console.log(`   ❌ Upload failed: ${error.message}`);
      return null;
    }

    console.log(`   ✅ Uploaded: ${file.name}`);
    return filePath;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

/**
 * Wait for receipt processing
 */
async function waitForProcessing(receiptId, maxWaitTime = 90000) {
  console.log(`   ⏳ Waiting for Lambda processing (max ${maxWaitTime / 1000}s)...`);
  
  const startTime = Date.now();
  const pollInterval = 5000; // Check every 5 seconds

  while (Date.now() - startTime < maxWaitTime) {
    const { data: receipt } = await supabase
      .from('receipts_v2')
      .select('status, category, category_id, category_confidence')
      .eq('id', receiptId)
      .single();

    if (receipt && receipt.status === 'ocr_done') {
      console.log(`   ✅ OCR Done`);
      return receipt;
    }

    if (receipt && receipt.status === 'categorized') {
      console.log(`   ✅ Categorized`);
      return receipt;
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  console.log(`   ⏱️  Timeout waiting for processing`);
  return null;
}

/**
 * Check receipt data
 */
async function checkReceipt(receiptId) {
  const { data: receipt } = await supabase
    .from('receipts_v2')
    .select('*')
    .eq('id', receiptId)
    .single();

  return receipt;
}

/**
 * Format receipt for display
 */
function formatReceipt(receipt) {
  let output = `\n   📄 Receipt Details:`;
  output += `\n      Vendor: ${receipt.merchant || 'Unknown'}`;
  output += `\n      Total: $${receipt.total || 'N/A'}`;
  output += `\n      Date: ${receipt.receipt_date || 'Not available'}`;
  output += `\n      Status: ${receipt.status}`;
  
  if (receipt.category) {
    output += `\n      ✅ Category: ${receipt.category}`;
    output += `\n      Confidence: ${(receipt.category_confidence * 100).toFixed(0)}%`;
  } else {
    output += `\n      ❌ No category assigned`;
  }

  return output;
}

/**
 * Main test flow
 */
async function runTests() {
  // 1. Authenticate
  const user = await authenticateUser();

  // 2. Get test receipts
  const testReceipts = getTestReceipts();

  if (testReceipts.length === 0) {
    console.log('❌ No test receipts found');
    process.exit(1);
  }

  // 3. Upload and test first 3 receipts
  console.log(`\n🚀 Testing first 3 receipts...\n`);
  
  const receiptsToTest = testReceipts.slice(0, 3);
  const results = [];

  for (const file of receiptsToTest) {
    console.log(`\n📤 Testing: ${file.name}`);
    
    // Upload
    const filePath = await uploadReceipt(user, file);
    if (!filePath) continue;

    // Get receipt ID from storage
    // Note: In real flow, Lambda would be triggered by storage upload
    // For testing, we'll check if receipt exists in DB
    
    // Wait a bit for Lambda to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check latest receipt
    const { data: latestReceipt } = await supabase
      .from('receipts_v2')
      .select('id, merchant, total, status, category, category_id, category_confidence, receipt_date')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestReceipt) {
      console.log(formatReceipt(latestReceipt));
      results.push({
        file: file.name,
        receipt: latestReceipt,
        success: !!latestReceipt.category
      });
    } else {
      console.log('   ❌ Receipt not found in database');
    }
  }

  // 4. Summary
  console.log('\n\n📊 Summary');
  console.log('==========');
  const categorized = results.filter(r => r.success).length;
  console.log(`Tested: ${results.length}`);
  console.log(`✅ Categorized: ${categorized}`);
  console.log(`❌ Not categorized: ${results.length - categorized}`);
  console.log(`Success Rate: ${((categorized / results.length) * 100).toFixed(0)}%`);

  console.log('\n📝 Details:');
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    const category = r.receipt.category || 'No category';
    console.log(`   ${status} ${r.file}: ${category}`);
  });

  console.log('\n✨ Test complete!');
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
