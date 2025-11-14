# Cost Analysis: 2000 Receipts

## Summary
**Total Monthly Cost: ~$220-250**
**Total for 2000 receipts: ~$220-250** (one-time processing)

---

## Detailed Breakdown

### AWS Costs

#### 1. Textract (OCR Processing)
- **Rate:** $0.10 per receipt
- **For 2000 receipts:** 2000 × $0.10 = **$200**
- **Notes:** 
  - One-time cost per receipt
  - Includes text extraction, confidence scores
  - Stores raw OCR JSON in S3

#### 2. S3 Storage (OCR Artifacts)
- **Rate:** $0.023 per GB/month
- **Storage per receipt:** ~50 KB (OCR JSON + metadata)
- **For 2000 receipts:** 2000 × 50 KB = 100 GB
- **Monthly cost:** 100 GB × $0.023 = **$2.30/month**
- **Notes:**
  - Stores full Textract response
  - Durable artifact for audit trail
  - Can be archived after 90 days for cheaper storage

#### 3. Lambda (Receipt Processing)
- **Rate:** $0.0000002 per GB-second + $0.20 per 1M requests
- **Per receipt:** ~2 seconds, 1024 MB = 2 GB-seconds
- **For 2000 receipts:** 
  - Compute: 2000 × 2 × $0.0000002 = **$0.80**
  - Requests: 2000 × $0.20/1M = **$0.0004** (negligible)
- **Total Lambda:** **~$0.80** (one-time)
- **Notes:**
  - Runs every 30 seconds (polling)
  - Most time is waiting for Textract
  - Scales automatically

#### 4. Lambda (Claude Categorization - Phase 3)
- **Rate:** $0.0000002 per GB-second + $0.20 per 1M requests
- **Per receipt:** ~3 seconds, 512 MB = 1.5 GB-seconds
- **For 2000 receipts:** 
  - Compute: 2000 × 1.5 × $0.0000002 = **$0.60**
  - Requests: 2000 × $0.20/1M = **$0.0004** (negligible)
- **Total Lambda:** **~$0.60** (one-time, Phase 3)
- **Notes:**
  - Only runs if Claude categorization enabled
  - Can be scheduled for off-peak hours

#### 5. CloudWatch Logs
- **Rate:** $0.50 per GB ingested
- **Per receipt:** ~2 KB logs
- **For 2000 receipts:** 2000 × 2 KB = 4 GB
- **Cost:** 4 GB × $0.50 = **$2.00** (one-time)
- **Notes:**
  - Includes Lambda logs, errors, debugging
  - Can set retention to 7 days to reduce cost

#### 6. Data Transfer (S3 to Lambda)
- **Rate:** $0.09 per GB (out of AWS)
- **For 2000 receipts:** 2000 × 50 KB = 100 GB
- **Cost:** 100 GB × $0.09 = **$9.00** (one-time)
- **Notes:**
  - Only if transferring data out of AWS
  - Internal AWS transfers are free

**AWS Total (One-time):** $200 + $0.80 + $0.60 + $2.00 + $9.00 = **$212.40**
**AWS Monthly (Ongoing):** $2.30 (S3 storage)

---

### Supabase Costs

#### 1. Database (PostgreSQL)
- **Plan:** Free tier (up to 500 MB) or Pro ($25/month)
- **For 2000 receipts:**
  - Receipts table: ~2000 × 5 KB = 10 MB
  - Corrections table: ~500 × 2 KB = 1 MB
  - Predictions table: ~2000 × 3 KB = 6 MB
  - **Total:** ~20 MB (fits in free tier!)
- **Cost:** **FREE** (or $25/month for Pro with more features)
- **Notes:**
  - Free tier includes 500 MB
  - Pro tier: $25/month, unlimited storage
  - Includes backups, SSL, API

#### 2. Storage (Supabase Storage)
- **Rate:** $5 per 100 GB/month
- **For 2000 receipts:**
  - Receipt images: 2000 × 500 KB = 1000 GB
  - Avatar images: ~50 × 200 KB = 10 MB
  - **Total:** ~1000 GB
- **Cost:** 1000 GB ÷ 100 × $5 = **$50/month**
- **Notes:**
  - Stores actual receipt images
  - Avatar storage is minimal
  - Can use CDN for faster delivery (+$0.085/GB)

#### 3. API Calls (Realtime & REST)
- **Rate:** Included in Pro plan
- **For 2000 receipts:**
  - Initial upload: 2000 calls
  - Polling (30s interval): ~2880 calls/day
  - User corrections: ~100 calls
- **Cost:** **FREE** (included in Pro)
- **Notes:**
  - Free tier: 2M API calls/month
  - Pro tier: Unlimited API calls

#### 4. Auth (Supabase Auth)
- **Rate:** FREE for up to 50,000 users
- **For your app:** ~10-100 users
- **Cost:** **FREE**
- **Notes:**
  - Includes email/password, OAuth, MFA
  - No per-user charges

**Supabase Total (One-time):** $0
**Supabase Monthly:** $50 (storage) + $0-25 (database) = **$50-75/month**

---

### Third-Party Costs (Phase 3)

