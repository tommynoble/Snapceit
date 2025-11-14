# Phase 3: Claude Reasoning Layer & ML Training

## Overview
Phase 3 adds intelligent reasoning and machine learning to achieve 95%+ categorization accuracy. This phase builds on Phase 1 (database) and Phase 2 (UI) to create a self-improving system.

---

## Architecture: Extract → Reason → Learn

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Data Foundation (DONE ✅)                          │
│ ├─ Database schema (vendors, categories, receipts)          │
│ ├─ Rules engine (JSON in Supabase)                          │
│ └─ Edge Function deployed                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: User-Facing Features (DONE ✅)                     │
│ ├─ Confidence pills (color-coded)                           │
│ ├─ Upload flow integration                                  │
│ ├─ Review chips (low confidence)                            │
│ └─ Corrections endpoint                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Intelligence & Learning (NEXT 🎯)                  │
│ ├─ Enhanced Textract extraction                             │
│ ├─ Claude reasoning layer                                   │
│ ├─ ML model training                                        │
│ └─ Self-improving feedback loop                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 3 Tasks (Week-by-Week)

### Week 1: Enhanced Extraction & Claude Integration

#### Task 1.1: Enhance Textract Extraction
**File:** `lambda/receipt-textract-worker-prod.js`

Extract ALL receipt fields:
```javascript
// Current (4 fields):
- vendor
- total
- date
- ocr_confidence

// Enhanced (10+ fields):
- vendor ✅
- total ✅
- date ✅
- subtotal (search for "SUBTOTAL", "SUB TOTAL")
- tax (search for "TAX", "GST", "VAT")
- line_items (parse itemized sections)
- payment_method (CASH, CARD, CREDIT, DEBIT)
- address (extract from receipt header)
- phone (extract phone number)
- invoice_number (search for "Invoice", "Receipt #")
- merchant_category (from vendor name)
- currency (detect from symbols)
```

**Implementation:**
```javascript
function extractLineItems(textractResponse) {
  // Parse table structures or itemized sections
  // Return: [{ name, price, quantity }, ...]
}

function extractTax(textractResponse) {
  // Search for TAX, GST, VAT keywords
  // Return: { amount, type }
}

function extractPaymentMethod(textractResponse) {
  // Detect CASH, CARD, CREDIT, DEBIT
  // Return: string
}
```

#### Task 1.2: Create Claude Integration Function
**File:** `lambda/claude-categorization.js` (NEW)

```javascript
async function categorizeWithClaude(receiptData) {
  // Input: Full receipt extraction from Textract
  // Output: { category, confidence, reasoning }
  
  const prompt = `
    Analyze this receipt and categorize it:
    
    Vendor: ${receiptData.vendor}
    Items: ${receiptData.lineItems.map(i => i.name).join(', ')}
    Total: ${receiptData.total}
    Location: ${receiptData.address}
    Payment: ${receiptData.paymentMethod}
    
    Categorize into one of: ${CATEGORIES.join(', ')}
    
    Respond with JSON: { category, confidence (0-1), reasoning }
  `;
  
  const response = await claude.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }]
  });
  
  return JSON.parse(response.content[0].text);
}
```

#### Task 1.3: Wire Claude to Predictions Table
**File:** `lambda/receipt-textract-worker-prod.js`

```javascript
// In processReceipt():
1. Extract all fields (enhanced)
2. Call Claude for categorization
3. Store in predictions table:
   {
     receipt_id,
     category,
     confidence,
     reasoning,
     source: 'claude',
     created_at
   }
4. Update receipt status to 'categorized'
```

---

### Week 2: ML Model Training

#### Task 2.1: Prepare Training Data
**Source:** Corrections table + user feedback

```sql
SELECT 
  r.id,
  r.merchant,
  r.total,
  r.receipt_date,
  c.category_id,
  c.reason
FROM receipts r
JOIN corrections c ON r.id = c.subject_id
WHERE c.subject_type = 'receipt'
ORDER BY c.created_at DESC
```

#### Task 2.2: Train XGBoost Model
**File:** `ml/train_model.py` (NEW)

```python
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder

# Features:
features = [
  'vendor_encoded',
  'total_amount',
  'day_of_week',
  'month',
  'payment_method_encoded',
  'merchant_category_encoded'
]

# Train on corrections data
model = xgb.XGBClassifier(
  n_estimators=100,
  max_depth=5,
  learning_rate=0.1
)

model.fit(X_train, y_train)
model.save_model('receipt_classifier.json')
```

#### Task 2.3: Deploy Model to Lambda
```bash
# Package model with Lambda function
zip -r lambda_function.zip lambda/ ml/receipt_classifier.json
aws lambda update-function-code --function-name receipt-categorizer --zip-file fileb://lambda_function.zip
```

---

### Week 3: Feedback Loop & Optimization

#### Task 3.1: Implement Feedback Loop
**File:** `lambda/feedback-processor.js` (NEW)

