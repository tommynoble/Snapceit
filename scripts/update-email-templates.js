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
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nTo get SERVICE_ROLE_KEY:');
  console.error('1. Go to Supabase Dashboard');
  console.error('2. Project Settings → API');
  console.error('3. Copy "service_role" key (the long secret one)');
  console.error('4. Add to .env: VITE_SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  process.exit(1);
}

// Extract project ID from URL
const projectId = supabaseUrl.split('//')[1].split('.')[0];

// Read email templates
const confirmationPath = path.join(__dirname, '../supabase/email-templates/confirmation.html');
const resetPasswordPath = path.join(__dirname, '../supabase/email-templates/reset-password.html');

if (!fs.existsSync(confirmationPath) || !fs.existsSync(resetPasswordPath)) {
  console.error('❌ Error: Email template files not found');
  process.exit(1);
}

const confirmationTemplate = fs.readFileSync(confirmationPath, 'utf-8');
const resetPasswordTemplate = fs.readFileSync(resetPasswordPath, 'utf-8');

console.log('📧 Updating Supabase email templates...\n');

// Update templates via REST API
async function updateTemplates() {
  try {
    // Update confirmation template
    console.log('📤 Updating confirmation template...');
    const confirmRes = await fetch(`${supabaseUrl}/auth/v1/admin/email-templates/confirm`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        template: confirmationTemplate,
      }),
    });

    if (!confirmRes.ok) {
      const error = await confirmRes.text();
      console.error('❌ Failed to update confirmation template:', error);
      process.exit(1);
    }
    console.log('✅ Confirmation template updated successfully\n');

    // Update reset password template
    console.log('📤 Updating reset password template...');
    const resetRes = await fetch(`${supabaseUrl}/auth/v1/admin/email-templates/recovery`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        template: resetPasswordTemplate,
      }),
    });

    if (!resetRes.ok) {
      const error = await resetRes.text();
      console.error('❌ Failed to update reset password template:', error);
      process.exit(1);
    }
    console.log('✅ Reset password template updated successfully\n');

    console.log('🎉 All email templates updated successfully!');
  } catch (error) {
    console.error('❌ Error updating templates:', error.message);
    process.exit(1);
  }
}

updateTemplates();
