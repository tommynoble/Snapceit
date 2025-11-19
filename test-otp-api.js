#!/usr/bin/env node

/**
 * Test OTP Email via Supabase API
 * Usage: node test-otp-api.js your-email@example.com
 */

import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const testEmail = process.argv[2] || 'test@example.com';

async function testOtpEmail() {
  console.log('🧪 Testing OTP Email via Supabase API\n');
  console.log(`📧 Email: ${testEmail}`);
  console.log(`🔗 URL: ${supabaseUrl}\n`);

  try {
    console.log('📤 Sending OTP request...\n');
    
    const response = await fetch(`${supabaseUrl}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      },
      body: JSON.stringify({
        email: testEmail,
        create_user: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error Response:', response.status);
      console.error('Details:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('✅ OTP Request Successful!\n');
    console.log('📋 Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n📧 Check your email for the OTP code');
    console.log('💡 The email should contain a 6-digit code');
    console.log('⏱️  Code expires in 1 hour');
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testOtpEmail();
