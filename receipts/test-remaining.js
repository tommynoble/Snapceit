#!/usr/bin/env node

/**
 * Test Remaining Receipts
 * Continue from receipt 6 onwards
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TEST_RECEIPTS_DIR = path.join(__dirname, '../public/test_reciepts');

function getTestReceipts() {
  return fs.readdirSync(TEST_RECEIPTS_DIR)
    .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .map(f => ({
      name: f,
      path: path.join(TEST_RECEIPTS_DIR, f),
      size: fs.statSync(path.join(TEST_RECEIPTS_DIR, f)).size
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function uploadReceipt(user, file) {
  try {
    const fileBuffer = fs.readFileSync(file.path);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${user.id}/${fileName}`;

    const { error } = await supabase.storage
      .from('receipts')
      .upload(filePath, fileBuffer, {
        contentType: `image/${file.name.split('.').pop().toLowerCase()}`
      });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function waitForProcessing(user, maxWaitTime = 180000) {
  const startTime = Date.now();
  const pollInterval = 5000;

  while (Date.now() - startTime < maxWaitTime) {
    const { data: receipt } = await supabase
      .from('receipts_v2')
      .select('id, merchant, total, status, category, category_id, category_confidence, receipt_date')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (receipt && receipt.status === 'categorized' && receipt.category) {
      return {
        success: true,
        vendor: receipt.merchant,
        category: receipt.category,
        confidence: receipt.category_confidence
      };
    }

    if (receipt && receipt.status === 'ocr_done' && !receipt.category) {
      return {
        success: false,
        vendor: receipt.merchant,
        reason: 'No category'
      };
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  return { success: false, reason: 'Timeout' };
}

async function runTest() {
  console.log('🧪 Continue Testing Receipts');
  console.log('=============================\n');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'tommynoble71@gmail.com',
    password: 'Anomaa2012@!'
  });

  if (error) {
    console.error('❌ Auth failed:', error.message);
    process.exit(1);
  }

  const user = data.user;
  const testReceipts = getTestReceipts();
  const results = [];

  // Test receipts 6-12 (skip the ones we already tested)
  for (let i = 5; i < testReceipts.length; i++) {
    const file = testReceipts[i];
    console.log(`\n[${i + 1}/${testReceipts.length}] 📤 ${file.name}`);
    console.log(`   Size: ${(file.size / 1024).toFixed(1)}KB`);

    const uploadResult = await uploadReceipt(user, file);
    if (!uploadResult.success) {
      console.log(`   ❌ Upload failed: ${uploadResult.error}`);
      results.push({ file: file.name, success: false, reason: 'Upload failed' });
      continue;
    }

    console.log('   ✅ Uploaded, waiting...');
    const processResult = await waitForProcessing(user, 180000);

    if (processResult.success) {
      console.log(`   ✅ ${processResult.category} (${(processResult.confidence * 100).toFixed(0)}%)`);
      results.push({
        file: file.name,
        vendor: processResult.vendor,
        category: processResult.category,
        confidence: processResult.confidence,
        success: true
      });
    } else {
      console.log(`   ❌ ${processResult.reason}`);
      results.push({
        file: file.name,
        vendor: processResult.vendor,
        reason: processResult.reason,
        success: false
      });
    }

    if (i < testReceipts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n\n📊 SUMMARY (Receipts 6-12)');
  console.log('===========================');
  const categorized = results.filter(r => r.success).length;
  console.log(`Total: ${results.length}`);
  console.log(`✅ Categorized: ${categorized}`);
  console.log(`❌ Failed: ${results.length - categorized}`);
  console.log(`Success Rate: ${((categorized / results.length) * 100).toFixed(0)}%`);

  console.log('\n📋 Results:');
  results.forEach((r, i) => {
    if (r.success) {
      console.log(`   ${i + 6}. ✅ ${r.file}`);
      console.log(`      → ${r.category} (${(r.confidence * 100).toFixed(0)}%)`);
    } else {
      console.log(`   ${i + 6}. ❌ ${r.file}`);
      console.log(`      → ${r.reason}`);
    }
  });

  console.log('\n✨ Done!');
}

runTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
