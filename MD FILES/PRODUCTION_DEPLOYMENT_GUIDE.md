# Production Deployment Guide - Queue Pattern + Textract Worker

This is the **ultimate reliable setup** recommended by your senior dev. It combines:
- ✅ Atomic DB queue with idempotency
- ✅ Durable OCR artifact storage (S3)
- ✅ Safe concurrent processing (FOR UPDATE SKIP LOCKED)
- ✅ Automatic retry with DLQ
- ✅ Production-grade error handling

---

## Architecture Overview

```
Client Upload
    ↓
INSERT receipts (s3_key, status='pending')
    ↓
Postgres Trigger (atomic)
    ├─ INSERT receipt_queue
    └─ pg_notify('receipt_channel')
    ↓
CloudWatch Rule (every 30s)
    ↓
Lambda Worker (receipt-textract-worker-prod)
    ├─ Fetch batch with FOR UPDATE SKIP LOCKED
    ├─ Download image from S3
    ├─ Call Textract
    ├─ Store OCR JSON to S3 (artifact)
    ├─ Update Supabase (idempotent)
    ├─ Mark queue processed
    └─ On failure: retry or move to DLQ
    ↓
UI polls receipt status
    ├─ pending → ocr_done (when processed)
    └─ Shows OCR confidence
```

---

## Step 1: Deploy Queue Schema

### 1.1 Run Migration
```bash
cd /Users/thomasasante/Documents/CODING/Snapceit-main
supabase db push
```

This deploys: `supabase/migrations/20251112000000_production_queue_with_dlq.sql`

### 1.2 Verify in Supabase SQL Editor
```sql
-- Check tables created
SELECT * FROM information_schema.tables 
WHERE table_name IN ('receipt_queue', 'receipt_queue_dlq');

-- Check trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'receipts_enqueue';

-- Check views created
SELECT * FROM information_schema.views 
WHERE table_schema = 'public' AND table_name LIKE 'vw_receipt%';
```

### 1.3 Test Trigger (Manual Insert)
```sql
-- Insert test receipt
INSERT INTO receipts (user_id, status, image_url)
VALUES ('test-user-id', 'pending', 'receipts/test/image.jpg');

-- Check queue was populated
SELECT * FROM receipt_queue ORDER BY enqueued_at DESC LIMIT 1;
-- Expected: receipt_id populated, processed=false, attempts=0
```

---

## Step 2: Deploy Lambda Worker

### 2.1 Create S3 Buckets

**Source Bucket** (receipt images):
```bash
aws s3 mb s3://snapceit-receipts-source --region us-east-1
aws s3api put-bucket-versioning \
  --bucket snapceit-receipts-source \
  --versioning-configuration Status=Enabled
```

**Artifact Bucket** (OCR JSON storage):
```bash
aws s3 mb s3://snapceit-ocr-artifacts --region us-east-1
aws s3api put-bucket-versioning \
  --bucket snapceit-ocr-artifacts \
  --versioning-configuration Status=Enabled
```

### 2.2 Create IAM Role for Lambda

```bash
# Create role
aws iam create-role --role-name receipt-textract-worker-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach basic Lambda execution policy
aws iam attach-role-policy --role-name receipt-textract-worker-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Create inline policy for S3, Textract, Secrets Manager
aws iam put-role-policy --role-name receipt-textract-worker-role \
  --policy-name receipt-worker-policy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["s3:GetObject"],
        "Resource": "arn:aws:s3:::snapceit-receipts-source/*"
      },
      {
        "Effect": "Allow",
        "Action": ["s3:PutObject"],
        "Resource": "arn:aws:s3:::snapceit-ocr-artifacts/*"
      },
      {
        "Effect": "Allow",
        "Action": ["textract:DetectDocumentText"],
        "Resource": "*"
      },
      {
        "Effect": "Allow",
        "Action": ["secretsmanager:GetSecretValue"],
        "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:snapceit/*"
      }
    ]
  }'
```

### 2.3 Store Secrets in Secrets Manager

```bash
# Store Supabase service role key
aws secretsmanager create-secret \
  --name snapceit/supabase-service-role \
  --secret-string '{
    "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'

# Store database connection string
aws secretsmanager create-secret \
  --name snapceit/database-url \
  --secret-string 'postgresql://user:pass@db.supabase.co:5432/postgres'
```

### 2.4 Create Lambda Function

