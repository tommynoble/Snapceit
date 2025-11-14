# 🚀 Snapceit Phase 2 Deployment Guide

## ✅ What's Deployed

### **Supabase (✅ DONE)**
- ✅ `categorize` Edge Function (rules engine)
- ✅ `batch-categorize` Edge Function (batch processor)
- ✅ Database schema (Phase 2)
- ✅ RULES_JSON environment variable

### **AWS (⏳ YOU NEED TO DO)**
- ⏳ Lambda: `textract-supabase`
- ⏳ S3 trigger configuration
- ⏳ IAM role setup

---

## 📋 **Supabase Deployment Status**

```
✅ categorize (ACTIVE - v2)
   - Rules engine for categorization
   - Deployed: 2025-11-11 11:14:14
   - Endpoint: POST /functions/v1/categorize

✅ batch-categorize (ACTIVE - v1)
   - Batch processor for pending receipts
   - Deployed: 2025-11-11 11:45:17
   - Endpoint: POST /functions/v1/batch-categorize
```

---

## 🔧 **AWS Lambda Deployment (Manual Steps)**

### **Step 1: Prepare Lambda Package**

```bash
cd lambda/

# Install dependencies
npm install

# Create deployment package
zip -r ../lambda-deployment.zip textract-supabase.js package.json node_modules/

cd ..
```

### **Step 2: Create Lambda Function (AWS Console)**

1. Go to **AWS Lambda** → **Create function**
2. Configure:
   - **Function name:** `textract-supabase`
   - **Runtime:** Node.js 18.x
   - **Architecture:** x86_64
   - **Handler:** `textract-supabase.handler`
   - **Memory:** 512 MB
   - **Timeout:** 60 seconds

3. Upload code:
   - Click **Upload from** → **.zip file**
   - Upload `lambda-deployment.zip`

### **Step 3: Create IAM Role**

