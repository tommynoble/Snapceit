#!/usr/bin/env node

/**
 * Test Claude with real receipts from public/test_reciepts folder
 * Processes one by one and shows categorization results
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

// Map receipt filenames to known vendors/descriptions
const RECEIPT_INFO = {
  'Lidl.jpg': { vendor: 'Lidl', description: 'Grocery store' },
  'real-seafood-receipt.jpg': { vendor: 'Real Seafood Restaurant', description: 'Restaurant' },
  'standard-grocery-receipt-template.png': { vendor: 'Generic Grocery Store', description: 'Grocery store' },
  '1_XABefyicvTbpAARnM33BLA.jpg': { vendor: 'Unknown Receipt 1', description: 'Unknown vendor' },
  '2025-04-03-image-6.webp': { vendor: 'Unknown Receipt 2', description: 'Unknown vendor' },
  'IMG_4266-768x1024.jpeg': { vendor: 'Unknown Receipt 3', description: 'Unknown vendor' },
  'Receipt Front.png': { vendor: 'Unknown Receipt 4', description: 'Unknown vendor' },
};

async function testRealReceipts() {
  console.log('🧪 Testing Claude with Real Receipts');
  console.log('====================================\n');

  // Get user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'tommynoble71@gmail.com');

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  const receiptsDir = path.join(__dirname, '../public/test_reciepts');
  const files = fs.readdirSync(receiptsDir).filter(f => 
    f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.webp')
  );

  console.log(`📁 Found ${files.length} receipt images\n`);

  const results = [];

  for (const file of files) {
    const info = RECEIPT_INFO[file] || { vendor: 'Unknown', description: 'Unknown' };
    
    console.log(`📝 Processing: ${file}`);
    console.log(`   Vendor: ${info.vendor}`);
    console.log(`   Type: ${info.description}`);

    try {
      // Create receipt in database
      const { data: receipt, error: insertError } = await supabase
        .from('receipts_v2')
        .insert({
          user_id: user.id,
          merchant: info.vendor,
          total: Math.random() * 500 + 10, // Random total for testing
          subtotal: Math.random() * 450 + 10,
          tax: Math.random() * 50,
          receipt_date: new Date().toISOString().split('T')[0],
          raw_ocr: `Receipt from ${info.vendor}\n${info.description}`, // Placeholder OCR
          status: 'ocr_done'
        })
        .select()
        .single();

      if (insertError) {
        console.log(`   ❌ Insert failed: ${insertError.message}`);
        continue;
      }

      console.log(`   ✅ Created receipt: ${receipt.id}`);

      // Call categorize function
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

      const categoryData = await categoryResponse.json();

      if (categoryData.ok && categoryData.category_id) {
        console.log(`   ✅ Category: ${categoryData.category}`);
        console.log(`      Confidence: ${(categoryData.confidence * 100).toFixed(0)}%`);
        console.log(`      Method: ${categoryData.method}`);
        results.push({
          file,
          vendor: info.vendor,
          category: categoryData.category,
          confidence: categoryData.confidence,
          method: categoryData.method,
          success: true
        });
      } else {
        console.log(`   ⚠️  No category assigned`);
        console.log(`      Reason: ${categoryData.reason}`);
        results.push({
          file,
          vendor: info.vendor,
          category: null,
          reason: categoryData.reason,
          success: false
        });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        file,
        vendor: info.vendor,
        error: error.message,
        success: false
      });
    }

    console.log();
  }

  // Summary
  console.log('\n📊 Summary');
  console.log('==========');
  const categorized = results.filter(r => r.success).length;
  console.log(`Total: ${results.length}`);
  console.log(`✅ Categorized: ${categorized}`);
  console.log(`❌ Not categorized: ${results.length - categorized}`);
  console.log(`Success Rate: ${((categorized / results.length) * 100).toFixed(0)}%`);

  console.log('\n📋 Results:');
  results.forEach(r => {
    if (r.success) {
      console.log(`   ✅ ${r.file}`);
      console.log(`      → ${r.category} (${(r.confidence * 100).toFixed(0)}%, ${r.method})`);
    } else {
      console.log(`   ❌ ${r.file}`);
      console.log(`      → ${r.reason || r.error}`);
    }
  });

  console.log('\n✨ Test complete!');
}

testRealReceipts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
