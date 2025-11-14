# 🚀 Phase 2 - Week 3 Implementation Checklist

## Goal
Set up batch processing with Textract OCR integration and wire everything together.

**Deliverable:** End-to-end flow: Upload → Textract → Categorize → UI Updates

---

## ✅ Step 1: Create Supabase-Integrated Textract Lambda (3 hours)

### 1.1 Create Lambda Function

**File:** `lambda/textract-supabase.ts`

```typescript
import { TextractClient, AnalyzeExpenseCommand } from "@aws-sdk/client-textract";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const textractClient = new TextractClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Initialize Supabase with service role key (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TextractResult {
  vendor_text: string;
  total_amount: number;
  currency: string;
  receipt_date: string;
  line_items: Array<{
    description: string;
    qty?: number;
    unit_price?: number;
    total?: number;
  }>;
  confidence: number;
}

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseTextractResponse(response: any): TextractResult {
  const result: TextractResult = {
    vendor_text: '',
    total_amount: 0,
    currency: 'USD',
    receipt_date: new Date().toISOString().split('T')[0],
    line_items: [],
    confidence: 0.8, // Default confidence for Textract
  };

  // Process expense fields
  const documents = response.ExpenseDocuments || [];
  if (documents.length === 0) {
    throw new Error('No expense documents found in Textract response');
  }

  const doc = documents[0];
  let confidenceSum = 0;
  let fieldCount = 0;

  // Extract summary fields
  doc.SummaryFields?.forEach((field: any) => {
    if (!field.Type?.Text || !field.ValueDetection?.Text) return;

    fieldCount++;
    confidenceSum += field.Confidence || 0.8;

    switch (field.Type.Text) {
      case 'VENDOR_NAME':
        result.vendor_text = field.ValueDetection.Text;
        break;
      case 'INVOICE_RECEIPT_DATE':
        result.receipt_date = field.ValueDetection.Text;
        break;
      case 'TOTAL':
        result.total_amount = parseFloat(
          field.ValueDetection.Text.replace(/[^0-9.]/g, '')
        ) || 0;
        break;
      case 'CURRENCY':
        result.currency = field.ValueDetection.Text.toUpperCase();
        break;
    }
  });

  // Extract line items
  doc.LineItemGroups?.forEach((group: any) => {
    group.LineItems?.forEach((item: any) => {
      const lineItem: any = {
        description: '',
        qty: 1,
        unit_price: 0,
        total: 0,
      };

      item.LineItemExpenseFields?.forEach((field: any) => {
        if (!field.Type?.Text || !field.ValueDetection?.Text) return;

        switch (field.Type.Text) {
          case 'ITEM':
            lineItem.description = field.ValueDetection.Text;
            break;
          case 'QUANTITY':
            lineItem.qty = parseFloat(field.ValueDetection.Text) || 1;
            break;
          case 'UNIT_PRICE':
            lineItem.unit_price = parseFloat(
              field.ValueDetection.Text.replace(/[^0-9.]/g, '')
            ) || 0;
            break;
          case 'PRICE':
            lineItem.total = parseFloat(
              field.ValueDetection.Text.replace(/[^0-9.]/g, '')
            ) || 0;
            break;
        }
      });

      if (lineItem.description && lineItem.total) {
        result.line_items.push(lineItem);
      }
    });
  });

  // Calculate average confidence
  result.confidence = fieldCount > 0 ? confidenceSum / fieldCount : 0.8;

  return result;
}

export const handler = async (event: any) => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));

    // Get S3 bucket and key from event
    const record = event.Records?.[0];
    if (!record) {
      throw new Error('No S3 event record found');
    }

    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing receipt from S3: ${bucket}/${key}`);

    // Extract receipt ID and user ID from S3 key
    // Expected format: receipts/userId/timestamp/filename
    const keyParts = key.split('/');
    if (keyParts.length < 3) {
      throw new Error(`Invalid S3 key format: ${key}`);
    }

    const userId = keyParts[1];
    const filename = keyParts[keyParts.length - 1];
    const receiptId = filename.split('.')[0];

    console.log(`User: ${userId}, Receipt: ${receiptId}`);

    // Get image from S3
    const getObjectResponse = await s3Client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    const imageBytes = await streamToBuffer(getObjectResponse.Body);

    // Call Textract
    console.log('Calling Textract...');
    const textractResponse = await textractClient.send(
      new AnalyzeExpenseCommand({
        Document: {
          Bytes: imageBytes,
        },
      })
    );

    // Parse Textract response
    const ocrData = parseTextractResponse(textractResponse);
    console.log('OCR Data:', JSON.stringify(ocrData, null, 2));

    // Update receipt in Supabase
    console.log('Updating receipt in Supabase...');
    const { error: updateError } = await supabase
      .from('receipts')
      .update({
        vendor_text: ocrData.vendor_text,
        total_amount: ocrData.total_amount,
        currency: ocrData.currency,
        receipt_date: ocrData.receipt_date,
        ocr_json: {
          raw_textract: textractResponse,
          parsed: ocrData,
        },
        ocr_confidence: ocrData.confidence,
        status: 'ocr_done',
        updated_at: new Date().toISOString(),
      })
      .eq('id', receiptId)
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Failed to update receipt: ${updateError.message}`);
    }

    // Insert line items
    if (ocrData.line_items.length > 0) {
      console.log(`Inserting ${ocrData.line_items.length} line items...`);
      const { error: itemsError } = await supabase
        .from('line_items')
        .insert(
          ocrData.line_items.map((item) => ({
            receipt_id: receiptId,
            description: item.description,
            qty: item.qty,
            unit_price: item.unit_price,
            total: item.total,
          }))
        );

      if (itemsError) {
        console.warn(`Failed to insert line items: ${itemsError.message}`);
      }
    }

    console.log('Receipt processed successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Receipt processed successfully',
        receiptId,
        ocrData,
      }),
    };
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
};
```

