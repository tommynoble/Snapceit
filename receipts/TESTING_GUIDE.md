# Local Testing Guide

Since test receipts require a valid user_id, here's how to test the categorization:

## Option 1: Upload Real Receipts (Recommended)

1. **Go to the frontend** and upload a receipt
2. **Wait 1 minute** for Lambda to process
3. **Check the modal** for category + confidence pill

This is the most realistic test and catches all integration issues.

## Option 2: Direct Edge Function Testing

If you want to test without uploading:

1. **Create a test receipt in the database manually:**
   ```sql
   INSERT INTO receipts_v2 (id, user_id, merchant, total, subtotal, tax, receipt_date, status)
   VALUES (
     '550e8400-e29b-41d4-a716-446655440001',
     'YOUR_USER_ID_HERE',  -- Replace with your actual user ID
     'Apple Store',
     3442.77,
     2799.00,
     643.77,
     '2025-04-09',
     'ocr_done'
   );
   ```

2. **Call the categorize function directly:**
   ```bash
   curl -X POST https://yoqpzwqlmdhaapnaufrm.supabase.co/functions/v1/categorize \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{"receipt_id": "550e8400-e29b-41d4-a716-446655440001"}'
   ```

3. **Check the response:**
   - Should include `category`, `category_id`, `confidence`
   - Method should be "rule" or "claude"

## Option 3: Test Individual Components

### Test Rules Engine
Check if vendor patterns match:
- Apple Store → Supplies (ID: 17)
- Shell Gas → Car and Truck Expenses (ID: 2)
- AWS → Office Expense (ID: 12)
- Marriott → Travel (ID: 19)
- McDonald's → Meals (ID: 20)

### Test Claude Fallback
Test with ambiguous vendors:
- "XYZ Corp" → Claude should categorize
- "Store" → Claude should categorize

### Test Confidence Thresholds
- High confidence (≥0.75) → Green pill
- Medium confidence (0.65-0.75) → Yellow pill
- Low confidence (<0.65) → Red pill + Review chip

## Debugging

### Check Edge Function Logs
```bash
supabase functions list
# Then check the logs in Supabase dashboard
```

### Check Lambda Logs
```bash
aws logs tail /aws/lambda/receipt-textract-worker-prod --follow
```

### Check Predictions Table
```sql
SELECT * FROM predictions WHERE method = 'claude' ORDER BY created_at DESC LIMIT 10;
```

## Expected Results

✅ **Rules Match (High Confidence)**
- Vendor: "Apple Store"
- Category: "Supplies"
- Confidence: 0.75
- Method: "rule"

✅ **Claude Fallback (Low Confidence)**
- Vendor: "XYZ Corp"
- Category: "Other Expenses" (or similar)
- Confidence: 0.70-0.80
- Method: "claude"

✅ **No Match (Marked for Review)**
- Vendor: "Unknown"
- Category: null
- Status: "ocr_done"
- Method: null

## Next Steps

Once testing is complete:
1. Verify category displays in UI
2. Check confidence pill colors
3. Test with different vendors
4. Monitor Claude accuracy for 1 week
5. Decide on Phase 3.5 (ML training)
