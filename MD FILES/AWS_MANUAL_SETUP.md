# 🖱️ AWS Manual Setup Guide (Console Only)

## 📋 Overview

This guide walks you through setting up everything in the AWS Console without using CLI.

---

## ✅ Step 1: Create IAM Role for Lambda

### 1.1 Go to IAM Console

1. Open AWS Console → Search for **IAM**
2. Click **IAM** → **Roles** (left sidebar)
3. Click **Create role**

### 1.2 Configure Role

1. **Select trusted entity:**
   - Choose **AWS service**
   - Search for **Lambda**
   - Click **Lambda**
   - Click **Next**

2. **Add permissions:**
   - Search for **AWSLambdaBasicExecutionRole**
   - Check the box
   - Click **Next**

3. **Add custom inline policy:**
   - Click **Create policy**
   - Choose **JSON** tab
   - Paste this policy:

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
      "Resource": "arn:aws:s3:::supabase-receipts/*"
    }
  ]
}
```

   - This allows access to Supabase Storage bucket
   - Click **Create policy**

4. **Name the role:**
   - Role name: `lambda-textract-role`
   - Click **Create role**

### 1.3 Copy Role ARN

1. Go back to **IAM** → **Roles**
2. Search for `lambda-textract-role`
3. Click on it
4. Copy the **ARN** (looks like: `arn:aws:iam::123456789012:role/lambda-textract-role`)
5. Save it - you'll need it later

---

## ✅ Step 2: Create Lambda Function

### 2.1 Go to Lambda Console

1. Open AWS Console → Search for **Lambda**
2. Click **Lambda** → **Functions** (left sidebar)
3. Click **Create function**

### 2.2 Configure Function

1. **Basic information:**
   - **Function name:** `textract-supabase`
   - **Runtime:** Node.js 18.x
   - **Architecture:** x86_64
   - **Execution role:** Choose existing role
   - **Existing role:** Select `lambda-textract-role` (from Step 1)
   - Click **Create function**

### 2.3 Upload Code

1. In the Lambda console, scroll down to **Code source**
2. Click **Upload from** → **.zip file**
3. You need to create a zip file first:

**On your Mac, run:**
```bash
cd /Users/thomasasante/Documents/CODING/Snapceit-main/lambda

# Install dependencies
npm install

# Create zip file
zip -r ../lambda-deployment.zip textract-supabase.js package.json node_modules/

# Verify zip was created
ls -lh ../lambda-deployment.zip
```

4. Back in Lambda console:
   - Click **Upload**
   - Select the `lambda-deployment.zip` file
   - Click **Save**

### 2.4 Change Handler

1. In Lambda console, go to **Runtime settings**
2. Click **Edit**
3. Change **Handler** to: `textract-supabase.handler`
4. Click **Save**

### 2.5 Increase Timeout & Memory

1. Click **Configuration** tab
2. Click **General configuration** → **Edit**
3. Set:
   - **Memory:** 512 MB
   - **Timeout:** 60 seconds
4. Click **Save**

---

## ✅ Step 3: Set Environment Variables

### 3.1 Add Environment Variables

1. In Lambda console, go to **Configuration** tab
2. Click **Environment variables** → **Edit**
3. Click **Add environment variable** and add:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://yoqpzwqlmdhaapnaufrm.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key (see below) |
| `AWS_REGION` | `us-east-1` |

### 3.2 Get Supabase Service Role Key

1. Go to **Supabase Dashboard** → https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Under **Project API keys**, find **Service Role Key**
5. Copy it (NOT the anon key!)
6. Paste into Lambda environment variable

4. Click **Save**

---

## ✅ Step 4: Configure Supabase Storage Trigger

### 4.1 Go to Supabase Dashboard

1. Open Supabase Dashboard → https://app.supabase.com
2. Select your project
3. Go to **Storage** (left sidebar)
4. Click **receipts** bucket

### 4.2 Set Up Webhook

1. Go to **Database** → **Webhooks** (left sidebar)
2. Click **Create a new webhook**

### 4.3 Configure Webhook

1. **Name:** `receipt-textract-trigger`

2. **Table:** `receipts`

3. **Events:** Check **INSERT** (when receipt is uploaded)

4. **HTTP method:** POST

5. **URL:** Your Lambda function URL
   - Go to Lambda console → `textract-supabase`
   - Copy the **Function URL** from the top
   - Paste it here

6. **Headers:** Add custom header
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR-SERVICE-ROLE-KEY`