### 1.2 Update Lambda Environment Variables

Add to AWS Lambda configuration:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AWS_REGION=us-east-1
```

### 1.3 Update Lambda IAM Permissions

Add to Lambda execution role:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "textract:AnalyzeExpense",
        "s3:GetObject"
      ],
      "Resource": "*"
    }
  ]
}
```

**Files to create:**
- `lambda/textract-supabase.ts`

**Files to update:**
- `lambda/package.json` (add @supabase/supabase-js)

---

## ✅ Step 2: Set Up Storage Trigger (1 hour)

### 2.1 Create Storage Webhook

In Supabase Dashboard:
1. Go to **Database** → **Webhooks**
2. Click **Create a new webhook**
3. Configure:
   - **Name:** `receipt-textract-trigger`
   - **Table:** `receipts`
   - **Events:** `INSERT`
   - **HTTP method:** `POST`
   - **URL:** `https://your-lambda-url.amazonaws.com/textract`
   - **Headers:** Add `Authorization: Bearer your-api-key`

### 2.2 Alternative: S3 Event Notification

If using S3 directly:
1. Go to S3 bucket settings
2. **Event notifications**
3. Create notification:
   - **Event types:** `s3:ObjectCreated:*`
   - **Destination:** Lambda function
   - **Prefix:** `receipts/`

**No files to create** (configuration only)

---

## ✅ Step 3: Create Batch Processing Job (2 hours)

### 3.1 Create Batch Processing Function

