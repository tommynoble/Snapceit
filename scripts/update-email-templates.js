#!/usr/bin/env node

/**
 * Script to update Supabase email templates via Management API
 * Usage: node scripts/update-email-templates.js
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
const apiKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !apiKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nTo get SERVICE_ROLE_KEY:');
  console.error('1. Go to Supabase Dashboard');
  console.error('2. Project Settings → API');
  console.error('3. Copy "service_role" key');
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

// Function to make API request using fetch
async function makeRequest(method, templateType, data) {
  const url = `https://api.supabase.com/v1/projects/${projectId}/auth/email-templates/${templateType}`;
  
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const body = await response.text();
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch {
      parsedBody = body;
    }

    return {
      status: response.status,
      body: parsedBody,
    };
  } catch (error) {
    throw error;
  }
}

// Update templates
async function updateTemplates() {
  try {
    // Update confirmation template
    console.log('📤 Updating confirmation template...');
    const confirmRes = await makeRequest('PUT', 'confirmation', {
      template: confirmationTemplate,
    });

    if (confirmRes.status === 200 || confirmRes.status === 204) {
      console.log('✅ Confirmation template updated successfully\n');
    } else {
      console.error('❌ Failed to update confirmation template:', confirmRes.body);
      process.exit(1);
    }

    // Update reset password template
    console.log('📤 Updating reset password template...');
    const resetRes = await makeRequest('PUT', 'recovery', {
      template: resetPasswordTemplate,
    });

    if (resetRes.status === 200 || resetRes.status === 204) {
      console.log('✅ Reset password template updated successfully\n');
    } else {
      console.error('❌ Failed to update reset password template:', resetRes.body);
      process.exit(1);
    }

    console.log('🎉 All email templates updated successfully!');
  } catch (error) {
    console.error('❌ Error updating templates:', error.message);
    process.exit(1);
  }
}

updateTemplates();
