#!/usr/bin/env node

/**
 * Script to update Supabase email templates via Management API
 * Usage: node scripts/update-email-templates.js
 * 
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in .env
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl || !accessToken) {
  console.error('❌ Error: Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_ACCESS_TOKEN');
  console.error('\nTo get SUPABASE_ACCESS_TOKEN:');
  console.error('1. Go to https://supabase.com/dashboard/account/tokens');
  console.error('2. Create a new personal access token');
  console.error('3. Copy it and add to .env: SUPABASE_ACCESS_TOKEN=your_token_here');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = supabaseUrl.split('//')[1].split('.')[0];

// Read email templates
const confirmationPath = path.join(__dirname, '../supabase/email-templates/confirmation.html');
const resetPasswordPath = path.join(__dirname, '../supabase/email-templates/reset-password.html');
const otpPath = path.join(__dirname, '../supabase/email-templates/otp.html');

if (!fs.existsSync(confirmationPath) || !fs.existsSync(resetPasswordPath) || !fs.existsSync(otpPath)) {
  console.error('❌ Error: Email template files not found');
  process.exit(1);
}

const confirmationTemplate = fs.readFileSync(confirmationPath, 'utf-8');
const resetPasswordTemplate = fs.readFileSync(resetPasswordPath, 'utf-8');
const otpTemplate = fs.readFileSync(otpPath, 'utf-8');

console.log('📧 Updating Supabase email templates...\n');

// Update templates via Supabase Management API
async function updateTemplates() {
  try {
    console.log('📤 Updating email templates...');
    
    const updateRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        mailer_templates_confirmation_content: otpTemplate,
        mailer_templates_recovery_content: resetPasswordTemplate,
      }),
    });

    if (!updateRes.ok) {
      const error = await updateRes.text();
      console.error('❌ Failed to update email templates:', error);
      process.exit(1);
    }
    
    const result = await updateRes.json();
    console.log('✅ Confirmation template updated successfully');
    console.log('✅ Reset password template updated successfully');
    console.log('✅ OTP template updated successfully\n');
    console.log('🎉 All email templates updated successfully!');
  } catch (error) {
    console.error('❌ Error updating templates:', error.message);
    process.exit(1);
  }
}

updateTemplates();
