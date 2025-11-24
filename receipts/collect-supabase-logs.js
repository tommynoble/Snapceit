#!/usr/bin/env node

/**
 * Collect logs from Supabase edge functions
 * Requires admin access to Supabase project
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

async function collectLogs() {
  console.log('📋 Collecting Supabase Function Logs');
  console.log('===================================\n');

  const functions = ['categorize', 'claude-categorize', 'batch-categorize'];
  
  for (const functionName of functions) {
    console.log(`\n🔍 Fetching logs for: ${functionName}`);
    console.log('─'.repeat(50));

    try {
      // Try to fetch logs using the REST API
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/logs/${functionName}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.log(`⚠️  API endpoint not available (${response.status})`);
        console.log(`   Note: Supabase doesn't expose logs via REST API`);
        console.log(`   To view logs, use the Supabase dashboard:`);
        console.log(`   https://supabase.com/dashboard/project/yoqpzwqlmdhaapnaufrm/functions`);
        continue;
      }

      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log(`\n💡 Alternative: Use Supabase CLI`);
      console.log(`   supabase functions logs ${functionName} --project-ref yoqpzwqlmdhaapnaufrm`);
    }
  }

  console.log('\n\n📊 Alternative: Query Recent Receipts & Predictions');
  console.log('═'.repeat(50));

  try {
    // Get recent receipts
    const { data: receipts, error: recError } = await supabase
      .from('receipts_v2')
      .select('id, merchant, status, category, category_confidence, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recError) {
      console.error('Error fetching receipts:', recError);
    } else {
      console.log('\n📋 Recent Receipts (Last 10):');
      console.log('─'.repeat(50));
      receipts.forEach((r, idx) => {
        console.log(`${idx + 1}. ${r.merchant}`);
        console.log(`   ID: ${r.id}`);
        console.log(`   Status: ${r.status}`);
        console.log(`   Category: ${r.category || '(none)'}`);
        console.log(`   Confidence: ${r.category_confidence ? (r.category_confidence * 100).toFixed(0) + '%' : '(none)'}`);
        console.log(`   Created: ${new Date(r.created_at).toLocaleString()}`);
        console.log();
      });
    }

    // Get recent predictions
    const { data: predictions, error: predError } = await supabase
      .from('predictions')
      .select('id, subject_id, method, category_id, confidence, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (predError) {
      console.error('Error fetching predictions:', predError);
    } else {
      console.log('\n🤖 Recent Predictions (Last 10):');
      console.log('─'.repeat(50));
      predictions.forEach((p, idx) => {
        console.log(`${idx + 1}. Receipt: ${p.subject_id}`);
        console.log(`   Method: ${p.method}`);
        console.log(`   Category ID: ${p.category_id}`);
        console.log(`   Confidence: ${(p.confidence * 100).toFixed(0)}%`);
        console.log(`   Created: ${new Date(p.created_at).toLocaleString()}`);
        console.log();
      });
    }
  } catch (error) {
    console.error('Error querying database:', error);
  }

  console.log('\n✨ Log collection complete!');
  console.log('\n💡 To view detailed logs in real-time:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/yoqpzwqlmdhaapnaufrm/functions');
  console.log('   2. Click on each function to see execution logs');
  console.log('   3. Filter by date/time to find specific requests');
}

collectLogs().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
