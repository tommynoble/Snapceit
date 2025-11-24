# Claude Fallback Issue - Debug Report

## Problem Statement
Claude categorization is working when called directly, but the `categorize` Edge Function is not properly handling Claude's response, resulting in "no_match" returns instead of categorizing unknown vendors.

## Current Status

### ✅ What's Working
- **Claude API**: Direct calls to `/functions/v1/claude-categorize` work perfectly
  - Returns: `{ ok: true, category_id: 20, category: "Meals", confidence: 0.75 }`
  - Example: El Fyle receipt → Meals (75%)
  
- **Rules Engine**: Known vendors categorize correctly
  - Lidl → Supplies (75%)
  - Marshalls → Supplies (75%)
  - Real → Meals (78%)

- **UI Display**: Categories show with confidence pills when populated

### ❌ What's Broken
- **Categorize Function**: Returns `{ ok: false, reason: "no_match" }` for unknown vendors
- **Claude Fallback**: Not being invoked properly from categorize function
- **El Fyle Receipts**: Stuck at status `ocr_done` with blank category

## Test Results

### Direct Claude Call (WORKS)
```bash
curl -X POST "$SUPABASE_URL/functions/v1/claude-categorize" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"receipt_id":"<id>"}'

# Response:
{
  "ok": true,
  "receipt_id": "78c7090c-d0d9-45e7-9c64-dfa8392a5945",
  "category_id": 20,
  "category": "Meals",
  "confidence": 0.75,
  "method": "claude"
}
```

### Categorize Function Call (FAILS)
```bash
curl -X POST "$SUPABASE_URL/functions/v1/categorize" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"receipt_id":"<id>"}'

# Response:
{
  "ok": false,
  "reason": "no_match"
}
```

## Root Cause Analysis

The issue is in `/supabase/functions/categorize/index.ts` (lines 200-291):

1. **Rules don't match** El Fyle (correct - it's unknown)
2. **Claude is called** (fetch to `/functions/v1/claude-categorize`)
3. **Claude returns success** (ok: true, category_id: 20, etc.)
4. **But categorize function returns "no_match"** instead of using Claude result

### Hypothesis
Claude response is being received but:
- Response body isn't being parsed correctly
- Response fields (ok, category_id) aren't being recognized
- OR there's a logic error preventing the success path from executing

## Enhanced Logging Deployed

Added comprehensive logging to categorize function (commit `2f9b3fa`):
```typescript
// Log full Claude response body (first 500 chars)
const claudeText = await claudeResponse.text();
console.info("Claude fallback response", {
  receipt_id,
  status: claudeResponse.status,
  body: claudeText.substring(0, 500)
});

// Safe JSON parsing with error handling
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

// Log parsed response fields
console.info("Claude response parsed", {
  receipt_id,
  claudeOk: claudeData.ok,
  hasCategoryId: !!claudeData.category_id,
  category: claudeData.category
});
```

## Next Steps for Senior Dev

1. **Check Supabase Edge Function Logs**
   - Go to Supabase Dashboard → Functions → categorize
   - Look for "Claude fallback response" log entries
   - This will show the exact response body from Claude
   - This will reveal why Claude response isn't being recognized

2. **Possible Issues to Investigate**
   - Is Claude response HTTP status 200 but body is error?
   - Is JSON parsing failing?
   - Are response fields missing or named differently?
   - Is there a timeout or network issue?

3. **Files to Review**
   - `/supabase/functions/categorize/index.ts` (lines 200-291)
   - `/supabase/functions/claude-categorize/index.ts` (response format)

4. **Test Cases**
   - Unknown vendor: "El Fyle" (should be Meals)
   - Test receipt ID: `a8607534-c20a-49db-8670-f4bc5c6d23b6` (status: ocr_done)

## Architecture

```
Receipt Upload
    ↓
Lambda (Textract) → status: ocr_done
    ↓
categorize() Edge Function
    ├─ Apply Rules (vendor matching)
    │  └─ If match: return category
    │
    └─ If no match: Call Claude
       ├─ Claude returns: { ok: true, category_id, category, confidence }
       ├─ Should: Use Claude result
       └─ Actually: Returns "no_match" ❌
```

## Configuration

- **Claude Model**: claude-opus-4-1
- **Claude API Key**: Set in Supabase secrets
- **Timeout**: 8000ms
- **Temperature**: 0 (deterministic)

## Recent Changes

- Commit `5f25d92`: Fixed scope-limiting braces
- Commit `2f9b3fa`: Added comprehensive logging
- Both deployed to production

## Deployment Status

- ✅ categorize function: Version 39 (deployed 2025-11-24 01:56:28)
- ✅ claude-categorize function: Version 20 (deployed 2025-11-24 01:38:11)
- ✅ Enhanced logging: Deployed in commit 2f9b3fa

## Questions for Senior Dev

1. What does the Supabase log show for "Claude fallback response"?
2. Is Claude returning ok: false or missing fields?
3. Should we add retry logic if Claude fails?
4. Should we handle partial Claude responses differently?
