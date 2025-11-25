// deno / supabase edge function
// Endpoint: POST /functions/v1/process-receipt
// Body: { receipt_id: string }
// Returns: { ok: true, category_id, category, confidence, method, category_source }
// 
// Purpose: Single source of truth for receipt categorization
// - Apply rules engine first (fast, free)
// - If rules don't match confidently, call Claude (intelligent fallback)
// - Pass line items to Claude for better reasoning
// - Store category_source to track which method was used

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

const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY");
const CLAUDE_MODEL = "claude-opus-4-1";
const CLAUDE_TIMEOUT = 8000;
const CLAUDE_TEMPERATURE = 0;

const RULES_CONFIDENCE_THRESHOLD = 0.75;

// Schedule C category map
const CATEGORY_MAP: Record<string, number> = {
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
};

function loadRules(): RulesPack {
  const raw = Deno.env.get("RULES_JSON");
  if (!raw) {
    console.warn("RULES_JSON not set, using default rules");
    return {
      version: "default",
      vendors: [],
      keywords: [],
      categoryMap: CATEGORY_MAP
    };
  }
  return JSON.parse(raw);
}

function getCategoryName(categoryId: number, rules: RulesPack): string {
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
  return r;
}

function normalizeText(s?: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyRules(rules: RulesPack, vendor_text: string, lineItems: any[] | null | undefined) {
  const hits: Array<{category_id:number; confidence:number; method:string; details:any}> = [];

  const vnorm = normalizeText(vendor_text);
  
  // Check vendor rules
  for (const rule of rules.vendors) {
    try {
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
    } catch (e) {
      console.warn("Vendor rule regex error", { pattern: rule.pattern, error: String(e) });
    }
  }

  // Check keyword rules in vendor + line items
  let bag = vnorm;
  if (lineItems && Array.isArray(lineItems)) {
    const itemTexts = lineItems
      .map((i: any) => i.description || "")
      .filter((t: string) => t)
      .join(" ");
    bag += " " + normalizeText(itemTexts);
  }

  for (const rule of rules.keywords) {
    try {
      const re = new RegExp(`\\b(${rule.pattern})\\b`, "i");
      if (re.test(bag)) {
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
    } catch (e) {
      console.warn("Keyword rule regex error", { pattern: rule.pattern, error: String(e) });
    }
  }

  return hits.sort((a,b) => b.confidence - a.confidence)[0] ?? null;
}

async function callClaude(prompt: string): Promise<any> {
  if (!CLAUDE_API_KEY) {
    throw new Error("CLAUDE_API_KEY not set");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CLAUDE_TIMEOUT);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 256,
        temperature: CLAUDE_TEMPERATURE,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    console.info("Claude raw content", {
      model: data.model,
      stop_reason: data.stop_reason,
      text: content.substring(0, 400)
    });

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("No JSON found in Claude response", {
        text_preview: content.substring(0, 400)
      });
      throw new Error("No JSON found in Claude response");
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn("Failed to parse JSON from Claude response", {
        text_preview: jsonMatch[0].substring(0, 400),
        error: String(e)
      });
      throw e;
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Claude API timeout");
    }
    throw error;
  }
}