7. Click **Create webhook**

### 4.4 Alternative: S3 Event Notification

If you want to use S3 directly (optional):

1. Go to AWS Console → **S3**
2. Find Supabase Storage bucket: `supabase-receipts`
3. Go to **Properties** → **Event notifications**
4. Create notification:
   - **Event types:** `s3:ObjectCreated:*`
   - **Prefix:** `receipts/`
   - **Destination:** Lambda function `textract-supabase`

---

## ✅ Step 5: Test Lambda Function

### 5.1 Create Test Event

1. Go to Lambda console → `textract-supabase` function
2. Click **Test** tab
3. Click **Create new event**
4. **Event name:** `test-receipt`
5. **Template:** `S3 Put` (or paste below)

### 5.2 Test Event JSON

Replace the default with:

```json
{
  "Records": [
    {
      "s3": {
        "bucket": {
          "name": "your-bucket-name"
        },
        "object": {
          "key": "receipts/user-123/1234567890/test-receipt.jpg"
        }
      }
    }
  ]
}
```

Replace:
- `your-bucket-name` with your actual bucket name
- `user-123` with a test user ID
- `test-receipt.jpg` with a test filename

6. Click **Save**
7. Click **Test**

### 5.3 Check Results

Look for:
- ✅ **Execution result:** `succeeded`
- ✅ **Response:** Shows receipt data
- ✅ **Logs:** Shows processing steps

If there are errors:
- Click **Logs** tab to see detailed error messages
- Check environment variables are set correctly
- Verify S3 bucket name is correct

---

## ✅ Step 6: Test End-to-End Flow

### 6.1 Upload Test Receipt to Supabase Storage

1. Go to Supabase Dashboard → **Storage**
2. Click **receipts** bucket
3. Click **Upload file**
4. Select a receipt image (JPG or PNG)
5. Path: `user-123/1234567890/receipt.jpg`
6. Click **Upload**

Or use the Snapceit app:
1. Go to dashboard
2. Click **Upload Receipt**
3. Select image
4. Wait for upload to complete

### 6.2 Check Lambda Logs

1. Go to Lambda console → `textract-supabase`
2. Click **Monitor** tab
3. Click **View logs in CloudWatch**
4. Look for recent log entry
5. Check for success or errors

### 6.3 Check Supabase Database

1. Go to Supabase Dashboard
2. Go to **SQL Editor**
3. Run this query:

```sql
SELECT id, status, vendor_text, total_amount, ocr_confidence, updated_at
FROM receipts
WHERE status = 'ocr_done'
ORDER BY updated_at DESC
LIMIT 5;
```

Expected results:
- ✅ Receipt found
- ✅ Status: `ocr_done`
- ✅ `vendor_text` populated
- ✅ `total_amount` populated
- ✅ `ocr_confidence` populated

---

## ✅ Step 7: Test Batch Categorization

### 7.1 Call Batch Function

1. Go to Supabase Dashboard
2. Go to **Functions** (left sidebar)
3. Click **batch-categorize**
4. Click **Invoke**

Or use curl:
```bash
curl -X POST https://yoqpzwqlmdhaapnaufrm.supabase.co/functions/v1/batch-categorize \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY" \
  -H "Content-Type: application/json"
```

### 7.2 Check Results

In Supabase SQL Editor:

```sql
SELECT id, status, category_id, category_confidence
FROM receipts
WHERE status = 'categorized'
ORDER BY updated_at DESC
LIMIT 5;
```

Expected:
- ✅ Status: `categorized`
- ✅ `category_id` populated
- ✅ `category_confidence` populated

---

## ✅ Step 8: Check UI

