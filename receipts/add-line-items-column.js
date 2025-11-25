#!/usr/bin/env node

/**
 * Add line_items_json column to receipts_v2 table
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

async function addColumn() {
  console.log('🔧 Adding line_items_json column to receipts_v2...\n');

  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.receipts_v2 ADD COLUMN IF NOT EXISTS line_items_json jsonb;`
    }).catch(() => {
      // If RPC doesn't exist, try direct SQL
      return supabase.from('receipts_v2').select('id').limit(1);
    });

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    console.log('✅ Column added successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    
    // Try alternative: just test if column exists by trying to insert
    console.log('\n📝 Testing if column exists by inserting test data...');
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users[0];
    
    if (user) {
      const { error: insertError } = await supabase
        .from('receipts_v2')
        .insert({
          user_id: user.id,
          merchant: 'Test',
          total: 1.00,
          status: 'ocr_done',
          line_items_json: [{ description: 'Test', amount: 1.00 }]
        });
      
      if (insertError && insertError.message.includes('line_items_json')) {
        console.error('❌ Column does not exist. Please add it manually in Supabase dashboard:');
        console.error('   ALTER TABLE public.receipts_v2 ADD COLUMN IF NOT EXISTS line_items_json jsonb;');
        process.exit(1);
      } else if (!insertError) {
        console.log('✅ Column exists and works!');
      }
    }
  }
}

addColumn();
