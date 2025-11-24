#!/usr/bin/env node

/**
 * Test All Real Receipts
 * 
 * Uploads all 11 test receipts from public/test_reciepts
 * Waits for Lambda processing and checks categorization
 * Tests one receipt at a time until all are processed
 * 
 * Usage: node test-all-receipts.js
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
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test receipts directory
const TEST_RECEIPTS_DIR = path.join(__dirname, '../public/test_reciepts');

console.log('🧪 Test All Real Receipts');
console.log('=========================\n');

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
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

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
      return { success: false, error: error.message };
    }

    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Wait for receipt processing
 */
async function waitForProcessing(user, maxWaitTime = 120000) {
  console.log(`   ⏳ Waiting for Lambda processing (max ${maxWaitTime / 1000}s)...`);
  
  const startTime = Date.now();
  const pollInterval = 5000; // Check every 5 seconds
  let lastStatus = null;

  while (Date.now() - startTime < maxWaitTime) {
    // Get latest receipt for this user
    const { data: receipt } = await supabase
      .from('receipts_v2')
      .select('id, merchant, total, status, category, category_id, category_confidence, receipt_date')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (receipt) {
      if (receipt.status !== lastStatus) {
        console.log(`      Status: ${receipt.status}`);
        lastStatus = receipt.status;
      }

      if (receipt.status === 'categorized' && receipt.category) {
        console.log(`   ✅ Categorized: ${receipt.category}`);
        return {
          success: true,
          receipt,
          vendor: receipt.merchant,
          category: receipt.category,
          confidence: receipt.category_confidence
        };
      }

      if (receipt.status === 'ocr_done' && !receipt.category) {
        console.log(`   ⚠️  OCR done but no category assigned`);
        return {
          success: false,
          receipt,
          vendor: receipt.merchant,
          reason: 'No category assigned'
        };
      }
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  console.log(`   ⏱️  Timeout waiting for processing`);
  return { success: false, reason: 'Timeout' };
}

/**
 * Main test flow
 */
async function runTests() {
  // Authenticate
  console.log('🔐 Authenticating user...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'tommynoble71@gmail.com',
    password: 'Anomaa2012@!'
  });

  if (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }

  const user = data.user;
  console.log(`✅ Authenticated as: ${user.email}\n`);

  // Get test receipts
  const testReceipts = getTestReceipts();
  console.log(`📁 Found ${testReceipts.length} test receipts\n`);

  if (testReceipts.length === 0) {
    console.log('❌ No test receipts found');
    process.exit(1);
  }

  const results = [];

  // Test each receipt one at a time
  for (let i = 0; i < testReceipts.length; i++) {
    const file = testReceipts[i];
    console.log(`\n[${i + 1}/${testReceipts.length}] 📤 Testing: ${file.name}`);
    console.log(`   Size: ${(file.size / 1024).toFixed(1)}KB`);

    // Upload
    const uploadResult = await uploadReceipt(user, file);
    if (!uploadResult.success) {
      console.log(`   ❌ Upload failed: ${uploadResult.error}`);
      results.push({
        file: file.name,
        success: false,
        reason: `Upload failed: ${uploadResult.error}`
      });
      continue;
    }

    console.log(`   ✅ Uploaded`);

    // Wait for processing
    const processResult = await waitForProcessing(user, 120000);
    
    if (processResult.success) {
      console.log(`   Confidence: ${(processResult.confidence * 100).toFixed(0)}%`);
      results.push({
        file: file.name,
        vendor: processResult.vendor,
        category: processResult.category,
        confidence: processResult.confidence,
        success: true
      });
    } else {
      results.push({
        file: file.name,
        vendor: processResult.receipt?.merchant || 'Unknown',
        reason: processResult.reason,
        success: false
      });
    }

    // Small delay between uploads
    if (i < testReceipts.length - 1) {
      console.log('   ⏸️  Waiting before next receipt...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n\n📊 Summary');
  console.log('==========');
  const categorized = results.filter(r => r.success).length;
  console.log(`Total: ${results.length}`);
  console.log(`✅ Categorized: ${categorized}`);
  console.log(`❌ Not categorized: ${results.length - categorized}`);
  console.log(`Success Rate: ${((categorized / results.length) * 100).toFixed(0)}%`);

  console.log('\n📋 Detailed Results:');
  results.forEach((r, i) => {
    if (r.success) {
      console.log(`   ${i + 1}. ✅ ${r.file}`);
      console.log(`      → ${r.category} (${(r.confidence * 100).toFixed(0)}%)`);
    } else {
      console.log(`   ${i + 1}. ❌ ${r.file}`);
      console.log(`      → ${r.reason}`);
    }
  });

  console.log('\n✨ Test complete!');
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