1. Go to your Snapceit dashboard
2. Upload a receipt
3. Wait for Textract to process (check Lambda logs)
4. Run batch categorization
5. Refresh dashboard

Expected:
- ✅ Confidence pill appears (green/yellow/red)
- ✅ Category name shows
- ✅ "Review" chip if confidence < 0.75
- ✅ Can click edit to correct category

---

## 🔄 Optional: Set Up Scheduled Batch Processing

### 8.1 Create EventBridge Rule

1. Go to AWS Console → Search for **EventBridge**
2. Click **EventBridge** → **Rules** (left sidebar)
3. Click **Create rule**

### 8.2 Configure Rule

1. **Name:** `batch-categorize-hourly`
2. **Description:** Batch categorize receipts every hour
3. **Rule type:** Schedule
4. **Schedule pattern:** `rate(1 hour)`
5. Click **Next**

### 8.3 Set Target

1. **Target type:** AWS service
2. **Service:** Lambda
3. **Function:** `batch-categorize` (Supabase Edge Function)

⚠️ **Note:** EventBridge can't directly call Supabase functions. Instead:
- Use **HTTP endpoint** target
- URL: `https://yoqpzwqlmdhaapnaufrm.supabase.co/functions/v1/batch-categorize`
- Method: POST
- Headers: `Authorization: Bearer YOUR-SERVICE-ROLE-KEY`

Or use Supabase's built-in cron (easier):
- Go to Supabase Dashboard
- **Database** → **Cron**
- Create cron job with schedule `0 * * * *`

---

## 📊 Troubleshooting

### Lambda not triggering on S3 upload

**Check:**
1. S3 event notification is configured
2. Prefix matches: `receipts/`
3. Lambda has S3 permissions
4. Check Lambda logs for errors

**Fix:**
- Go to S3 → Event notifications
- Verify destination is `textract-supabase`
- Verify event type includes `ObjectCreated`

### Textract failing

**Check:**
1. Lambda has Textract permissions
2. Image format is JPG or PNG
3. Image is clear and readable
4. Check Lambda logs for error

**Fix:**
- Go to IAM → `lambda-textract-role`
- Verify `textract:AnalyzeExpense` permission exists

### Receipt not appearing in Supabase

**Check:**
1. Lambda ran successfully (check logs)
2. Environment variables are set correctly
3. Supabase credentials are valid
4. Receipt table exists

**Fix:**
- Go to Lambda → Configuration → Environment variables
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Test with manual Lambda invocation

### Confidence pill not showing in UI

**Check:**
1. Receipt status is `categorized`
2. `category_confidence` is populated
3. UI is reading from database
4. Browser cache cleared

**Fix:**
- Refresh dashboard
- Check receipt status in Supabase
- Run batch categorization again

---

## ✅ Complete Checklist

- [ ] IAM role created with Textract + S3 permissions
- [ ] Lambda function created
- [ ] Code uploaded (zip file)
- [ ] Handler set to `textract-supabase.handler`
- [ ] Memory: 512 MB, Timeout: 60 seconds
- [ ] Environment variables set (SUPABASE_URL, SERVICE_ROLE_KEY, AWS_REGION)
- [ ] S3 event notification configured
- [ ] Manual Lambda test successful
- [ ] Receipt uploaded to S3
- [ ] Receipt appears in Supabase with `ocr_done` status
- [ ] Batch categorization ran
- [ ] Receipt status changed to `categorized`
- [ ] Confidence pill appears in UI
- [ ] User can correct category

---

## 🚀 Summary

You now have:
1. ✅ Lambda function extracting text with Textract
2. ✅ S3 trigger automatically processing uploads
3. ✅ Data saved to Supabase
4. ✅ Batch categorization running
5. ✅ UI showing confidence scores
6. ✅ Users can correct predictions

**Phase 2 is complete!** 🎉

---

**Questions? Check:**
- Lambda logs: Lambda console → Monitor → View logs in CloudWatch
- Supabase logs: Supabase Dashboard → Functions → batch-categorize → Logs
- S3 event notifications: S3 console → Bucket → Properties → Event notifications