```bash
# Package Lambda
cd /Users/thomasasante/Documents/CODING/Snapceit-main/lambda
npm install aws-sdk pg @supabase/supabase-js
zip -r receipt-textract-worker-prod.zip receipt-textract-worker-prod.js node_modules/

# Create Lambda function
aws lambda create-function \
  --function-name receipt-textract-worker-prod \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/receipt-textract-worker-role \
  --handler receipt-textract-worker-prod.handler \
  --zip-file fileb://receipt-textract-worker-prod.zip \
  --timeout 300 \
  --memory-size 1024 \
  --environment Variables="{
    SUPABASE_URL=https://yoqpzwqlmdhaapnaufrm.supabase.co,
    DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres,
    ARTIFACT_BUCKET=snapceit-ocr-artifacts,
    SOURCE_BUCKET=snapceit-receipts-source,
    AWS_REGION=us-east-1,
    MAX_ATTEMPTS=5,
    BATCH_SIZE=10,
    SUPABASE_SERVICE_ROLE_KEY_SECRET=snapceit/supabase-service-role
  }"
```

### 2.5 Create CloudWatch Scheduled Rule

```bash
# Create rule (every 30 seconds)
aws events put-rule \
  --name receipt-queue-poll \
  --schedule-expression "rate(30 seconds)" \
  --state ENABLED

# Add Lambda as target
aws events put-targets \
  --rule receipt-queue-poll \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:ACCOUNT_ID:function:receipt-textract-worker-prod"

# Grant CloudWatch permission to invoke Lambda
aws lambda add-permission \
  --function-name receipt-textract-worker-prod \
  --statement-id AllowCloudWatchInvoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:us-east-1:ACCOUNT_ID:rule/receipt-queue-poll
```

### 2.6 Configure Lambda DLQ (Optional but Recommended)

```bash
# Create SQS queue for DLQ
aws sqs create-queue --queue-name receipt-textract-worker-dlq

# Get queue ARN
QUEUE_ARN=$(aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/ACCOUNT_ID/receipt-textract-worker-dlq \
  --attribute-names QueueArn \
  --query 'Attributes.QueueArn' \
  --output text)

# Configure Lambda DLQ
aws lambda update-function-configuration \
  --function-name receipt-textract-worker-prod \
  --dead-letter-config TargetArn=$QUEUE_ARN
```

---

## Step 3: Test the Flow

### 3.1 Manual Test: Insert Receipt

```sql
-- Insert test receipt
INSERT INTO receipts (user_id, status, image_url, created_at)
VALUES (
  'test-user-id',
  'pending',
  'receipts/test-user/test.jpg',
  NOW()
);

-- Check queue
SELECT * FROM receipt_queue ORDER BY enqueued_at DESC LIMIT 1;
-- Expected: receipt_id populated, processed=false, attempts=0
```

### 3.2 Invoke Lambda Manually

```bash
aws lambda invoke \
  --function-name receipt-textract-worker-prod \
  --region us-east-1 \
  response.json

cat response.json
# Expected: { "statusCode": 200, "body": "{\"processed\": 1, ...}" }
```

### 3.3 Check CloudWatch Logs

```bash
aws logs tail /aws/lambda/receipt-textract-worker-prod --follow --region us-east-1
```

### 3.4 Verify Receipt Updated

```sql
-- Check receipt status changed to ocr_done
SELECT id, status, vendor_text, total_amount, ocr_confidence, ocr_s3_key
FROM receipts
WHERE status = 'ocr_done'
ORDER BY created_at DESC
LIMIT 1;

-- Check queue item marked processed
SELECT * FROM receipt_queue
WHERE processed = TRUE
ORDER BY processed_at DESC
LIMIT 1;
```

---

## Step 4: End-to-End Test

### 4.1 Upload Receipt via App

1. Go to your app: `http://localhost:5184/`
2. Upload a receipt image
3. Watch status change in real-time (UI polls every 5s)

### 4.2 Monitor Processing

**Terminal 1: Watch queue status**
```bash
watch -n 2 'psql $DATABASE_URL -c "SELECT * FROM vw_receipt_queue_status;"'
```

**Terminal 2: Watch receipts**
```bash
watch -n 2 'psql $DATABASE_URL -c "SELECT id, status, vendor_text, total_amount FROM receipts ORDER BY created_at DESC LIMIT 5;"'
```

**Terminal 3: Watch Lambda logs**
```bash
aws logs tail /aws/lambda/receipt-textract-worker-prod --follow --region us-east-1
```

### 4.3 Expected Timeline

```
0s:   Receipt uploaded
      ↓
1s:   receipt_queue entry created (trigger fires)
      ↓
30s:  CloudWatch rule fires Lambda
      ↓
31s:  Lambda fetches batch with FOR UPDATE SKIP LOCKED
      ↓
32s:  Lambda downloads image from S3
      ↓
33-35s: Textract processes image
      ↓
36s:  Lambda stores OCR JSON to S3
      ↓
37s:  Lambda updates Supabase (idempotent)
      ↓
38s:  Lambda marks queue processed
      ↓
39s:  UI refreshes and shows OCR data
```

---

## Monitoring & Operations

