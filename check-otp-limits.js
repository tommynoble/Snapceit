#!/usr/bin/env node

/**
 * Check Supabase OTP rate limit settings
 * Usage: node check-otp-limits.js
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

async function checkOtpLimits() {
  console.log('🔍 Checking Supabase OTP Rate Limits...\n');

  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch auth config');
      const error = await response.text();
      console.error('Error:', error);
      process.exit(1);
    }

    const config = await response.json();
    
    console.log('📋 Current Auth Configuration:\n');
    
    // Look for OTP/rate limit related settings
    const relevantKeys = Object.keys(config).filter(key => 
      key.includes('otp') || 
      key.includes('rate') || 
      key.includes('limit') ||
      key.includes('mailer')
    );

    if (relevantKeys.length > 0) {
      relevantKeys.forEach(key => {
        console.log(`${key}: ${JSON.stringify(config[key], null, 2)}`);
      });
    } else {
      console.log('Full config:');
      console.log(JSON.stringify(config, null, 2));
    }

    console.log('\n✅ Check complete. Look for OTP rate limit settings above.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkOtpLimits();
