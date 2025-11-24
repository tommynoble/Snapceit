#!/usr/bin/env node

/**
 * Test Claude with real-world unknown vendors
 * These should trigger Claude and be categorized correctly
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

// Real-world unknown vendors that Claude should categorize
const TEST_RECEIPTS = [
  {
    vendor: 'Stop&Shop',
    total: 961.00,
    subtotal: 961.00,
    tax: 0,
    date: '2020-07-04',
    description: 'Supermarket (Stop&Shop)',
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
TOTAL: $961.00`
  },
  {
    vendor: 'Costco Wholesale',
    total: 450.00,
    subtotal: 450.00,
    tax: 0,
    date: '2025-11-20',
    description: 'Warehouse club (Costco)',
    raw_ocr: `COSTCO WHOLESALE
MEMBERSHIP #12345
OFFICE SUPPLIES
PAPER TOWELS
PRINTER INK
CLEANING SUPPLIES
TOTAL: $450.00`
  },
  {
    vendor: 'Whole Foods Market',
    total: 125.50,
    subtotal: 125.50,
    tax: 0,
    date: '2025-11-19',
    description: 'Grocery store (Whole Foods)',
    raw_ocr: `WHOLE FOODS MARKET
ORGANIC PRODUCE
DAIRY
MEAT
BAKERY
TOTAL: $125.50`
  }
];

console.log('🧪 Claude Real-World Test');
console.log('=========================\n');

async function runTest() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'tommynoble71@gmail.com');

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  console.log(`👤 Testing with user: ${user.email}\n`);

  const results = [];

  for (const testReceipt of TEST_RECEIPTS) {
    console.log(`📝 Testing: ${testReceipt.description}`);
    
    const { data: receipt, error: insertError } = await supabase
      .from('receipts_v2')
      .insert({
        user_id: user.id,
        merchant: testReceipt.vendor,
        total: testReceipt.total,
        subtotal: testReceipt.subtotal,
        tax: testReceipt.tax,
        receipt_date: testReceipt.date,
        raw_ocr: testReceipt.raw_ocr,
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
    try {
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
          vendor: testReceipt.vendor,
          category: categoryData.category,
          confidence: categoryData.confidence,
          method: categoryData.method,
          success: true
        });
      } else {
        console.log(`   ⚠️  No category assigned`);
        console.log(`      Reason: ${categoryData.reason}`);
        results.push({
          vendor: testReceipt.vendor,
          category: null,
          reason: categoryData.reason,
          success: false
        });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        vendor: testReceipt.vendor,
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
      console.log(`   ✅ ${r.vendor}`);
      console.log(`      → ${r.category} (${(r.confidence * 100).toFixed(0)}%, ${r.method})`);
    } else {
      console.log(`   ❌ ${r.vendor}`);
      console.log(`      → ${r.reason || r.error}`);
    }
  });

  console.log('\n✨ Test complete!');
}

runTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