```javascript
// When user corrects a receipt:
1. Store in corrections table
2. Update receipt category
3. Retrain model (nightly batch job)
4. Update model version in Lambda
5. Notify user: "Thanks! This helps us improve"
```

#### Task 3.2: Create Monitoring Dashboard
**Metrics to track:**
- Categorization accuracy (by category)
- Claude confidence distribution
- ML model accuracy
- User correction rate
- Most common misclassifications

#### Task 3.3: Optimize & Iterate
- Identify low-confidence categories
- Improve prompts for Claude
- Retrain model with new data
- A/B test different approaches

---

## Implementation Details

### Enhanced Textract Extraction

```javascript
// Example: Restaurant receipt
{
  vendor: "Starbucks Coffee",
  total: 15.50,
  date: "2024-11-13",
  subtotal: 14.99,
  tax: { amount: 0.51, type: "Sales Tax" },
  lineItems: [
    { name: "Grande Latte", price: 5.45, quantity: 1 },
    { name: "Blueberry Muffin", price: 5.95, quantity: 1 },
    { name: "Croissant", price: 3.59, quantity: 1 }
  ],
  paymentMethod: "CREDIT_CARD",
  address: "123 Main St, Seattle, WA 98101",
  phone: "(206) 555-0123",
  invoiceNumber: "REC-2024-11-13-001",
  currency: "USD"
}
```

### Claude Categorization Example

**Input:**
```
Vendor: Starbucks Coffee
Items: Grande Latte, Blueberry Muffin, Croissant
Total: $15.50
Location: Seattle, WA
Payment: Credit Card
```

**Claude Output:**
```json
{
  "category": "Meals & Entertainment",
  "confidence": 0.95,
  "reasoning": "Coffee shop with food items. Clearly a meal/beverage purchase. High confidence due to clear vendor type and itemized food products."
}
```

### ML Model Features

```python
features = {
  'vendor_encoded': 0-500,           # Vendor name encoded
  'total_amount': 0-1000,            # Receipt total
  'day_of_week': 0-6,                # Day of week (0=Mon, 6=Sun)
  'month': 1-12,                     # Month
  'payment_method_encoded': 0-10,    # Payment type encoded
  'merchant_category_encoded': 0-50  # Merchant category encoded
}

# Example:
{
  'vendor_encoded': 42,
  'total_amount': 15.50,
  'day_of_week': 3,
  'month': 11,
  'payment_method_encoded': 2,
  'merchant_category_encoded': 8
}
```

---

## Cost Breakdown

| Component | Cost/Receipt | Monthly (1000) |
|-----------|-------------|----------------|
| Textract | $0.10 | $100 |
| Claude | $0.003 | $3 |
| Edge Function | FREE | FREE |
| Lambda (training) | $0.0000167 | $0.50 |
| **Total** | **$0.103** | **~$104** |

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Categorization Accuracy | 95% | 78% (rules only) |
| User Correction Rate | <5% | TBD |
| Average Confidence | >0.85 | TBD |
| Processing Time | <2s | <1s ✅ |
| Cost per Receipt | <$0.15 | $0.10 ✅ |

---

## Timeline

```
Week 1: Enhanced Extraction + Claude Integration
├─ Day 1-2: Enhance Textract extraction
├─ Day 3-4: Create Claude integration
└─ Day 5: Wire to predictions table

Week 2: ML Model Training
├─ Day 1-2: Prepare training data
├─ Day 3-4: Train XGBoost model
└─ Day 5: Deploy to Lambda

Week 3: Feedback Loop & Optimization
├─ Day 1-2: Implement feedback loop
├─ Day 3-4: Create monitoring dashboard
└─ Day 5: Optimize & iterate
```

---

## Deployment Checklist

- [ ] Enhanced Textract extraction deployed
- [ ] Claude API key configured in Secrets Manager
- [ ] Claude integration function tested
- [ ] Predictions table populated
- [ ] ML model trained on corrections data
- [ ] Model deployed to Lambda
- [ ] Feedback loop implemented
- [ ] Monitoring dashboard created
- [ ] User notifications added
- [ ] A/B testing framework ready

---

## Rollback Plan

If Claude categorization fails:
1. Fall back to rules engine (Phase 1)
2. Log error to DLQ
3. Alert engineering team
4. Manual review queue

---

## Next Steps

1. **Start Week 1:** Enhance Textract extraction
2. **Collect data:** Let Phase 2 run for 1-2 weeks to gather corrections
3. **Train model:** Use corrections as training data
4. **Deploy:** Gradually roll out Claude categorization
5. **Monitor:** Track accuracy and user feedback
6. **Iterate:** Improve based on real-world performance

---

## Questions?

- **Why Claude + ML?** Claude handles reasoning, ML handles patterns. Together = best of both.
- **Why not just Claude?** Cost ($0.003/receipt) + latency (2-3s). ML is faster ($0.0000167/receipt) + instant.
- **How do we improve?** User corrections feed back into model training. Self-improving system.
- **What if accuracy drops?** Rollback to rules engine. Monitor and investigate.