1. Go to **IAM** → **Roles** → **Create role**
2. Select **Lambda** as service
3. Add permissions:
   - `AWSLambdaBasicExecutionRole` (for logging)
   - Custom inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "textract:AnalyzeExpense"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/receipts/*"
    }
  ]
}
```

4. Attach role to Lambda function

### **Step 4: Set Environment Variables**

In Lambda console → **Configuration** → **Environment variables**

Add:
```
SUPABASE_URL = https://yoqpzwqlmdhaapnaufrm.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
AWS_REGION = us-east-1
```

**To get SUPABASE_SERVICE_ROLE_KEY:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy the **Service Role Key** (NOT the anon key!)

### **Step 5: Configure S3 Trigger**

1. Go to **S3** → Your bucket → **Properties**
2. Scroll to **Event notifications**
3. Click **Create event notification**
4. Configure:
   - **Event name:** `receipt-textract-trigger`
   - **Event types:** `s3:ObjectCreated:*`
   - **Prefix:** `receipts/`
   - **Destination:** Lambda function
   - **Lambda function:** `textract-supabase`

5. Click **Save**

---

## 🧪 **Testing the Flow**

### **Test 1: Manual Lambda Invocation**

In AWS Lambda console → **Test** tab:

```json
{
  "Records": [
    {
      "s3": {
        "bucket": {
          "name": "your-bucket-name"
        },
        "object": {
          "key": "receipts/user-123/1234567890/receipt.jpg"
        }
      }
    }
  ]
}
```

Expected response:
```json
{
  "statusCode": 200,
  "body": {
    "message": "Receipt processed successfully",
    "receiptId": "receipt",
    "ocrData": {
      "vendor_text": "Tesco Plc",
      "total_amount": 45.99,
      "currency": "USD",
      "receipt_date": "2025-11-08",
      "line_items": [...],
      "confidence": 0.85
    }
  }
}
```

### **Test 2: Upload Receipt to S3**

```bash
# Upload test receipt
aws s3 cp test-receipt.jpg s3://your-bucket/receipts/user-123/1234567890/receipt.jpg

# Check Lambda logs
aws logs tail /aws/lambda/textract-supabase --follow
```

### **Test 3: Check Supabase Database**

```sql
-- Check receipt was updated
SELECT id, status, vendor_text, total_amount, ocr_confidence 
FROM receipts 
WHERE status = 'ocr_done' 
ORDER BY updated_at DESC 
LIMIT 1;

-- Check line items
SELECT * FROM line_items 
ORDER BY created_at DESC 
LIMIT 5;
```

### **Test 4: Trigger Batch Categorization**

```bash
# Call batch-categorize function
curl -X POST https://yoqpzwqlmdhaapnaufrm.supabase.co/functions/v1/batch-categorize \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "message": "Batch processing complete",
  "processed": 5,
  "succeeded": 5,
  "failed": 0,
  "results": [...]
}
```

### **Test 5: Check UI**

1. Go to dashboard
2. Upload receipt
3. Wait for Textract Lambda to process
4. Run batch-categorize
5. Check receipt shows:
   - ✅ Confidence pill (green/yellow/red)
   - ✅ Category name
   - ✅ "Review" chip if confidence < 0.75

---

## 📊 **Complete End-to-End Flow**

```
1. User uploads receipt image
   ↓
2. S3 trigger → Lambda (Textract)
   ├─ Extract text (vendor, amount, date, items)
   ├─ Normalize data (dates, amounts, currency)
   ├─ Reconcile totals
   └─ Save to Supabase receipts table
   ↓
3. Receipt status: pending → ocr_done
   ↓
4. Batch job (manual or cron) → batch-categorize
   ├─ Fetch all ocr_done receipts
   ├─ Call categorize function for each
   ├─ Run rules engine
   └─ Store predictions
   ↓
5. Receipt status: ocr_done → categorized
   ↓
6. UI updates
   ├─ Show confidence pill
   ├─ Show category name
   ├─ Show "Review" chip if needed
   └─ Allow user to correct
   ↓
7. Corrections stored
   └─ Feed into Phase 3 ML model
```

---

## 🔄 **Set Up Cron Job (Optional)**

To automatically run batch categorization hourly:

### **Option 1: AWS EventBridge (Recommended)**

1. Go to **EventBridge** → **Rules**
2. Create rule:
   - **Name:** `batch-categorize-hourly`
   - **Schedule:** `rate(1 hour)`
   - **Target:** Lambda function `batch-categorize`

### **Option 2: Supabase Cron (Simpler)**

In Supabase Dashboard:
1. Go to **Database** → **Cron**
2. Create new cron:
   - **Name:** `batch-categorize`
   - **Function:** `batch-categorize`
   - **Schedule:** `0 * * * *` (every hour)

---

## ✅ **Verification Checklist**

- [ ] Lambda function created
- [ ] IAM role with Textract + S3 permissions
- [ ] Environment variables set (SUPABASE_URL, SERVICE_ROLE_KEY)
- [ ] S3 trigger configured
- [ ] Manual Lambda test successful
- [ ] Receipt uploaded and processed
- [ ] Receipt status changed to `ocr_done`
- [ ] Batch categorization ran
- [ ] Receipt status changed to `categorized`
- [ ] Confidence pill appears in UI
- [ ] User can correct category
- [ ] Correction stored in corrections table

---

## 🚀 **Deployment Summary**

| Component | Status | Action |
|-----------|--------|--------|
| Database Schema | ✅ | Done |
| Rules Engine | ✅ | Done |
| Categorize Function | ✅ | Done |
| Batch Categorize | ✅ | Done |
| Textract Lambda | ⏳ | Manual AWS setup |
| S3 Trigger | ⏳ | Manual AWS setup |
| UI (Confidence Pill) | ✅ | Done |
| Corrections Endpoint | ✅ | Done |

---

## 📞 **Troubleshooting**

### **Lambda not triggering on S3 upload**
- Check S3 event notification is configured
- Check Lambda has S3 permissions
- Check S3 key matches prefix `receipts/`

### **Textract failing**
- Check Lambda has Textract permissions
- Check image format (JPG, PNG supported)
- Check image quality (clear receipt needed)

### **Batch categorization not working**
- Check batch-categorize function is deployed
- Check receipts table has `ocr_done` status
- Check Edge Function logs in Supabase Dashboard

### **Confidence pill not showing**
- Check receipt has `category_confidence` value
- Check receipt status is `categorized`
- Check UI is reading from database correctly

---

## 📚 **Next Steps**

1. **Deploy Lambda** (manual AWS setup)
2. **Test end-to-end** (upload receipt → see categorization)
3. **Set up cron job** (hourly batch processing)
4. **Phase 3** (Claude reasoning layer for low-confidence)

---

**Questions? Check the logs:**
```bash
# Lambda logs
aws logs tail /aws/lambda/textract-supabase --follow

# Supabase function logs
supabase functions list  # Get function ID
supabase functions logs batch-categorize
```

---

**Ready to deploy to AWS?** 🚀
