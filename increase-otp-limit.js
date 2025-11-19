#!/usr/bin/env node

/**
 * Increase Supabase OTP rate limit
 * Usage: node increase-otp-limit.js
 */

import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl || !accessToken) {
  console.error('❌ Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

const projectRef = supabaseUrl.split('//')[1].split('.')[0];

async function increaseOtpLimit() {
  console.log('📈 Increasing Supabase OTP Rate Limit...\n');

  try {
    console.log('Current limit: 2 requests/minute');
    console.log('New limit: 100 requests/minute\n');

    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        rate_limit_email_sent: 100,
      }),
    });

    if (!response.ok) {
      console.error('❌ Failed to update rate limit');
      const error = await response.text();
      console.error('Error:', error);
      process.exit(1);
    }

    console.log('✅ OTP rate limit increased successfully!');
    console.log('📧 You can now send up to 100 OTP emails per minute');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

increaseOtpLimit();
