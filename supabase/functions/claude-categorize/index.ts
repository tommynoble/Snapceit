import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY");
const CLAUDE_MODEL = "claude-opus-4-1"; // Latest Claude model
const CLAUDE_TIMEOUT = 8000; // 8 seconds
const CLAUDE_TEMPERATURE = 0; // Deterministic

// Schedule C category map (must match categorize function)
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

async function fetchReceipt(receipt_id: string) {
  const { data: receipt, error } = await supabase
    .from("receipts_v2")
    .select("*")
    .eq("id", receipt_id)
    .single();

  if (error) throw error;
  return receipt;
}

function stripPII(text: string): string {
  // Remove common PII patterns
  let stripped = text
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]") // Phone numbers
    .replace(/\b\d{5}(?:-\d{4})?\b/g, "[ZIP]") // ZIP codes
    .replace(/\b[A-Z]{2}\s\d{5}\b/g, "[ADDRESS]") // State + ZIP
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]"); // Emails

  return stripped;
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
  category_name: string
) {
  const { error } = await supabase
    .from("receipts_v2")
    .update({
      category_id,
      category: category_name,
      category_confidence: confidence,
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

    // Fetch receipt
    const receipt = await fetchReceipt(receipt_id);

    // Build prompt with receipt data
    const categoryNames = Object.keys(CATEGORY_MAP).join(", ");
    const vendorInfo = receipt.merchant || receipt.vendor_text || "Unknown";
    const totalInfo = receipt.total ? `${receipt.total}` : "Unknown";
    const dateInfo = receipt.receipt_date || receipt.date || "Unknown";
    const subtotalInfo = receipt.subtotal ? `${receipt.subtotal}` : null;
    const taxInfo = receipt.tax ? `${receipt.tax}` : null;
    const rawOcr = receipt.raw_ocr || null;

    // Strip PII from vendor
    const cleanVendor = stripPII(vendorInfo);
    console.info("Claude categorize input summary", {
      receipt_id,
      vendor: cleanVendor,
      total: totalInfo,
      date: dateInfo
    });

    // Build detailed receipt context with all extracted fields
    let receiptContext = `Receipt Details:
- Vendor: ${cleanVendor}
- Total: ${totalInfo}`;
    
    if (subtotalInfo) receiptContext += `\n- Subtotal: ${subtotalInfo}`;
    if (taxInfo) receiptContext += `\n- Tax: ${taxInfo}`;
    if (dateInfo && dateInfo !== "Unknown") receiptContext += `\n- Date: ${dateInfo}`;
    if (receipt.tax_breakdown) receiptContext += `\n- Tax Breakdown: ${JSON.stringify(receipt.tax_breakdown)}`;
    if (receipt.tax_rate) receiptContext += `\n- Tax Rate: ${(receipt.tax_rate * 100).toFixed(1)}%`;

    // Add raw OCR data if available
    let ocrSection = "";
    if (rawOcr) {
      // rawOcr is now the actual OCR text (string), not metadata object
      const ocrText = typeof rawOcr === 'string' ? rawOcr : JSON.stringify(rawOcr);
      ocrSection = `\nRaw Textract Lines:
${ocrText}`;
    }

    const prompt = `You are an expert receipt categorizer for business expenses. Output only strict JSON with these fields:
{
  "category": "<one of the Schedule C names>",
  "category_id": <matching id>,
  "confidence": 0.0–1.0,
  "reasoning": "<short rationale>"
}

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
${receiptContext}${ocrSection}

Analyze the vendor name and receipt items to determine the best category. Be confident (0.65–0.95) if the category is clear. Return ONLY valid JSON.`;

    // Call Claude with timeout
    let claudeResult;
    try {
      claudeResult = await callClaude(prompt);
      console.info("Claude call succeeded", { receipt_id });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("Claude call failed", { receipt_id, error: errorMsg });
      // Return null to signal fallback to rules
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "claude_failed",
          error: errorMsg
        }),
        { status: 200 }
      );
    }

    // Validate Claude response
    const category = claudeResult?.category;
    const confidence = Math.min(claudeResult?.confidence || 0.7, 0.85); // Cap at 0.85

    console.info("Claude response validation", {
      receipt_id,
      category,
      hasCategory: !!category,
      inMap: category ? !!CATEGORY_MAP[category] : false
    });

    if (!category || !CATEGORY_MAP[category]) {
      console.warn("Invalid category from Claude", {
        receipt_id,
        category,
        availableCategories: Object.keys(CATEGORY_MAP)
      });
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "invalid_category",
          category
        }),
        { status: 200 }
      );
    }

    const category_id = CATEGORY_MAP[category];
    console.info("Claude parsed result", {
      receipt_id,
      category,
      category_id,
      confidence
    });

    // Log prediction with reasoning
    await upsertPrediction(
      "receipt",
      receipt_id,
      category_id,
      confidence,
      "llm",
      `claude@${CLAUDE_MODEL}`,
      { 
        vendor: cleanVendor, 
        total: totalInfo,
        reasoning: claudeResult.reasoning || "No reasoning provided"
      }
    );

    // Update receipt
    await finalizeReceipt(receipt_id, category_id, confidence, category);

    console.info("Claude categorization successful", {
      receipt_id,
      category,
      category_id,
      confidence,
      reasoning: claudeResult.reasoning
    });

    return new Response(
      JSON.stringify({
        ok: true,
        receipt_id,
        category_id,
        category,
        confidence,
        method: "claude"
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Claude categorize error", { error: error.message });
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message
      }),
      { status: 500 }
    );
  }
});
