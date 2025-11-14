# Webhook Troubleshooting & Queue Pattern Implementation

## Problem Summary
Supabase webhook is not triggering Lambda when receipts are uploaded. Receipts stay in `pending` status.

---

## Step 1: Quick Debugging (Do This First)

### 1.1 Check Supabase Webhook Delivery Logs
1. Go to Supabase Dashboard
2. Database → Webhooks
3. Click on `receipt-textract-trigger`
4. Look for "Delivery logs" or "Recent deliveries"
5. Check HTTP status codes and response bodies

### 1.2 Test Lambda Endpoint Directly
```bash
curl -v -X POST "https://k5hrkbdnr3l53wllyhtrrduqqm0qvkzm.lambda-url.us-east-1.on.aws/" \
  -H "Content-Type: application/json" \
  -d '{"test":"ping"}'
```
**Expected:** HTTP 200-299
**If 4xx/5xx:** Lambda auth issue or endpoint misconfigured

### 1.3 Test with webhook.site (Definitive Test)
1. Go to https://webhook.site
2. Copy your unique URL
3. In Supabase Dashboard, update webhook URL to your webhook.site URL
4. Upload a test receipt in your app
5. Check webhook.site for incoming POST

**Results:**
- ✅ POST received → Supabase is firing, issue is Lambda endpoint
- ❌ No POST → Supabase not firing, check webhook config

### 1.4 Verify Lambda URL Configuration
In AWS Lambda Console:
- Function: `receipt-categorizer-dev`
- Configuration → Function URL
- **Auth type must be: NONE** (public, unauthenticated)
- If set to AWS_IAM, Supabase can't call it

### 1.5 Check Webhook Configuration
In Supabase Dashboard → Webhooks:
- ✅ Name: `receipt-textract-trigger`
- ✅ Schema: `public`
- ✅ Table: `receipts`
- ✅ Events: `INSERT` (only)
- ✅ URL: `https://k5hrkbdnr3l53wllyhtrrduqqm0qvkzm.lambda-url.us-east-1.on.aws/`
- ✅ Enabled: Toggle is ON (blue)

---

## Step 2: If Webhook is Firing but Lambda Fails

### Check Lambda Logs
```bash
aws logs tail /aws/lambda/receipt-categorizer-dev --since 5m --region us-east-1
```

### Common Lambda Issues
1. **Missing SUPABASE_SERVICE_ROLE_KEY** - Lambda can't update DB
2. **Parse error** - Lambda doesn't understand webhook format
3. **Timeout** - Lambda takes too long to respond
4. **Textract error** - Image download or Textract call fails

### Add Logging to Lambda
At the start of handler:
```javascript
console.log('Incoming headers:', JSON.stringify(event.headers));
console.log('Incoming body:', JSON.stringify(event.body));
```

---

## Step 3: Robust Solution - SQL Queue Pattern

### Why Queue Pattern?
- ✅ Guaranteed enqueueing (atomic with receipt INSERT)
- ✅ Decoupled from webhook delivery
- ✅ Built-in retry logic
- ✅ Error tracking
- ✅ No external webhook dependency

### Implementation

#### 3.1 Deploy Queue Schema
```bash
cd /Users/thomasasante/Documents/CODING/Snapceit-main
supabase db push
```

This runs the migration: `supabase/migrations/20251111230000_add_receipt_queue.sql`

Creates:
- `receipt_queue` table
- `enqueue_receipt()` trigger function
- `mark_receipt_processed()` helper function

#### 3.2 Deploy Queue Worker Lambda
1. Copy `lambda/receipt-queue-worker.js` to your Lambda
2. Update Lambda environment variables (same as textract-supabase.js)
3. Create CloudWatch scheduled rule:
   - **Schedule:** `rate(1 minute)` or `rate(30 seconds)`
   - **Target:** `receipt-queue-worker` Lambda
4. Deploy

#### 3.3 How It Works
```
Receipt uploaded
    ↓
INSERT into receipts (trigger fires)
    ↓
INSERT into receipt_queue (automatic)
    ↓
CloudWatch fires every 30 seconds
    ↓
receipt-queue-worker Lambda runs
    ↓
SELECT * FROM receipt_queue WHERE processed=FALSE
    ↓
Process each receipt with Textract
    ↓
UPDATE receipt status to ocr_done
    ↓
UPDATE receipt_queue SET processed=TRUE
```

---

## Step 4: Fast Workaround - Polling (No Queue)

If you want a quick fix without the queue table:

Update your existing Lambda to poll instead of wait for webhook:

```javascript
// Add this to receipt-categorizer-dev handler
async function pollPendingReceipts() {
  const { data: receipts } = await supabase
    .from('receipts')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(25);

  for (const receipt of receipts) {
    // Process each receipt with Textract
    // ... existing code ...
  }
}
```

Then create a CloudWatch rule to invoke Lambda every 30-60 seconds.

**Pros:** Quick, no schema changes
**Cons:** Less efficient (scans all pending), no error tracking

---

## Checklist for Senior Dev

- [ ] Check Supabase webhook delivery logs
- [ ] Test Lambda endpoint with curl
- [ ] Test with webhook.site
- [ ] Verify Lambda URL Auth = NONE
- [ ] Verify webhook config (schema/table/events)
- [ ] Check Lambda logs for errors
- [ ] If webhook fires but Lambda fails: add logging, check env vars
- [ ] Implement queue pattern for robustness
- [ ] Set up CloudWatch scheduled rule for queue worker
- [ ] Test end-to-end: upload receipt → check queue → check receipt status

---

## Files Created

1. **supabase/migrations/20251111230000_add_receipt_queue.sql**
   - Queue table schema
   - Trigger function
   - Helper functions

2. **lambda/receipt-queue-worker.js**
   - Polls receipt_queue
   - Processes with Textract
   - Marks as processed/failed

3. **WEBHOOK_TROUBLESHOOTING.md** (this file)
   - Complete debugging guide

---

## Next Steps

1. **Immediate:** Run webhook.site test to confirm Supabase is sending POSTs
2. **If webhook sends:** Debug Lambda endpoint (auth, parsing, env vars)
3. **If webhook doesn't send:** Check Supabase config and delivery logs
4. **Long-term:** Deploy queue pattern for reliability

---

## Questions?

- Lambda URL not accepting requests? Check Auth type = NONE
- Lambda can't update DB? Check SUPABASE_SERVICE_ROLE_KEY env var
- Webhook not firing? Check schema/table/events in Supabase Dashboard
- Need real-time? Use queue pattern with pg_notify instead of polling