#### Claude API (Anthropic)
- **Rate:** $0.003 per receipt (input + output)
- **For 2000 receipts:** 2000 × $0.003 = **$6.00** (one-time)
- **Monthly (if categorizing new receipts):** ~$6-10/month
- **Notes:**
  - Only if Phase 3 Claude categorization enabled
  - Can batch requests for better pricing

---

## Total Cost Summary

### One-Time Costs (Processing 2000 receipts)
| Component | Cost |
|-----------|------|
| Textract | $200.00 |
| Lambda (Textract) | $0.80 |
| Lambda (Claude) | $0.60 |
| CloudWatch Logs | $2.00 |
| Data Transfer | $9.00 |
| Claude API | $6.00 |
| **Total One-Time** | **$218.40** |

### Monthly Recurring Costs
| Component | Cost |
|-----------|------|
| S3 Storage | $2.30 |
| Supabase Storage | $50.00 |
| Supabase Database | $0-25.00 |
| Claude API | $6-10.00 |
| **Total Monthly** | **$58.30-87.30** |

---

## Cost Per Receipt

| Metric | Cost |
|--------|------|
| **One-time per receipt** | $0.109 |
| **Monthly per receipt** | $0.029-0.044 |
| **Annual per receipt** | $0.44-0.63 |

---

## Optimization Strategies

### 1. Reduce S3 Storage Costs
- Archive OCR artifacts after 90 days to Glacier ($0.004/GB)
- **Savings:** ~$1.50/month

### 2. Use Supabase Free Tier
- Keep database under 500 MB (easy with 2000 receipts)
- **Savings:** $25/month

### 3. Compress Images
- Reduce receipt images from 500 KB to 200 KB
- **Savings:** ~$20/month

### 4. Batch Claude Requests
- Process categorization in batches (off-peak)
- **Savings:** ~$1-2/month

### 5. Use CloudFront CDN
- Cache receipt images for faster delivery
- **Cost:** $0.085/GB (but reduces storage costs)
- **Net savings:** ~$5-10/month

**Total Optimized Monthly Cost: $25-40**

---

## Scaling Scenarios

### 10,000 Receipts
- Textract: $1,000
- Monthly: $150-200
- **Total:** ~$1,150

### 50,000 Receipts
- Textract: $5,000
- Monthly: $500-700
- **Total:** ~$5,500

### 100,000 Receipts
- Textract: $10,000
- Monthly: $800-1,200
- **Total:** ~$10,800

---

## Cost Comparison: Alternatives

### Option 1: Manual Data Entry
- **Cost:** $5-10 per receipt (human labor)
- **For 2000:** $10,000-20,000
- **Verdict:** ❌ Way more expensive

### Option 2: Google Vision API
- **Cost:** $1.50 per receipt
- **For 2000:** $3,000
- **Verdict:** ❌ 15x more expensive than Textract

### Option 3: Fully Managed Service (e.g., Expensify)
- **Cost:** $5-15 per user/month
- **For 10 users:** $50-150/month
- **For 2000 receipts:** $600-1,800/year
- **Verdict:** ❌ More expensive + less control

### Option 4: Your Solution (Snapceit)
- **Cost:** $218 one-time + $58-87/month
- **For 2000 receipts:** ~$700-1,200/year
- **Verdict:** ✅ Most cost-effective + full control

---

## ROI Analysis

### Assumptions:
- Average receipt: $50
- Tax deduction rate: 80%
- Tax rate: 30%
- Time saved per receipt: 2 minutes

### Benefits:
- **Tax savings:** 2000 × $50 × 80% × 30% = **$24,000**
- **Time saved:** 2000 × 2 min = 4000 min = 67 hours = **$3,350** (at $50/hr)
- **Total benefit:** **$27,350**

### Cost:
- **One-time:** $218
- **Annual:** $700-1,200

### ROI:
- **Year 1:** ($27,350 - $218 - $700) / $218 = **12,300% ROI** 🚀
- **Payback period:** < 1 day

---

## Recommendations

### For MVP (2000 receipts):
- ✅ Use Supabase Free tier (database)
- ✅ Use Supabase Storage ($50/month)
- ✅ Use AWS Textract ($200 one-time)
- ✅ Skip Claude Phase 3 for now
- **Total:** $218 one-time + $52/month

### For Production (10,000+ receipts):
- ✅ Upgrade to Supabase Pro ($25/month)
- ✅ Enable Claude categorization ($6-10/month)
- ✅ Archive old OCR artifacts (save $1.50/month)
- ✅ Compress images (save $20/month)
- **Total:** ~$60-80/month

### For Enterprise (100,000+ receipts):
- ✅ Use dedicated database server
- ✅ Use S3 with CloudFront CDN
- ✅ Batch processing for Claude
- ✅ ML model training (one-time)
- **Total:** ~$800-1,200/month

---

## Conclusion

**For 2000 receipts: ~$220 one-time + $50-75/month**

This is extremely cost-effective compared to:
- Manual entry: $10,000-20,000
- Competing services: $600-1,800/year
- Your time: Priceless ✨

The system pays for itself in tax savings within the first day! 🎉

