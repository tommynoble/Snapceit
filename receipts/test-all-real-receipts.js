#!/usr/bin/env node

/**
 * Test Claude with ALL real receipts using vision to extract line items
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
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
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
                text: `Extract receipt information from this image. Return ONLY valid JSON:
{
  "vendor": "store/restaurant name",
  "items": ["item 1", "item 2", "item 3"],
  "total": 0.00,
  "confidence": 0.0
}
Return ONLY the JSON, no other text.`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    return null;
  }
}

async function testAllReceipts() {
  console.log('🧪 Testing Claude with ALL Real Receipt Images');
  console.log('==============================================\n');

  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'tommynoble71@gmail.com');

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  const receiptsDir = path.join(__dirname, '../public/test_reciepts');
  const files = fs.readdirSync(receiptsDir)
    .filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.webp'));

  console.log(`📁 Found ${files.length} receipt images\n`);

  const results = [];
  let processed = 0;

  for (const file of files) {
    processed++;
    console.log(`[${processed}/${files.length}] 📝 ${file}`);
    
    const imagePath = path.join(receiptsDir, file);

    try {
      const extractedData = await extractReceiptWithVision(imagePath);
      
      if (!extractedData) {
        console.log(`   ⚠️  Extraction failed`);
        results.push({ file, success: false, reason: 'extraction_failed' });
        continue;
      }

      console.log(`   Vendor: ${extractedData.vendor}`);
      console.log(`   Items: ${extractedData.items.slice(0, 2).join(', ')}${extractedData.items.length > 2 ? '...' : ''}`);

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
        console.log(`   ❌ Insert failed`);
        continue;
      }

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
        console.log(`   ✅ ${categoryData.category} (${(categoryData.confidence * 100).toFixed(0)}%, ${categoryData.method})`);
        results.push({
          file,
          vendor: extractedData.vendor,
          category: categoryData.category,
          confidence: categoryData.confidence,
          method: categoryData.method,
          success: true
        });
      } else {
        console.log(`   ⚠️  Uncategorized`);
        results.push({
          file,
          vendor: extractedData.vendor,
          success: false,
          reason: categoryData.reason
        });
      }
    } catch (error) {
      console.log(`   ❌ Error`);
      results.push({ file, success: false, error: error.message });
    }
  }

  // Summary
  console.log('\n\n📊 FINAL SUMMARY');
  console.log('================');
  const categorized = results.filter(r => r.success).length;
  console.log(`Total Receipts: ${results.length}`);
  console.log(`✅ Categorized: ${categorized}`);
  console.log(`❌ Not Categorized: ${results.length - categorized}`);
  console.log(`Success Rate: ${((categorized / results.length) * 100).toFixed(1)}%`);

  console.log('\n📋 Breakdown by Category:');
  const byCategory = {};
  results.filter(r => r.success).forEach(r => {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  });
  Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });

  console.log('\n📋 Breakdown by Method:');
  const byMethod = {};
  results.filter(r => r.success).forEach(r => {
    byMethod[r.method] = (byMethod[r.method] || 0) + 1;
  });
  Object.entries(byMethod).forEach(([method, count]) => {
    console.log(`   ${method}: ${count}`);
  });

  console.log('\n✨ Test complete!');
}

testAllReceipts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
