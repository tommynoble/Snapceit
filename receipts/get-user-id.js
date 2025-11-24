#!/usr/bin/env node

/**
 * Get User ID from Supabase
 * 
 * Authenticates with email/password and retrieves user ID
 * 
 * Usage: node get-user-id.js
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

// Support both VITE_ prefixed and non-prefixed env vars
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getUserId() {
  console.log('🔐 Authenticating with Supabase...\n');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'tommynoble71@gmail.com',
      password: 'Anomaa2012@!'
    });

    if (error) {
      console.error('❌ Authentication failed:', error.message);
      process.exit(1);
    }

    const userId = data.user.id;
    console.log('✅ Authentication successful!\n');
    console.log('📋 User Details:');
    console.log(`   Email: ${data.user.email}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Created: ${data.user.created_at}\n`);

    console.log('📝 Update setup-test-receipts.js with this user ID:');
    console.log(`   const userId = '${userId}';\n`);

    console.log('✅ Ready to run: node setup-test-receipts.js');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getUserId();
