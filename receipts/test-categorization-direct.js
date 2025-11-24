#!/usr/bin/env node

/**
 * Direct Categorization Test
 * 
 * Tests categorization directly without waiting for Lambda
 * Simulates what the frontend sees after categorization
 * 
 * Usage: node test-categorization-direct.js
 */

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
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test receipts with extracted data (simulating Lambda output)
const TEST_RECEIPTS = [
  {
    vendor: 'Marshalls',
    total: 95.29,
    subtotal: 88.97,
    tax: 6.32,
    date: '2025-11-24',
    description: 'Clothing store'
  },
  {
    vendor: 'Shell Gas Station',
    total: 65.50,
    subtotal: 65.50,
    tax: 0,
    date: '2025-11-20',
    description: 'Gas station'
  },
  {
    vendor: 'Lidl',
    total: 19.96,
    subtotal: 19.96,
    tax: 0,
    date: '2025-08-17',
    description: 'Grocery store'
  },
  {
    vendor: 'Real Seafood Restaurant',
    total: 45.99,
    subtotal: 40.00,
    tax: 5.99,
    date: '2025-11-23',
    description: 'Restaurant'
  },
  {
    vendor: 'Unknown Vendor XYZ',
    total: 123.45,
    subtotal: 123.45,
    tax: 0,
    date: '2025-11-22',
    description: 'Unknown vendor (should trigger Claude)'
  }
];

console.log('🧪 Direct Categorization Test');
console.log('=============================\n');

async function runTest() {
  // Get user
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
    
    // Create receipt in database
    const { data: receipt, error: insertError } = await supabase
      .from('receipts_v2')
      .insert({
        user_id: user.id,
        merchant: testReceipt.vendor,
        total: testReceipt.total,
        subtotal: testReceipt.subtotal,
        tax: testReceipt.tax,
        receipt_date: testReceipt.date,
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
