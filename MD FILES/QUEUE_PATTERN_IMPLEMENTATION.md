# Queue Pattern Implementation (Pattern B: S3-first + DB Ingestion)

## Overview

This implements a **durable, atomic queue pattern** that eliminates dependency on Supabase webhooks. Uses PostgreSQL triggers + `pg_notify` for near real-time processing.

### Why This Approach?

| Feature | Webhook | Queue Pattern |
|---------|---------|---------------|
| **Reliability** | External dependency | Atomic DB transaction ✅ |
| **Latency** | Webhook delivery delay | Milliseconds (pg_notify) ✅ |
| **Failure Recovery** | Manual retry | Automatic retry queue ✅ |
| **Concurrency** | Single delivery | Safe with FOR UPDATE SKIP LOCKED ✅ |
| **Debugging** | Black box | Full visibility in DB ✅ |
| **Cost** | Webhook overhead | Just DB + Lambda ✅ |

---

## Architecture

```
Receipt Upload
    ↓
INSERT into receipts (trigger fires)
    ↓
Atomic: INSERT into receipt_queue + pg_notify
    ↓
┌─────────────────────────────────────────┐
│ Option A: LISTEN/NOTIFY (Recommended)   │
│ - Persistent Node.js worker             │
│ - Real-time processing (ms latency)     │
│ - Lower cost                            │
└─────────────────────────────────────────┘
    OR
┌─────────────────────────────────────────┐
│ Option B: Polling Lambda                │
│ - CloudWatch scheduled rule (30-60s)    │
│ - Simple to deploy                      │
│ - Slightly higher latency               │
└─────────────────────────────────────────┘
    ↓
Process with Textract
    ↓
UPDATE receipt status → ocr_done
    ↓
UPDATE receipt_queue SET processed=true
```

---

## Step 1: Deploy Queue Schema

### Run Migration
```bash
cd /Users/thomasasante/Documents/CODING/Snapceit-main
supabase db push
```

This deploys: `supabase/migrations/20251111230000_add_receipt_queue.sql`

### What Gets Created
- `receipt_queue` table (durable queue)
- `enqueue_receipt()` trigger function
- `mark_receipt_processed()` helper function
- Indexes for efficient polling

### Verify in Supabase SQL Editor
```sql
SELECT * FROM receipt_queue LIMIT 5;
SELECT * FROM pg_trigger WHERE tgname = 'receipts_enqueue';
```

---

## Step 2: Choose Your Worker

### Option A: LISTEN/NOTIFY Worker (Recommended)

**Best for:** Real-time processing, lower cost, persistent infrastructure

#### 2A.1 Deploy as Container (Recommended)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY lambda/receipt-listener-worker.js .
COPY lambda/package.json .
RUN npm install
CMD ["node", "receipt-listener-worker.js"]
```

Environment variables:
```
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
SUPABASE_URL=https://yoqpzwqlmdhaapnaufrm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Deploy to:
- AWS ECS (recommended)
- Heroku
- Railway
- DigitalOcean App Platform
- Any container platform

#### 2A.2 Deploy as EC2 Instance

```bash
# SSH into EC2
ssh -i key.pem ec2-user@your-instance

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone repo and install
git clone <your-repo>
cd Snapceit-main/lambda
npm install

# Run with pm2 (process manager)
npm install -g pm2
pm2 start receipt-listener-worker.js --name receipt-worker
pm2 startup
pm2 save
```

#### 2A.3 Deploy as Lambda (Long-running)

Not recommended for LISTEN/NOTIFY (Lambda has 15-min timeout), but possible with RDS Proxy.

---

### Option B: Polling Lambda (Simpler)

**Best for:** Serverless, simple deployment, acceptable latency (30-60s)

#### 2B.1 Create Lambda Function

1. **In AWS Lambda Console:**
   - Create function: `receipt-queue-poller`
   - Runtime: Node.js 18.x
   - Copy code from: `lambda/receipt-queue-poller.js`

