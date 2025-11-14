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
  if (!raw) {
    // Return default rules if RULES_JSON not set
    console.warn("RULES_JSON not set, using default rules");
    return {
      version: "default",
      vendors: [],
      keywords: [],
      categoryMap: {
        "Other": 9,
        "Groceries": 10,
        "Fuel": 11,
        "Transport": 12,
        "Software": 13,
        "Meals": 15,
        "Travel": 7,
        "Shopping": 3,
        "Utilities": 5,
        "Healthcare": 6,
        "Entertainment": 4,
        "Business": 8,
        "Lodging": 14,
        "Phone & Internet": 16,
        "Office Supplies": 17,
        "Repairs & Maintenance": 18,
        "Subscriptions": 19,
        "Food & Dining": 1,
        "Transportation": 2
      }
    };
  }
  return JSON.parse(raw);
}

async function fetchReceipt(receipt_id: string) {
  const { data: r, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("id", receipt_id)
    .single();
  if (error) throw error;

  // Try to fetch line_items if the table exists, otherwise use empty array
  let items = [];
  try {
    const { data: liData, error: liErr } = await supabase
      .from("line_items")
      .select("id,description,total")
      .eq("receipt_id", receipt_id);
    if (!liErr && liData) {
      items = liData;
    }
  } catch (e) {
    console.warn("line_items table not found, using empty array");
  }

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

    // Apply rules - handle different column names
    const vendorText = receipt.vendor_text || receipt.merchant || receipt.merchant_name || "";
    let best = applyRules(rules, vendorText, items ?? []);
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
