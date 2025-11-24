#!/usr/bin/env node

/**
 * Local Receipt Categorization Tester
 * 
 * Tests the categorize Edge Function without uploading images
 * Simulates the Lambda → Categorize → Claude flow
 * 
 * Usage: node test-categorization.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Support both VITE_ prefixed and non-prefixed env vars
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env or .env.local');
  console.error('   Found:');
  console.error(`   - SUPABASE_URL: ${SUPABASE_URL ? '✅' : '❌'}`);
  console.error(`   - SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'}`);
  process.exit(1);
}

// Load sample receipts
const sampleReceiptsPath = path.join(__dirname, 'sample-receipts.json');
const sampleReceipts = JSON.parse(fs.readFileSync(sampleReceiptsPath, 'utf-8'));

console.log('📋 Receipt Categorization Tester');
console.log('================================\n');
console.log(`Testing ${sampleReceipts.length} sample receipts...\n`);

/**
 * Call the categorize Edge Function
 */
async function testCategorization(receipt) {
  try {
    const response = await fetch(
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

    const data = await response.json();

    return {
      receipt,
      status: response.status,
      data,
      success: response.ok && data.ok
    };
  } catch (error) {
    return {
      receipt,
      status: 'ERROR',
      error: error.message,
      success: false
    };
  }
}

/**
 * Format result for display
 */
function formatResult(result) {
  const { receipt, status, data, success, error } = result;

  let output = `\n📄 ${receipt.description}`;
  output += `\n   ID: ${receipt.id}`;
  output += `\n   Vendor: ${receipt.merchant}`;
  output += `\n   Total: $${receipt.total}`;

  if (success) {
    output += `\n   ✅ Status: ${status}`;
    output += `\n   Category: ${data.category} (ID: ${data.category_id})`;
    output += `\n   Confidence: ${(data.confidence * 100).toFixed(1)}%`;
    output += `\n   Method: ${data.method}`;
  } else {
    output += `\n   ❌ Status: ${status}`;
    output += `\n   Error: ${error || data?.reason || 'Unknown error'}`;
  }

  return output;
}

/**
 * Main test runner
 */
async function runTests() {
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const receipt of sampleReceipts) {
    process.stdout.write(`Testing ${receipt.id}...`);
    const result = await testCategorization(receipt);
    results.push(result);

    if (result.success) {
      console.log(' ✅');
      passed++;
    } else {
      console.log(' ❌');
      failed++;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print detailed results
  console.log('\n\n📊 Detailed Results');
  console.log('===================');
  
  results.forEach(result => {
    console.log(formatResult(result));
  });

  // Summary
  console.log('\n\n📈 Summary');
  console.log('==========');
  console.log(`Total: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  // Check for Claude usage
  const claudeResults = results.filter(r => r.data?.method === 'claude');
  if (claudeResults.length > 0) {
    console.log(`\n🤖 Claude Fallback Used: ${claudeResults.length} times`);
    claudeResults.forEach(r => {
      console.log(`   - ${r.receipt.id}: ${r.data.category} (${(r.data.confidence * 100).toFixed(1)}%)`);
    });
  }

  // Export results
  const resultsFile = path.join(__dirname, 'test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n📁 Results saved to: ${resultsFile}`);

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
await runTests();
