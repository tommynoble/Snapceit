#!/usr/bin/env node

/**
 * Fetch Supabase Function logs via REST API
 * Note: This requires SUPABASE_ACCESS_TOKEN or checking dashboard
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const PROJECT_ID = SUPABASE_URL?.split('//')[1]?.split('.')[0];

console.log('📋 Supabase Function Logs');
console.log('=========================\n');

if (!PROJECT_ID) {
  console.error('❌ Could not extract project ID from SUPABASE_URL');
  console.log(`SUPABASE_URL: ${SUPABASE_URL}`);
  process.exit(1);
}

console.log(`Project ID: ${PROJECT_ID}`);
console.log(`\n📍 To view logs, visit:`);
console.log(`   https://supabase.com/dashboard/project/${PROJECT_ID}/functions`);
console.log(`\n📌 Look for:`);
console.log(`   - "Claude request input summary" (what categorize sends to Claude)`);
console.log(`   - "Claude categorize input summary" (what Claude receives)`);
console.log(`   - "Claude raw content" (Claude's actual response)`);
console.log(`   - "Claude parsed result" (parsed category/confidence)`);
console.log(`   - "No JSON found" or "Failed to parse JSON" (errors)`);
console.log(`\n⏱️  Most recent logs are at the top. Filter by function: "categorize" or "claude-categorize"`);