async function upsertPrediction(
  subject_type: "receipt" | "line_item",
  subject_id: string,
  category_id: number,
  confidence: number,
  method: "rule" | "ml" | "llm" | "ensemble",
  version: string,
  details: any
) {
  const { error } = await supabase.from("predictions").insert({
    subject_type,
    subject_id,
    category_id,
    confidence,
    method,
    version,
    details,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.warn("Failed to upsert prediction", { error });
  }
}

async function finalizeReceipt(
  receipt_id: string,
  category_id: number,
  confidence: number,
  category_name: string,
  category_source: "rules" | "claude"
) {
  const { error } = await supabase
    .from("receipts_v2")
    .update({
      category_id,
      category: category_name,
      category_confidence: confidence,
      category_source: category_source,
      status: "categorized",
      updated_at: new Date().toISOString()
    })
    .eq("id", receipt_id);

  if (error) throw error;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405
    });
  }

  try {
    const { receipt_id } = await req.json();

    if (!receipt_id) {
      return new Response(JSON.stringify({ error: "receipt_id required" }), {
        status: 400
      });
    }

    const rules = loadRules();
    const receipt = await fetchReceipt(receipt_id);

    console.info("Processing receipt", {
      receipt_id,
      merchant: receipt.merchant,
      total: receipt.total
    });

    // Step 1: Apply rules engine
    const vendorText = receipt.merchant || receipt.vendor_text || "";
    const lineItems = receipt.line_items_json || null;
    
    const rulesResult = applyRules(rules, vendorText, lineItems);

    console.info("Rules engine result", {
      receipt_id,
      matched: !!rulesResult,
      confidence: rulesResult?.confidence || null
    });

    // Step 2: If rules matched with high confidence, use it
    if (rulesResult && rulesResult.confidence >= RULES_CONFIDENCE_THRESHOLD) {
      const categoryName = getCategoryName(rulesResult.category_id, rules);
      
      await upsertPrediction(
        "receipt",
        receipt_id,
        rulesResult.category_id,
        rulesResult.confidence,
        "rule",
        `rules@${rules.version}`,
        rulesResult.details
      );

      await finalizeReceipt(
        receipt_id,
        rulesResult.category_id,
        rulesResult.confidence,
        categoryName,
        "rules"
      );

      console.info("Categorized by rules", {
        receipt_id,
        category: categoryName,
        confidence: rulesResult.confidence
      });

      return new Response(
        JSON.stringify({
          ok: true,
          receipt_id,
          category_id: rulesResult.category_id,
          category: categoryName,
          confidence: rulesResult.confidence,
          method: "rule",
          category_source: "rules"
        }),
        { status: 200 }
      );
    }

    // Step 3: Rules didn't match or low confidence, try Claude
    console.info("Rules insufficient, calling Claude", {
      receipt_id,
      rulesConfidence: rulesResult?.confidence || null
    });

    // Build Claude prompt with line items
    const receiptForClaude = {
      vendor_name: vendorText,
      total: receipt.total,
      subtotal: receipt.subtotal,
      tax: receipt.tax,
      date: receipt.receipt_date,
      line_items: lineItems,
      raw_ocr_snippet: receipt.raw_ocr?.substring(0, 200)
    };

    const claudePrompt = `You are an expert receipt categorizer for US Schedule C business expenses.

You will receive structured data from a receipt: vendor name, totals, tax, date, and line items.
Your job is to return ONE best Schedule C expense category for the entire receipt.

Allowed categories (name → id):
- Advertising: 1
- Car and Truck Expenses: 2
- Commissions and Fees: 3
- Contract Labor: 4
- Depletion: 5
- Depreciation: 6
- Employee Benefit Programs: 7
- Insurance (other than health): 8
- Interest - Mortgage: 9
- Interest - Other: 10
- Legal and Professional Services: 11
- Office Expense: 12
- Pension and Profit-Sharing Plans: 13
- Rent or Lease - Vehicles and Equipment: 14
- Rent or Lease - Other Business Property: 15
- Repairs and Maintenance: 16
- Supplies: 17
- Taxes and Licenses: 18
- Travel: 19
- Meals: 20
- Utilities: 21
- Wages: 22
- Other Expenses: 23

Guidance:
- Meals: restaurants, cafes, bars, food service, dining establishments
- Supplies: retail stores, supermarkets, hardware stores, office supplies, merchandise
- Travel: flights, hotels, transportation, lodging
- Utilities: telecom, ISP, power, phone services
- Office Expense: software, SaaS, shipping, office services
- Repairs and Maintenance: repairs, auto service, maintenance
- Car and Truck Expenses: gas, fuel, vehicle maintenance
- Other Expenses: anything that doesn't fit above

Receipt Data:
${JSON.stringify(receiptForClaude, null, 2)}

Analyze the vendor name and LINE ITEMS to determine the best category. Be confident (0.65–0.95) if the category is clear.

Return ONLY a JSON object with:
- "category": the category name string
- "confidence": a number between 0 and 1
- "reasoning": a short explanation`;

    let claudeResult;
    try {
      claudeResult = await callClaude(claudePrompt);
      console.info("Claude call succeeded", { receipt_id });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("Claude call failed", { receipt_id, error: errorMsg });
      
      // If Claude fails and rules had some match, use rules as fallback
      if (rulesResult) {
        const categoryName = getCategoryName(rulesResult.category_id, rules);
        await finalizeReceipt(
          receipt_id,
          rulesResult.category_id,
          rulesResult.confidence,
          categoryName,
          "rules"
        );
        
        return new Response(
          JSON.stringify({
            ok: true,
            receipt_id,
            category_id: rulesResult.category_id,
            category: categoryName,
            confidence: rulesResult.confidence,
            method: "rule",
            category_source: "rules",
            note: "Claude failed, fell back to rules"
          }),
          { status: 200 }
        );
      }

      // No rules match and Claude failed, mark as uncategorized
      await supabase
        .from("receipts_v2")
        .update({
          status: "categorized",
          category_id: null,
          category: null,
          category_confidence: null,
          category_source: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", receipt_id);

      return new Response(
        JSON.stringify({
          ok: false,
          reason: "uncategorized",
          receipt_id,
          error: errorMsg
        }),
        { status: 200 }
      );
    }

    // Validate Claude response
    const category = claudeResult?.category;
    const confidence = Math.min(claudeResult?.confidence || 0.7, 0.95);

    console.info("Claude response validation", {
      receipt_id,
      category,
      hasCategory: !!category,
      inMap: category ? !!CATEGORY_MAP[category] : false
    });

    if (!category || !CATEGORY_MAP[category]) {
      console.warn("Invalid category from Claude", {
        receipt_id,
        category
      });

      // Fall back to rules if available
      if (rulesResult) {
        const categoryName = getCategoryName(rulesResult.category_id, rules);
        await finalizeReceipt(
          receipt_id,
          rulesResult.category_id,
          rulesResult.confidence,
          categoryName,
          "rules"
        );
        
        return new Response(
          JSON.stringify({
            ok: true,
            receipt_id,
            category_id: rulesResult.category_id,
            category: categoryName,
            confidence: rulesResult.confidence,
            method: "rule",
            category_source: "rules",
            note: "Claude returned invalid category, fell back to rules"
          }),
          { status: 200 }
        );
      }

      // Mark as uncategorized
      await supabase
        .from("receipts_v2")
        .update({
          status: "categorized",
          category_id: null,
          category: null,
          category_confidence: null,
          category_source: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", receipt_id);

      return new Response(
        JSON.stringify({
          ok: false,
          reason: "uncategorized",
          receipt_id
        }),
        { status: 200 }
      );
    }

    const category_id = CATEGORY_MAP[category];

    console.info("Claude categorization successful", {
      receipt_id,
      category,
      category_id,
      confidence,
      reasoning: claudeResult.reasoning
    });

    // Record prediction
    await upsertPrediction(
      "receipt",
      receipt_id,
      category_id,
      confidence,
      "llm",
      `claude@${CLAUDE_MODEL}`,
      {
        vendor: vendorText,
        total: receipt.total,
        reasoning: claudeResult.reasoning || "No reasoning provided"
      }
    );

    // Finalize receipt
    await finalizeReceipt(receipt_id, category_id, confidence, category, "claude");

    return new Response(
      JSON.stringify({
        ok: true,
        receipt_id,
        category_id,
        category,
        confidence,
        method: "claude",
        category_source: "claude",
        reasoning: claudeResult.reasoning
      }),
      { status: 200 }
    );

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("Process receipt error", {
      error: errorMsg,
      stack: errorStack
    });
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
});
