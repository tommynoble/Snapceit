#!/usr/bin/env node

/**
 * Test Claude with real receipts using vision to extract line items
 * Claude analyzes the receipt image to extract vendor, items, and categorize
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

if (!CLAUDE_API_KEY) {
  console.error('❌ Missing CLAUDE_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function extractReceiptWithVision(imagePath) {
  console.log(`   🔍 Extracting receipt data with Claude vision...`);
  
  // Read image and convert to base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  // Determine media type from file extension
  const ext = path.extname(imagePath).toLowerCase();
  let mediaType = 'image/jpeg';
  if (ext === '.png') mediaType = 'image/png';
  else if (ext === '.webp') mediaType = 'image/webp';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: `Extract receipt information from this image. Return ONLY valid JSON with this exact structure:
{
  "vendor": "store/restaurant name",
  "items": ["item 1", "item 2", "item 3"],
  "total": 0.00,
  "confidence": 0.0
}

Focus on:
1. Vendor/store name at the top
2. Line items purchased (be specific about what was bought)
3. Total amount
4. Your confidence in the extraction (0.0-1.0)

Return ONLY the JSON, no other text.`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.log(`   ⚠️  Vision extraction failed: ${error.message}`);
    return null;
  }
}

async function testRealReceipts() {
  console.log('🧪 Testing Claude with Real Receipt Images (Vision + Categorization)');
  console.log('===================================================================\n');

  // Get user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'tommynoble71@gmail.com');

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  const receiptsDir = path.join(__dirname, '../public/test_reciepts');
  const files = fs.readdirSync(receiptsDir)
    .filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.webp'))
    .slice(0, 5); // Test first 5 for speed

  console.log(`📁 Found ${files.length} receipt images (testing first 5)\n`);

  const results = [];

  for (const file of files) {
    console.log(`📝 Processing: ${file}`);
    
    const imagePath = path.join(receiptsDir, file);

    try {
      // Extract receipt data using Claude vision
      const extractedData = await extractReceiptWithVision(imagePath);
      
      if (!extractedData) {
        console.log(`   ⚠️  Could not extract receipt data`);
        results.push({
          file,
          success: false,
          reason: 'extraction_failed'
        });
        console.log();
        continue;
      }

      console.log(`   ✅ Extracted:`);
      console.log(`      Vendor: ${extractedData.vendor}`);
      console.log(`      Items: ${extractedData.items.slice(0, 3).join(', ')}${extractedData.items.length > 3 ? '...' : ''}`);
      console.log(`      Total: $${extractedData.total}`);

      // Create receipt in database with extracted data
      const { data: receipt, error: insertError } = await supabase
        .from('receipts_v2')
        .insert({
          user_id: user.id,
          merchant: extractedData.vendor,
          total: extractedData.total || Math.random() * 500 + 10,
          subtotal: (extractedData.total || 100) * 0.9,
          tax: (extractedData.total || 100) * 0.1,
          receipt_date: new Date().toISOString().split('T')[0],
          raw_ocr: `Vendor: ${extractedData.vendor}\nItems: ${extractedData.items.join('\n')}`,
          status: 'ocr_done'
        })
        .select()
        .single();

      if (insertError) {
        console.log(`   ❌ Insert failed: ${insertError.message}`);
        continue;
      }

      console.log(`   ✅ Created receipt: ${receipt.id}`);

      // Call categorize function
      const categoryResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/categorize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ receipt_id: receipt.id })
        }
      );

      const categoryData = await categoryResponse.json();

      if (categoryData.ok && categoryData.category_id) {
        console.log(`   ✅ Category: ${categoryData.category}`);
        console.log(`      Confidence: ${(categoryData.confidence * 100).toFixed(0)}%`);
        console.log(`      Method: ${categoryData.method}`);
        results.push({
          file,
          vendor: extractedData.vendor,
          category: categoryData.category,
          confidence: categoryData.confidence,
          method: categoryData.method,
          success: true
        });
      } else {
        console.log(`   ⚠️  No category assigned`);
        console.log(`      Reason: ${categoryData.reason}`);
        results.push({
          file,
          vendor: extractedData.vendor,
          category: null,
          reason: categoryData.reason,
          success: false
        });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        file,
        error: error.message,
        success: false
      });
    }

    console.log();
  }

  // Summary
  console.log('\n📊 Summary');
  console.log('==========');
  const categorized = results.filter(r => r.success).length;
  console.log(`Total: ${results.length}`);
  console.log(`✅ Categorized: ${categorized}`);
  console.log(`❌ Not categorized: ${results.length - categorized}`);
  console.log(`Success Rate: ${((categorized / results.length) * 100).toFixed(0)}%`);

  console.log('\n📋 Results:');
  results.forEach(r => {
    if (r.success) {
      console.log(`   ✅ ${r.file}`);
      console.log(`      Vendor: ${r.vendor}`);
      console.log(`      → ${r.category} (${(r.confidence * 100).toFixed(0)}%, ${r.method})`);
    } else {
      console.log(`   ❌ ${r.file}`);
      console.log(`      → ${r.reason || r.error}`);
    }
  });

  console.log('\n✨ Test complete!');
}

testRealReceipts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
