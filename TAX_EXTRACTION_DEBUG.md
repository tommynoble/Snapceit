# Tax Extraction Debug Report

## Problem
Tax extraction is not working. Receipt shows:
- ✅ Vendor: "Kmart" (extracted correctly)
- ✅ Total: "$2.02" (extracted, but might be wrong - receipt shows $2,020.90)
- ❌ Subtotal: NULL
- ❌ Tax: NULL
- ❌ Tax Rate: NULL

## Receipt Details
- Image: Kmart Australia receipt
- Visible on receipt:
  - Total: $2,020.90
  - GST Included: $83.90
  - Paid via: EFTPOS VISA

## Current Tax Extraction Code

```javascript
function extractTax(textractResponse) {
  // Lines 318-376 in receipt-textract-worker-prod.js
  
  // 1. Filters for SUBTOTAL keyword
  if ((line.includes('SUBTOTAL') || line.includes('SUB-TOTAL') || line.includes('SUBTOT')) && !subtotal)
  
  // 2. Filters for TAX keywords: TAX, VAT, GST, IVA
  if ((line.includes('TAX') || line.includes('VAT') || line.includes('GST') || line.includes('IVA')) && !tax)
  
  // 3. Regex: /[\$€£]?\s*(\d+[.,]\d{2})/
  // Matches: $XX.XX or €XX,XX format (2 decimal places required)
}
```

## Potential Issues

### Issue 1: Regex Requires Exactly 2 Decimals
Current regex: `/[\$€£]?\s*(\d+[.,]\d{2})/`

**Problem:** This requires EXACTLY 2 decimal places. But receipt shows:
- `$2,020.90` - has comma as thousand separator
- `$83.90` - this should match

**Question for Senior Dev:**
- Should we handle thousand separators (commas/periods)?
- Should we handle amounts without decimals (e.g., "$83")?

### Issue 2: Keyword Matching
Current keywords: `TAX`, `VAT`, `GST`, `IVA`

**Problem:** Receipt shows "GST Included: $83.90"
- This SHOULD match "GST" keyword
- But it's not being extracted

**Possible causes:**
1. Textract might be splitting "GST Included" into separate lines
2. The amount might be on a different line than the keyword
3. The regex might not match the format

**Question for Senior Dev:**
- How does Textract parse multi-line receipts?
- Should we look for "INCLUDED" keyword as well?
- Should we search backwards/forwards for amounts near tax keywords?

### Issue 3: Total Extraction Issue
Current total shows "$2.02" but receipt shows "$2,020.90"

**Problem:** The regex `/[\$€£]?\s*(\d+[.,]\d{2})/` might be matching the first amount it finds instead of the largest.

**Current fallback logic:**
```javascript
// Gets the largest amount if no TOTAL keyword found
const amounts = lines.flatMap(line => {
  const matches = line.match(/(\d+[.,]\d{2})/g) || [];
  return matches.map(m => parseFloat(m.replace(',', '.')));
});
total = Math.max(...amounts);
```

**Question for Senior Dev:**
- Why is total showing $2.02 instead of $2,020.90?
- Is the regex not matching the larger amount?
- Should we handle thousand separators differently?

## Recommended Fixes

### Option 1: Enhanced Regex (Recommended)
```javascript
// Match amounts with optional thousand separators
const amountRegex = /[\$€£]?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2}|\d+[.,]\d{2})/;

// This would match:
// - $2,020.90 (with comma separator)
// - €1.234,56 (European format)
// - $83.90 (simple format)
```

### Option 2: Multi-line Tax Detection
```javascript
// Look for tax keywords and search nearby lines for amounts
for (let i = 0; i < lines.length; i++) {
  if (line.includes('GST') || line.includes('TAX')) {
    // Check same line, next line, and previous line
    const possibleLines = [
      lines[i],
      lines[i + 1],
      lines[i - 1]
    ].filter(Boolean);
    
    // Try to find amount in any of these lines
  }
}
```

### Option 3: Add More Keywords
```javascript
// Current: TAX, VAT, GST, IVA
// Add: INCLUDED, DUTY, LEVY, SURCHARGE, SERVICE CHARGE
```

## Questions for Senior Dev

1. **Thousand Separator Handling:** Should we normalize amounts to handle both "2,020.90" and "2020.90"?

2. **Multi-line Tax:** Should we search adjacent lines for amounts when we find tax keywords?

3. **Total Extraction:** Why is the total showing $2.02? Should we debug the Textract response structure?

4. **GST Specific:** For Australian receipts (GST), should we add "INCLUDED" as a keyword?

5. **Fallback Strategy:** Should we have a fallback that looks for the second-largest amount (assuming total is largest, subtotal is second)?

## Test Case
- Receipt: Kmart Australia
- Expected: subtotal ~$1,937, tax (GST) ~$83.90, total $2,020.90
- Actual: subtotal NULL, tax NULL, total $2.02 (WRONG)

## Next Steps
1. Get senior dev feedback on the above questions
2. Update extractTax() function based on recommendations
3. Redeploy Lambda
4. Test with multiple receipt formats
