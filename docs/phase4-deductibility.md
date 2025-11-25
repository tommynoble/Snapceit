# Phase 4: Deductibility & Schedule C Pipeline

## Objectives
- Determine whether each receipt is business deductible and map it to the correct Schedule C category.
- Capture deductible sales tax amounts (or estimates) with provenance for auditability.
- Provide confidence-driven review workflows so accountants can trust or override automated decisions.
- Feed corrections back into the learning loop (rules + Claude) for continuous improvement.

## Core Principles
1. **Normalize receipt data**: vendor, date, total, subtotal, tax, tax rate/breakdown, line items, category_id/confidence.
2. **Preserve provenance**: keep raw Textract JSON, parsed fields, rule/Claude outputs, confidences, and estimation methods.
3. **Separate questions**:
   - *Is the receipt deductible (business vs. personal)?*
   - *If deductible, which Schedule C bucket does it fall into?*

## Pipeline Overview
1. Ingest & extract structured data.
2. Categorize to Schedule C via rules → Claude fallback.
3. Derive deductibility + tax treatment.
4. Apply line-item assists when available.
5. Drive confidence-based review logic.
6. Persist enriched signals for UX, audit, and training loops.

## 1. Ingest & Extract
- Continue capturing: vendor/merchant, total, subtotal, tax amount, tax rate, tax breakdown, receipt date, line items, payment metadata.
- Normalize totals: ensure `subtotal + tax ≈ total`; log/flag discrepancies (`total_mismatch` flag + details).
- Store raw OCR artifacts + parsed fields for auditing.

## 2. Categorize to Schedule C
- Reuse current **rules → Claude** cascade to assign `category_id` (Schedule C) + `category_confidence`.
- Persist decision provenance in `predictions` (method, confidence, reasoning, timestamp).
- Write category info back to `receipts_v2`.

## 3. Deductibility & Tax Treatment Logic
| Scenario | Action |
| --- | --- |
| Category assigned & confidence ≥ `0.80` & not flagged personal | `is_deductible = true`, copy `category_id`, `deductible_confidence = category_confidence`, `review_required = false`. |
| Confidence 0.60–0.79 | `is_deductible = true`, `review_required = true`, store reasoning. |
| Confidence < 0.60 OR conflicting vendor signals OR missing totals | `is_deductible = false`, `review_required = true`, require manual review. |
| Categorization failed | `is_deductible = false`, `review_required = true`. |

**Sales Tax Handling**
- If deductible: `tax_deductible_amount = tax` when supplied.
- If tax missing: infer `tax = subtotal * inferred_rate` (using vendor ZIP, historical receipts, or user default). Store `tax_estimation_method` + `tax_rate_used` + estimation confidence.
- Meals: store `deductible_ratio = 0.5` (configurable); downstream reporting multiplies total + tax by the ratio.
- Tips folded into total count as cost of goods/services; no additional handling needed.

**Mixed/Personal detection**
- If vendor pattern is typically personal (grocer, big-box) and confidence is below stricter threshold (e.g., 0.85) without line-item corroboration, set `review_required = true`.
- If line items show both business/personal keywords, mark `mixed = true`, `review_required = true`.

## 4. Line-Item Assist (optional tier)
- Keyword match each line item to category hints and personal indicators.
- If majority of items match business keywords, boost confidence; if personal keywords dominate, lower confidence.
- Optionally store `line_items[].deductible_flag` for granular auditing.

## 5. Confidence & Review Logic
| Confidence bucket | Action |
| --- | --- |
| ≥ 0.80 | Auto accept; include tax; `review_required = false`. |
| 0.60–0.79 | Accept but flag "Review"; show reasoning in UI. |
| < 0.60 or conflicting signals | Do not auto-apply category/tax; `review_required = true`. |

## 6. Data Model Additions
Add columns to **`receipts_v2`**:
- `is_deductible` (bool, default false)
- `deductible_confidence` (numeric)
- `tax_deductible_amount` (numeric)
- `tax_estimation_method` (text/json)
- `deductible_ratio` (numeric, default 1, set 0.5 for meals)
- `deduction_reason` (text/json; store rule/Claude reasoning, estimation notes)
- `review_required` (bool)
- `mixed_signals` (bool)

Enhance **`predictions`** table with optional `subject_subtype` or `dimension` so we can log a second pass for deductibility decisions separate from categorization.

## 7. Processing Logic (Pseudo)
```
if category_assigned:
  if confidence >= 0.80 and !mixed: mark deductible true
  else if 0.60 <= confidence < 0.80: mark deductible true + review_required
  else: deductible false, review_required = true
else:
  deductible false, review_required = true

if deductible:
  tax_deductible_amount = tax ?? estimateTax(subtotal)
  deduction_reason = { method: 'rule' | 'claude', confidence, notes }
  if category == 'Meals': deductible_ratio = 0.5
else:
  tax_deductible_amount = 0
```

## 8. Audit & UX
- Show badges explaining why a receipt is (or isn’t) deductible.
- Display reasoning text (e.g., `Rule: grocery -> Supplies (0.78)` or `Claude: Meals 0.82`).
- Show tax provenance (`captured`, `estimated@8.5% from ZIP 02108`).
- Provide UI toggles for "Mark as Personal" / "Mark as Business" which log corrections.

## 9. Quality Loop
- Periodically sample medium/low confidence + review_queue receipts to refine rules and prompts.
- Track error categories: total mismatches, missing tax, false positives from grocers, etc.
- Feed user overrides back into the corrections pipeline so Claude/rules learn from resolved cases.

## Next Steps
1. Add new columns + policies to `receipts_v2` and update migrations.
2. Extend categorization pipeline (Edge Function) to set deductibility fields after category assignment.
3. Update UI to visualize deductibility, review flags, and reasoning.
4. Implement overrides + corrections logging for future learning.
5. Instrument metrics (confidence buckets, overrides, flagged receipts) for continuous monitoring.
