#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('You need to manually run this SQL in Supabase SQL Editor:');
  console.error('ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLS() {
  console.log('🔓 Disabling RLS on receipts table...\n');

  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;'
    });

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    console.log('✅ RLS disabled successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

disableRLS();