### Queue Status View
```sql
-- See queue health
SELECT * FROM vw_receipt_queue_status;

-- Output:
-- status    | count | avg_age_seconds | max_age_seconds
-- pending   | 5     | 45              | 120
-- processed | 1000  | 8               | 45
-- dlq       | 2     | 3600            | 7200
```

### Failed Receipts View
```sql
-- See receipts in DLQ
SELECT * FROM vw_receipt_queue_failures;

-- Output:
-- receipt_id | s3_key | error_message | attempts | failed_at | notes
-- uuid-1     | path   | "Textract..." | 5        | NOW()     | "max attempts exceeded"
```

### CloudWatch Metrics

```bash
# View Lambda invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=receipt-textract-worker-prod \
  --start-time 2025-11-12T00:00:00Z \
  --end-time 2025-11-12T23:59:59Z \
  --period 3600 \
  --statistics Sum

# View Lambda errors
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=receipt-textract-worker-prod \
  --start-time 2025-11-12T00:00:00Z \
  --end-time 2025-11-12T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

### Set Up Alarms

```bash
# Alert if queue backlog > 50
aws cloudwatch put-metric-alarm \
  --alarm-name receipt-queue-backlog \
  --alarm-description "Alert if unprocessed receipts > 50" \
  --metric-name Backlog \
  --namespace Custom/ReceiptQueue \
  --statistic Average \
  --period 300 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:alerts

# Alert if DLQ has items
aws cloudwatch put-metric-alarm \
  --alarm-name receipt-dlq-items \
  --alarm-description "Alert if DLQ has items" \
  --metric-name DLQCount \
  --namespace Custom/ReceiptQueue \
  --statistic Average \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:alerts
```

---

## Troubleshooting

### Queue Backlog Growing

**Symptoms:** `SELECT COUNT(*) FROM receipt_queue WHERE processed=false;` returns high number

**Solutions:**
1. Check Lambda logs: `aws logs tail /aws/lambda/receipt-textract-worker-prod --since 5m`
2. Check Textract quota: `aws textract get-document-analysis --job-id <id>`
3. Increase Lambda memory: Configuration → Memory → 3008 MB
4. Increase CloudWatch schedule frequency: `rate(15 seconds)` instead of `rate(30 seconds)`
5. Deploy multiple Lambda workers (different function names, same CloudWatch rule)

### Receipts in DLQ

**Symptoms:** `SELECT COUNT(*) FROM receipt_queue_dlq;` returns > 0

**Solutions:**
1. Check error message: `SELECT error_message FROM receipt_queue_dlq;`
2. Common errors:
   - "Failed to download image" → Check S3 bucket permissions
   - "Textract failed" → Check Textract quota or image format
   - "Supabase update failed" → Check service role key and RLS policies
3. Manual retry: Move from DLQ back to queue and increment attempts

### Lambda Timeout

**Symptoms:** Lambda logs show "Task timed out"

**Solutions:**
1. Increase timeout: Configuration → Timeout → 5 minutes
2. Increase memory: More memory = more CPU = faster processing
3. Check Textract performance: Large images take longer
4. Optimize image preprocessing (resize, compress before upload)

---

## Scaling Recommendations

### Low Volume (< 100 receipts/day)
- Single Lambda worker
- CloudWatch rule: `rate(60 seconds)`
- Lambda memory: 1024 MB
- Cost: ~$1/month

### Medium Volume (100-1000 receipts/day)
- Single Lambda worker
- CloudWatch rule: `rate(30 seconds)`
- Lambda memory: 2048 MB
- Cost: ~$5/month

### High Volume (1000+ receipts/day)
- Multiple Lambda workers (3-5)
- CloudWatch rule: `rate(15 seconds)`
- Lambda memory: 3008 MB
- Consider SQS buffer: `receipt-queue → SQS → Lambda workers`
- Cost: ~$20-50/month

---

## Files Reference

- `supabase/migrations/20251112000000_production_queue_with_dlq.sql` - Queue schema + DLQ + helpers
- `lambda/receipt-textract-worker-prod.js` - Production worker with idempotency + retry
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - This file

---

## Next Steps

1. ✅ Deploy migration: `supabase db push`
2. ✅ Create S3 buckets
3. ✅ Create IAM role
4. ✅ Store secrets in Secrets Manager
5. ✅ Create Lambda function
6. ✅ Create CloudWatch rule
7. ✅ Test manual receipt insert
8. ✅ Test end-to-end via app
9. ✅ Set up monitoring and alarms
10. ✅ Deploy to production

---

## Support

For issues or questions:
1. Check CloudWatch logs: `aws logs tail /aws/lambda/receipt-textract-worker-prod`
2. Check queue status: `SELECT * FROM vw_receipt_queue_status;`
3. Check DLQ: `SELECT * FROM vw_receipt_queue_failures;`
4. Check Textract quota: AWS Textract console
5. Check S3 permissions: IAM role policy