**File:** `supabase/functions/batch-categorize/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    // Fetch all receipts with status 'ocr_done' (ready for categorization)
    const { data: receipts, error: fetchError } = await supabase
      .from("receipts")
      .select("id, user_id, vendor_text, total_amount, currency, receipt_date, country")
      .eq("status", "ocr_done")
      .limit(100); // Process 100 at a time

    if (fetchError) throw fetchError;

    if (!receipts || receipts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No receipts to process" }),
        { status: 200 }
      );
    }

    console.log(`Processing ${receipts.length} receipts...`);

    // Call categorize function for each receipt
    const results = [];
    for (const receipt of receipts) {
      try {
        const response = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/categorize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({ receipt_id: receipt.id }),
          }
        );

        const result = await response.json();
        results.push({
          receipt_id: receipt.id,
          success: response.ok,
          result,
        });

        console.log(`Categorized receipt ${receipt.id}:`, result);
      } catch (error) {
        console.error(`Error categorizing receipt ${receipt.id}:`, error);
        results.push({
          receipt_id: receipt.id,
          success: false,
          error: String(error),
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Batch processing complete",
        processed: results.length,
        results,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in batch processing:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500 }
    );
  }
});
```

### 3.2 Deploy Batch Function

```bash
supabase functions deploy batch-categorize --no-verify-jwt
```

### 3.3 Set Up Cron Job (Optional)

In Supabase Dashboard:
1. Go to **Database** → **Cron**
2. Create new cron job:
   - **Name:** `batch-categorize`
   - **Function:** `batch-categorize`
   - **Schedule:** `0 * * * *` (every hour)

**Files to create:**
- `supabase/functions/batch-categorize/index.ts`

---

## ✅ Step 4: Test End-to-End Flow (1 hour)

### 4.1 Manual Testing

1. **Upload a receipt**
   - Go to dashboard
   - Upload receipt image
   - Status should be: `pending`

2. **Trigger Textract Lambda**
   - Manually invoke Lambda or wait for S3 trigger
   - Check Supabase: receipt status should change to `ocr_done`
   - Check `raw_ocr` column for Textract data

3. **Trigger Categorization**
   - Call batch-categorize function manually
   - Or wait for cron job
   - Check receipt status: should be `categorized`
   - Check `category_id` and `category_confidence`

4. **Check UI**
   - Confidence pill should appear (green/yellow/red)
   - "Review" chip if confidence < 0.75
   - Can edit and correct category

### 4.2 Verification Queries

```sql
-- Check receipt status
SELECT id, status, vendor_text, total_amount, ocr_confidence, category_id, category_confidence 
FROM receipts 
ORDER BY created_at DESC 
LIMIT 5;

-- Check line items
SELECT * FROM line_items 
WHERE receipt_id = 'your-receipt-id';

-- Check predictions
SELECT * FROM predictions 
WHERE subject_id = 'your-receipt-id' 
ORDER BY created_at DESC;

-- Check corrections
SELECT * FROM corrections 
WHERE subject_id = 'your-receipt-id' 
ORDER BY created_at DESC;
```

---

## 📋 Verification Checklist

- [ ] Lambda function created and deployed
- [ ] Lambda has Supabase credentials in environment
- [ ] Lambda has Textract IAM permissions
- [ ] S3 trigger configured (or webhook)
- [ ] Batch-categorize function deployed
- [ ] Cron job configured (optional)
- [ ] Upload receipt → status changes to `ocr_done`
- [ ] Batch job runs → status changes to `categorized`
- [ ] Confidence pill appears in UI
- [ ] Can correct category and see toast notification
- [ ] Corrections stored in corrections table

---

## 🎯 Success Criteria

- ✅ Upload receipt image
- ✅ Textract extracts text automatically
- ✅ Edge Function categorizes with rules
- ✅ UI shows confidence pill
- ✅ Users can correct predictions
- ✅ Corrections stored for retraining
- ✅ End-to-end flow works

---

## ⏱️ Time Estimate

- Textract Lambda: 3 hours
- Storage trigger: 1 hour
- Batch processing: 2 hours
- Testing: 1 hour
- **Total: ~7 hours**

---

## 🚀 After Week 3

**Phase 3 (Later):**
- Claude reasoning layer for low-confidence cases
- ML model training on corrections
- Advanced analytics dashboard

---

**Ready to start Week 3? 🚀**
