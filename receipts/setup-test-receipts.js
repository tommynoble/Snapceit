#!/usr/bin/env node

/**
 * Setup Test Receipts
 * 
 * Inserts sample receipts into receipts_v2 table
 * Must run before test-categorization.js
 * 
 * Usage: node setup-test-receipts.js
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

// Support both VITE_ prefixed and non-prefixed env vars
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env or .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Load sample receipts
const sampleReceiptsPath = path.join(__dirname, 'sample-receipts.json');
const sampleReceipts = JSON.parse(fs.readFileSync(sampleReceiptsPath, 'utf-8'));

console.log('📋 Setting Up Test Receipts');
console.log('============================\n');

async function setupReceipts() {
  let inserted = 0;
  let skipped = 0;

  // User ID for tommynoble71@gmail.com
  const userId = '8fa99b14-bedb-487e-8ed1-08be07fbc621';

  for (const receipt of sampleReceipts) {
    try {
      // Check if receipt already exists
      const { data: existing } = await supabase
        .from('receipts_v2')
        .select('id')
        .eq('id', receipt.id)
        .single();

      if (existing) {
        console.log(`⏭️  ${receipt.id} - Already exists, skipping`);
        skipped++;
        continue;
      }

      // Insert receipt with user_id
      const { error } = await supabase
        .from('receipts_v2')
        .insert({
          id: receipt.id,
          user_id: userId,
          merchant: receipt.merchant,
          total: receipt.total,
          subtotal: receipt.subtotal,
          tax: receipt.tax,
          receipt_date: receipt.receipt_date,
          status: receipt.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.log(`❌ ${receipt.id} - Error: ${error.message}`);
      } else {
        console.log(`✅ ${receipt.id} - Inserted`);
        inserted++;
      }
    } catch (error) {
      console.log(`❌ ${receipt.id} - Exception: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary`);
  console.log(`==========`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${sampleReceipts.length}`);

  if (inserted > 0) {
    console.log(`\n✅ Test receipts ready! Run: node test-categorization.js`);
  } else if (skipped === sampleReceipts.length) {
    console.log(`\n✅ All test receipts already exist! Run: node test-categorization.js`);
  } else {
    console.log(`\n❌ Failed to setup test receipts`);
    process.exit(1);
  }
}

setupReceipts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
