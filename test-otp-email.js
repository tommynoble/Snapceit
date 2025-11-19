#!/usr/bin/env node

/**
 * Test script to verify OTP email sending
 * Usage: node test-otp-email.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testOtpEmail() {
  console.log('🧪 Testing OTP Email Sending...\n');

  // Test email (use your own email to receive the test)
  const testEmail = 'test@example.com'; // CHANGE THIS TO YOUR EMAIL

  try {
    console.log(`📧 Sending OTP to: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
    });

    if (error) {
      console.error('❌ Error sending OTP:', error.message);
      process.exit(1);
    }

    console.log('✅ OTP sent successfully!');
    console.log('\n📋 Response:', JSON.stringify(data, null, 2));
    console.log('\n✅ Check your email for the OTP code');
    console.log('💡 The email should contain a 6-digit code');
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testOtpEmail();