2. **Set Environment Variables:**
   ```
   SUPABASE_URL=https://yoqpzwqlmdhaapnaufrm.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

3. **Increase Timeout:**
   - Configuration → General configuration
   - Timeout: 5 minutes

4. **Deploy:**
   ```bash
   cd lambda
   npm install
   zip -r function.zip .
   aws lambda update-function-code --function-name receipt-queue-poller --zip-file fileb://function.zip
   ```

#### 2B.2 Create CloudWatch Scheduled Rule

1. **In CloudWatch Console:**
   - Rules → Create rule
   - Schedule: `rate(30 seconds)` or `rate(1 minute)`
   - Target: Lambda function `receipt-queue-poller`

2. **Or via CLI:**
   ```bash
   aws events put-rule --name receipt-queue-poll \
     --schedule-expression "rate(30 seconds)"

   aws events put-targets --rule receipt-queue-poll \
     --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:ACCOUNT:function:receipt-queue-poller"
   ```

---

## Step 3: Test the Flow

### 3.1 Verify Queue Table
```sql
-- Check queue table exists
SELECT * FROM receipt_queue LIMIT 5;

-- Check trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'receipts_enqueue';
```

### 3.2 Insert Test Receipt
```sql
-- Insert test receipt
INSERT INTO receipts (user_id, status, image_url, created_at)
VALUES (
  'test-user-id',
  'pending',
  'receipts/test-user/test.jpg',
  NOW()
);

-- Check queue was populated
SELECT * FROM receipt_queue ORDER BY enqueued_at DESC LIMIT 1;
```

Expected output:
```
id | receipt_id | s3_key | enqueued_at | processed | processor | processed_at
1  | <uuid>     | ...    | NOW()       | false     | NULL      | NULL
```

### 3.3 Test Worker (LISTEN/NOTIFY)

If using container/EC2:
```bash
# Check logs
docker logs <container-id>
# or
tail -f /var/log/receipt-worker.log

# Should see:
# ✅ Connected to PostgreSQL
# ✅ Listener started
# 📬 Received notification: { receipt_id: '...', action: 'enqueued' }
# Processing receipt: ...
```

### 3.4 Test Worker (Polling Lambda)

If using Lambda:
```bash
# Invoke manually
aws lambda invoke --function-name receipt-queue-poller \
  --region us-east-1 \
  response.json

# Check response
cat response.json
# Should show: { "processed": 1, "total": 1, "message": "Processed 1 receipts" }

# Check CloudWatch logs
aws logs tail /aws/lambda/receipt-queue-poller --since 1m --region us-east-1
```

### 3.5 Verify Receipt Updated
```sql
-- Check receipt status changed to ocr_done
SELECT id, status, vendor_text, total_amount, ocr_confidence
FROM receipts
WHERE status = 'ocr_done'
ORDER BY created_at DESC
LIMIT 1;

-- Check queue item marked processed
SELECT * FROM receipt_queue
WHERE processed = true
ORDER BY processed_at DESC
LIMIT 1;
```

---

## Step 4: End-to-End Test

### 4.1 Upload Receipt via App
1. Go to your app: `http://localhost:5184/`
2. Upload a receipt image
3. Watch the status change in real-time (UI polls every 5s)

### 4.2 Monitor Processing

**Terminal 1: Watch queue**
```bash
watch -n 1 'psql $DATABASE_URL -c "SELECT id, receipt_id, processed, processor FROM receipt_queue ORDER BY enqueued_at DESC LIMIT 5;"'
```

**Terminal 2: Watch receipts**
```bash
watch -n 1 'psql $DATABASE_URL -c "SELECT id, status, vendor_text, total_amount FROM receipts ORDER BY created_at DESC LIMIT 5;"'
```

**Terminal 3: Watch worker logs**
```bash
# If container
docker logs -f <container-id>

# If Lambda
aws logs tail /aws/lambda/receipt-queue-poller --follow --region us-east-1
```

### 4.3 Expected Flow
```
0s:   Receipt uploaded
      ↓
1s:   receipt_queue entry created (trigger fires)
      ↓
2s:   Worker receives pg_notify (LISTEN) or CloudWatch fires (polling)
      ↓
3-5s: Textract processes image
      ↓
6s:   Receipt status → ocr_done
      ↓
7s:   UI refreshes and shows OCR data
```

---

## Troubleshooting

### Queue Table Empty
**Problem:** Receipts uploaded but queue not populated

