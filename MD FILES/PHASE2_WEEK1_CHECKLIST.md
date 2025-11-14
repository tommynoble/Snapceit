# 🚀 Phase 2 - Week 1 Implementation Checklist

## Goal
Set up database schema and rules engine for intelligent categorization pipeline.

**Deliverable:** POST /functions/v1/categorize works with rules-based classification

---

## ✅ Step 1: Database Migration (1-2 hours)

### 1.1 Run Schema Migration
```bash
# In Supabase SQL Editor, run:
# 1. Copy entire supabase-schema-phase2.sql
# 2. Paste into SQL Editor
# 3. Click "Run"
```

**What it does:**
- Creates enums: `prediction_subject`, `prediction_method`
- Creates tables: `vendors`, `predictions`, `corrections`, `line_items`, `features`
- Updates: `receipts`, `categories` with new columns
- Adds indexes for performance
- Enables RLS policies
- Inserts default vendors (Tesco, Shell, Uber, AWS, etc.)
- Updates categories with tax codes

**Files:**
- ✅ `supabase-schema-phase2.sql` (created)

**Verification:**
```sql
-- Run in Supabase SQL Editor to verify
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- Should see: vendors, predictions, corrections, line_items, features
```

---

## ✅ Step 2: Create Rules Configuration (30 min)

**What it does:**
- Defines vendor patterns (Tesco, Shell, Uber, AWS, etc.)
- Defines keyword patterns (fuel, ride, domain, meal, etc.)
- Maps categories to IDs
- Sets confidence scores per rule

**Files:**
- ✅ `rules.json` (created)

**Structure:**
```json
{
  "version": "2025-11-08",
  "categoryMap": { "Groceries": 1, "Fuel": 2, ... },
  "vendors": [ { "pattern": "...", "category": "...", "confidence": 0.78 }, ... ],
  "keywords": [ { "pattern": "...", "category": "...", "confidence": 0.7 }, ... ]
}
```

**How to Edit:**
1. Add new vendor patterns to `vendors` array
2. Add new keyword patterns to `keywords` array
3. Increment `version` when publishing
4. Commit to git

---

## ✅ Step 3: Deploy Edge Function (2-3 hours)

### 3.1 Create Edge Function File

**File:** `supabase/functions/categorize/index.ts`

```typescript
// deno / supabase edge function
// Endpoint: POST /functions/v1/categorize
// Body: { receipt_id: string, min_confidence?: number }
// Returns: { ok: true, category_id, confidence, method }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Rule = {
  type: "vendor" | "keyword";
  pattern: string;
  category: string;
  confidence?: number;
};

type RulesPack = {
  version: string;
  vendors: Rule[];
  keywords: Rule[];
  categoryMap: Record<string, number>;
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const DEFAULT_MIN_CONF = 0.75;

function loadRules(): RulesPack {
  const raw = Deno.env.get("RULES_JSON");
  if (!raw) throw new Error("RULES_JSON not set");
  return JSON.parse(raw);
}

async function fetchReceipt(receipt_id: string) {
  const { data: r, error } = await supabase
    .from("receipts")
    .select("id,user_id,vendor_text,total_amount,currency,receipt_date,country,ocr_json,ocr_confidence")
    .eq("id", receipt_id)
    .single();
  if (error) throw error;

  const { data: items, error: liErr } = await supabase
    .from("line_items")
    .select("id,description,total")
    .eq("receipt_id", receipt_id);
  if (liErr) throw liErr;

  return { receipt: r, items };
}

function normalizeText(s?: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyRules(rules: RulesPack, vendor_text: string, items: Array<{description: string}>) {
  const hits: Array<{category_id:number; confidence:number; method:string; details:any}> = [];

  const vnorm = normalizeText(vendor_text);
  for (const rule of rules.vendors) {
    const re = new RegExp(rule.pattern, "i");
    if (re.test(vnorm)) {
      const catId = rules.categoryMap[rule.category];
      if (catId) {
        hits.push({ 
          category_id: catId, 
          confidence: rule.confidence ?? 0.7, 
          method: "rule", 
          details: {source:"vendor", pattern:rule.pattern} 
        });
      }
    }
  }

  const bag = normalizeText(items.map(i => i.description).join(" "));
  for (const rule of rules.keywords) {
    const re = new RegExp(`\\b(${rule.pattern})\\b`, "i");
    if (re.test(bag) || re.test(vnorm)) {
      const catId = rules.categoryMap[rule.category];
      if (catId) {
        hits.push({ 
          category_id: catId, 
          confidence: rule.confidence ?? 0.65, 
          method: "rule", 
          details: {source:"keyword", pattern:rule.pattern} 
        });
      }
    }
  }

  return hits.sort((a,b) => b.confidence - a.confidence)[0] ?? null;
}

async function upsertPrediction(
  subject_type: "receipt"|"line_item", 
  subject_id: string, 
  category_id: number, 
  confidence: number, 
  method: "rule"|"ml"|"llm"|"ensemble", 
  version: string, 
  details?: any
) {
  const { error } = await supabase.from("predictions").insert({
    subject_type, subject_id, category_id, confidence, method, version, details
  });
  if (error) throw error;
}

async function finalizeReceipt(receipt_id: string, category_id: number, confidence: number) {
  const { error } = await supabase
    .from("receipts")
    .update({ 
      category_id, 
      category_confidence: confidence, 
      status: "categorized", 
      updated_at: new Date().toISOString() 
    })
    .eq("id", receipt_id);
  if (error) throw error;
}

serve(async (req) => {
  try {
    const { receipt_id, min_confidence } = await req.json();
    if (!receipt_id) return new Response(JSON.stringify({ error: "receipt_id required" }), { status: 400 });

    const rules = loadRules();
    const { receipt, items } = await fetchReceipt(receipt_id);

    // Apply rules
    let best = applyRules(rules, receipt.vendor_text ?? "", items ?? []);
    if (best) {
      await upsertPrediction("receipt", receipt_id, best.category_id, best.confidence, "rule", `rules@${rules.version}`, best.details);
    }

    if (best) {
      // Record ensemble decision
      await upsertPrediction("receipt", receipt_id, best.category_id, best.confidence, "ensemble", `ensemble@${rules.version}`, { picked: best.method });
      await finalizeReceipt(receipt_id, best.category_id, best.confidence);
      return new Response(JSON.stringify({ ok: true, receipt_id, category_id: best.category_id, confidence: best.confidence }), { status: 200 });
    }

    // If nothing matched, mark for review
    const { error } = await supabase.from("receipts").update({ status: "ocr_done" }).eq("id", receipt_id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: false, reason: "no_match" }), { status: 200 });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
```

