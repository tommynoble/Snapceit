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
        // Schedule C-aligned defaults
        "Advertising": 1,
        "Car and Truck Expenses": 2,
        "Commissions and Fees": 3,
        "Contract Labor": 4,
        "Depletion": 5,
        "Depreciation": 6,
        "Employee Benefit Programs": 7,
        "Insurance (other than health)": 8,
        "Interest - Mortgage": 9,
        "Interest - Other": 10,
        "Legal and Professional Services": 11,
        "Office Expense": 12,
        "Pension and Profit-Sharing Plans": 13,
        "Rent or Lease - Vehicles and Equipment": 14,
        "Rent or Lease - Other Business Property": 15,
        "Repairs and Maintenance": 16,
        "Supplies": 17,
        "Taxes and Licenses": 18,
        "Travel": 19,
        "Meals": 20,
        "Utilities": 21,
        "Wages": 22,
        "Other Expenses": 23
      }
    };
  }
  return JSON.parse(raw);
}

function getCategoryName(categoryId: number, rules: RulesPack): string {
  // Reverse lookup: find category name by ID
  for (const [name, id] of Object.entries(rules.categoryMap)) {
    if (id === categoryId) return name;
  }
  return "Other";
}

async function fetchReceipt(receipt_id: string) {
  const { data: r, error } = await supabase
    .from("receipts_v2")
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

async function finalizeReceipt(receipt_id: string, category_id: number, confidence: number, category_name?: string) {
  const { error } = await supabase
    .from("receipts_v2")
    .update({ 
      category_id, 
      category_confidence: confidence, 
      category: category_name,
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

    // ALWAYS try Claude (for testing - will revert later)
    // TODO: Revert to threshold-based logic after testing
    console.info("Attempting Claude fallback", {
      receipt_id,
      rulesConfidence: best?.confidence || null
    });

    try {
      const claudeResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/claude-categorize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
          },
          body: JSON.stringify({ receipt_id })
        }
      );

      // Get response body as text first for logging
      const claudeText = await claudeResponse.text();
      console.info("Claude fallback response", {
        receipt_id,
        status: claudeResponse.status,
        body: claudeText.substring(0, 500) // Log first 500 chars
      });

      if (claudeResponse.ok) {
        let claudeData;
        try {
          claudeData = JSON.parse(claudeText);
        } catch (parseError) {
          console.warn("Failed to parse Claude response JSON", {
            receipt_id,
            error: String(parseError),
            body: claudeText
          });
          claudeData = {};
        }

        console.info("Claude response parsed", {
          receipt_id,
          claudeOk: claudeData.ok,
          hasCategoryId: !!claudeData.category_id,
          category: claudeData.category
        });
        
        if (claudeData.ok && claudeData.category_id) {
          console.info("Claude categorization successful", {
            receipt_id,
            category: claudeData.category,
            confidence: claudeData.confidence,
            method: "claude"
          });
          // Record prediction and finalize receipt with Claude result
          try {
            await upsertPrediction(
              "receipt",
              receipt_id,
              claudeData.category_id,
              claudeData.confidence ?? 0.65,
              "llm",
              `claude@${claudeData.version || "v1"}`,
              { reasoning: claudeData.reasoning || null }
            );
            console.info("Prediction recorded", { receipt_id });
          } catch (predError) {
            console.warn("Failed to record prediction", {
              receipt_id,
              error: String(predError)
            });
          }
          
          try {
            await finalizeReceipt(receipt_id, claudeData.category_id, claudeData.confidence ?? 0.65, claudeData.category);
            console.info("Receipt finalized", { receipt_id });
          } catch (finalError) {
            console.warn("Failed to finalize receipt", {
              receipt_id,
              error: String(finalError)
            });
          }
          
          return new Response(
            JSON.stringify({
              ok: true,
              receipt_id,
              category_id: claudeData.category_id,
              category: claudeData.category,
              confidence: claudeData.confidence,
              method: "claude"
            }),
            { status: 200 }
          );
        } else {
          console.warn("Claude returned ok:false or missing category_id", {
            receipt_id,
            claudeOk: claudeData.ok,
            reason: claudeData.reason,
            error: claudeData.error
          });
        }
      } else {
        console.warn("Claude HTTP error", {
          receipt_id,
          status: claudeResponse.status,
          statusText: claudeResponse.statusText,
          body: claudeText.substring(0, 500)
        });
      }
    } catch (claudeError) {
      console.warn("Claude fetch error", {
        receipt_id,
        error: String(claudeError)
      });
    }

    // If Claude also failed or low confidence, fall back to rules result if available
    if (best) {
      const categoryName = getCategoryName(best.category_id, rules);
      await finalizeReceipt(receipt_id, best.category_id, best.confidence, categoryName);
      return new Response(
        JSON.stringify({
          ok: true,
          receipt_id,
          category_id: best.category_id,
          category: categoryName,
          confidence: best.confidence,
          method: best.method,
          note: "Claude fallback failed, using rules result"
        }),
        { status: 200 }
      );
    }

    // If nothing matched at all, mark for review
    const { error } = await supabase.from("receipts_v2").update({ status: "ocr_done" }).eq("id", receipt_id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: false, reason: "no_match" }), { status: 200 });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
