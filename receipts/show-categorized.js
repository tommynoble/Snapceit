#!/usr/bin/env node

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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function showCategorized() {
  console.log('📊 Categorized Receipts from Tests');
  console.log('==================================\n');

  // Get all categorized receipts
  const { data: receipts } = await supabase
    .from('receipts_v2')
    .select('id, merchant, total, category, category_confidence, receipt_date, status')
    .not('category', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!receipts || receipts.length === 0) {
    console.log('❌ No categorized receipts found');
    process.exit(0);
  }

  console.log(`✅ Found ${receipts.length} categorized receipts:\n`);

  receipts.forEach((r, i) => {
    const confidence = (r.category_confidence * 100).toFixed(0);
    const confidenceColor = r.category_confidence >= 0.75 ? '🟢' : r.category_confidence >= 0.65 ? '🟡' : '🔴';
    
    console.log(`${i + 1}. ${r.merchant || 'Unknown'}`);
    console.log(`   💰 $${r.total}`);
    console.log(`   📂 ${r.category}`);
    console.log(`   ${confidenceColor} Confidence: ${confidence}%`);
    console.log(`   📅 Date: ${r.receipt_date || 'N/A'}`);
    console.log(`   Status: ${r.status}`);
    console.log();
  });

  console.log('✨ Done!');
}

showCategorized().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