### 3.2 Deploy Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref yoqpzwqlmdhaapnaufrm

# Deploy function
supabase functions deploy categorize --no-verify-jwt

# Set environment variables
supabase secrets set RULES_JSON="$(cat rules.json)"
```

### 3.3 Test Locally

```bash
# Start Supabase locally
supabase start

# Test the function
curl -X POST http://localhost:54321/functions/v1/categorize \
  -H "Content-Type: application/json" \
  -d '{"receipt_id": "your-receipt-id"}'
```

**Expected Response:**
```json
{
  "ok": true,
  "receipt_id": "abc-123",
  "category_id": 1,
  "confidence": 0.78,
  "method": "rule"
}
```

---

## 📋 Verification Checklist

- [ ] Schema migration ran successfully (check tables in Supabase)
- [ ] `rules.json` created with vendor/keyword patterns
- [ ] Edge Function deployed to Supabase
- [ ] RULES_JSON environment variable set
- [ ] Test receipt categorizes correctly
- [ ] Predictions table has entries
- [ ] Confidence score is between 0-1

---

## 🎯 Next Steps (Week 2)

1. Add confidence UI to `RecentReceiptsCard.tsx`
2. Create corrections endpoint
3. Wire categorization to upload flow
4. Show "Review" chip for low confidence

---

## 📚 Files Created/Updated

**Created:**
- ✅ `supabase-schema-phase2.sql`
- ✅ `rules.json`
- ✅ `supabase/functions/categorize/index.ts`
- ✅ `PHASE2_WEEK1_CHECKLIST.md` (this file)

**Updated:**
- ✅ `IMPLEMENTATION_ROADMAP.md` (Phase 2 plan)

---

## ⏱️ Time Estimate

- Database migration: 30 min
- Rules configuration: 30 min
- Edge Function creation: 1.5 hours
- Testing & debugging: 1 hour
- **Total: ~3.5 hours**

---

## 🆘 Troubleshooting

**Issue: "RULES_JSON not set"**
- Solution: Run `supabase secrets set RULES_JSON="$(cat rules.json)"`

**Issue: "Service role key not found"**
- Solution: Use Supabase dashboard to get SERVICE_ROLE_KEY, add to `.env.local`

**Issue: "Receipt not found"**
- Solution: Make sure receipt exists in database with `vendor_text` populated

**Issue: "No match" response**
- Solution: Check if vendor/keyword patterns match the receipt text (case-insensitive)

---

**Ready to proceed? Start with Step 1! 🚀**
