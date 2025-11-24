# Receipt Categorization Testing

Local testing setup to validate receipt categorization without uploading images to the frontend.

## Quick Start

### 1. Setup Environment

Make sure your `.env.local` has:
```
SUPABASE_URL=https://yoqpzwqlmdhaapnaufrm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

### 2. Run Tests

```bash
cd receipts
node test-categorization.js
```

### 3. Check Results

Results are saved to `test-results.json` with detailed output.

## Sample Receipts

The `sample-receipts.json` file contains 7 test cases:

| ID | Vendor | Expected Category | Type |
|---|---|---|---|
| test-apple-1 | Apple Store | Supplies | Rules match |
| test-shell-1 | Shell Gas Station | Car and Truck Expenses | Rules match |
| test-aws-1 | AWS | Office Expense | Rules match |
| test-marriott-1 | Marriott Hotels | Travel | Rules match |
| test-mcdonalds-1 | McDonald's | Meals | Rules match |
| test-unknown-1 | XYZ Corp | (Claude decides) | Claude fallback |
| test-ambiguous-1 | Store | (Claude decides) | Claude fallback |

## What Gets Tested

✅ **Rules Engine**
- Vendor pattern matching
- Confidence scoring
- Category ID mapping

✅ **Claude Fallback**
- Low-confidence detection
- Claude API calls
- Timeout handling
- Graceful degradation

✅ **Data Flow**
- Receipt fetching from DB
- Category updates
- Prediction logging

## Expected Output

```
📋 Receipt Categorization Tester
================================

Testing 7 sample receipts...

Testing test-apple-1... ✅
Testing test-shell-1... ✅
Testing test-aws-1... ✅
Testing test-marriott-1... ✅
Testing test-mcdonalds-1... ✅
Testing test-unknown-1... ✅
Testing test-ambiguous-1... ✅

📊 Detailed Results
===================

📄 MacBook Pro - should match rules (Supplies)
   ID: test-apple-1
   Vendor: Apple Store
   Total: $3442.77
   ✅ Status: 200
   Category: Supplies (ID: 17)
   Confidence: 75.0%
   Method: rule

...

📈 Summary
==========
Total: 7
✅ Passed: 7
❌ Failed: 0
Success Rate: 100.0%

🤖 Claude Fallback Used: 2 times
   - test-unknown-1: Other Expenses (72.0%)
   - test-ambiguous-1: Supplies (68.0%)

📁 Results saved to: test-results.json
```

## Troubleshooting

### "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
- Create `.env.local` in project root
- Add your Supabase credentials

### "Failed to fetch"
- Check network connection
- Verify Supabase URL is correct
- Check Edge Functions are deployed

### "Claude API error"
- Verify CLAUDE_API_KEY is set in Supabase secrets
- Check Claude API quota
- Review Edge Function logs

## Adding More Test Cases

Edit `sample-receipts.json` and add new receipt objects:

```json
{
  "id": "test-custom-1",
  "merchant": "Your Vendor",
  "total": 100.00,
  "subtotal": 100.00,
  "tax": 0,
  "receipt_date": "2025-11-23",
  "status": "ocr_done",
  "description": "Test description"
}
```

Then run the test again!

## Debugging

To see detailed logs, add this to the test script:

```javascript
console.log('Request:', {
  url: `${SUPABASE_URL}/functions/v1/categorize`,
  body: { receipt_id: receipt.id }
});
console.log('Response:', data);
```

## Next Steps

Once all tests pass:
1. Upload a real receipt to the frontend
2. Wait 1 minute for Lambda processing
3. Check the modal for category + confidence pill
4. Verify it matches the test results