**Solutions:**
1. Check trigger exists: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'receipts_enqueue';`
2. Check trigger is enabled: `ALTER TABLE receipts ENABLE TRIGGER receipts_enqueue;`
3. Manually fire trigger: `INSERT INTO receipts (...) VALUES (...);`

### Worker Not Processing
**Problem:** Queue has items but worker doesn't process

**Solutions (LISTEN/NOTIFY):**
1. Check worker is running: `ps aux | grep receipt-listener`
2. Check logs: `docker logs <container>` or `pm2 logs`
3. Verify DATABASE_URL: `psql $DATABASE_URL -c "SELECT 1"`
4. Check pg_notify works: `psql $DATABASE_URL -c "LISTEN test; NOTIFY test, 'hello';"`

**Solutions (Polling Lambda):**
1. Check CloudWatch rule is enabled: `aws events list-rules`
2. Check Lambda execution role has Supabase permissions
3. Check Lambda timeout is ≥ 5 minutes
4. Manually invoke: `aws lambda invoke --function-name receipt-queue-poller response.json`

### Receipts Not Updating
**Problem:** Worker processes but receipt status stays `pending`

**Solutions:**
1. Check SUPABASE_SERVICE_ROLE_KEY is correct
2. Check Lambda/worker has Supabase permissions
3. Check Supabase RLS policies allow service role updates
4. Check Lambda logs for specific error: `aws logs tail /aws/lambda/receipt-queue-poller --since 5m`

### High Latency
**Problem:** Receipts take too long to process

**Solutions:**
1. If polling: decrease CloudWatch schedule (e.g., `rate(15 seconds)`)
2. If LISTEN: check worker is running and responsive
3. Check Textract performance: `aws textract get-document-analysis --job-id <id>`
4. Increase Lambda memory: Configuration → Memory → 3008 MB

---

## Monitoring & Observability

### CloudWatch Metrics (Polling Lambda)
```bash
# View invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=receipt-queue-poller \
  --start-time 2025-11-12T00:00:00Z \
  --end-time 2025-11-12T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

### Database Metrics (LISTEN/NOTIFY)
```sql
-- Queue backlog
SELECT COUNT(*) as unprocessed_count FROM receipt_queue WHERE processed = false;

-- Processing rate
SELECT COUNT(*) as processed_today FROM receipt_queue 
WHERE processed = true AND processed_at > NOW() - INTERVAL '24 hours';

-- Error rate
SELECT COUNT(*) as errors FROM receipt_queue 
WHERE error_message IS NOT NULL AND processed_at > NOW() - INTERVAL '24 hours';

-- Average processing time
SELECT AVG(EXTRACT(EPOCH FROM (processed_at - enqueued_at))) as avg_seconds
FROM receipt_queue WHERE processed = true;
```

### Alerts

**Set up CloudWatch alarms:**
```bash
# Alert if queue backlog > 10
aws cloudwatch put-metric-alarm \
  --alarm-name receipt-queue-backlog \
  --alarm-description "Alert if unprocessed receipts > 10" \
  --metric-name Backlog \
  --namespace Custom/ReceiptQueue \
  --statistic Average \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

---

## Scaling Considerations

### Single Worker (LISTEN/NOTIFY)
- Throughput: ~10-20 receipts/minute (depends on Textract)
- Latency: 100-500ms
- Cost: ~$50/month (small EC2 instance)

### Multiple Polling Lambdas
- Throughput: ~50-100 receipts/minute (5 Lambdas, 30s schedule)
- Latency: 30-60s
- Cost: ~$1-5/month (Lambda is cheap)

### High Volume (1000+ receipts/day)
- Use multiple workers + queue
- Add database connection pooling
- Consider batch Textract processing
- Use SQS for additional buffering

---

## Next Steps

1. ✅ Deploy migration: `supabase db push`
2. ✅ Choose worker (LISTEN/NOTIFY or Polling)
3. ✅ Deploy worker
4. ✅ Test with manual receipt insert
5. ✅ Test end-to-end via app
6. ✅ Monitor and scale as needed

---

## Files Reference

- `supabase/migrations/20251111230000_add_receipt_queue.sql` - Queue schema
- `lambda/receipt-listener-worker.js` - LISTEN/NOTIFY worker
- `lambda/receipt-queue-poller.js` - Polling Lambda worker
- `Dockerfile` - Container deployment (create yourself)
