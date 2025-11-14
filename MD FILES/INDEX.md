# Documentation Index

**Last Updated:** November 12, 2025

---

## 🚀 Quick Start

**Start here for production deployment:**
1. Read: [`PRODUCTION_DEPLOYMENT_GUIDE.md`](#production-deployment-guide)
2. Deploy: SQL migration + Lambda worker
3. Reference: [`QUEUE_PATTERN_IMPLEMENTATION.md`](#queue-pattern-implementation) for architecture

---

## 📚 Documentation Files

### Production Setup (Active)

#### **PRODUCTION_DEPLOYMENT_GUIDE.md** ⭐
- **Purpose:** Complete deployment instructions for production
- **Contents:**
  - AWS setup (S3, IAM, Lambda, CloudWatch)
  - Step-by-step deployment
  - Testing procedures
  - Monitoring & alarms
  - Troubleshooting
  - Scaling recommendations
- **For:** DevOps, deployment engineers

#### **QUEUE_PATTERN_IMPLEMENTATION.md**
- **Purpose:** Architecture explanation and implementation guide
- **Contents:**
  - Queue pattern overview
  - Why it's better than webhooks
  - Step-by-step implementation
  - Testing procedures
  - Troubleshooting
  - Monitoring & observability
- **For:** Architects, senior developers

#### **CODEBASE_CLEANUP_SUMMARY.md**
- **Purpose:** Summary of codebase organization and cleanup
- **Contents:**
  - What was cleaned up
  - Current active architecture
  - Archive structure
  - Key improvements
  - Next steps
- **For:** Project maintainers

---

### Phase 2 Implementation

#### **PHASE2_WEEK1_CHECKLIST.md**
- **Purpose:** Week 1 foundation (Database + Rules Engine + Edge Function)
- **Status:** ✅ Complete
- **Contents:**
  - Database schema deployment
  - Rules engine configuration
  - Edge Function deployment
  - Testing & verification

#### **PHASE2_WEEK2_CHECKLIST.md**
- **Purpose:** Week 2 user-facing features (UI, confidence pills, corrections)
- **Status:** 🎯 In Progress
- **Contents:**
  - Confidence pill UI
  - Wire categorization to upload
  - Review chip for low confidence
  - Corrections endpoint

#### **PHASE2_WEEK3_CHECKLIST.md**
- **Purpose:** Week 3 batch processing and OCR enhancement
- **Status:** 📋 Planned
- **Contents:**
  - Batch processing setup
  - OCR enhancement
  - Learning pipeline

---

### Reference & Troubleshooting

#### **WEBHOOK_TROUBLESHOOTING.md**
- **Purpose:** Debugging guide for webhook issues
- **Contents:**
  - Quick debugging checklist
  - Direct answers to common questions
  - Recommended troubleshooting plan
  - SQL trigger alternative
- **For:** Debugging webhook problems

#### **DEPLOYMENT_GUIDE.md**
- **Purpose:** General deployment guide
- **Contents:**
  - Deployment overview
  - Environment setup
  - Verification steps

#### **DEPLOY_EDGE_FUNCTION.md**
- **Purpose:** Edge Function deployment guide
- **Contents:**
  - Edge Function setup
  - Rules engine configuration
  - Deployment steps

#### **IMPLEMENTATION_ROADMAP.md**
- **Purpose:** Overall implementation roadmap
- **Contents:**
  - Phase breakdown
  - Timeline
  - Deliverables

#### **TEST_FLOW.md**
- **Purpose:** End-to-end test flow documentation
- **Contents:**
  - Test plan
  - Expected results
  - Debugging checklist

#### **AWS_SETUP.md** & **AWS_MANUAL_SETUP.md**
- **Purpose:** AWS infrastructure setup
- **Contents:**
  - S3 bucket configuration
  - IAM roles and policies
  - Lambda setup
  - Manual setup instructions

#### **deployment-strategy.md**
- **Purpose:** Deployment strategy overview
- **Contents:**
  - Strategy overview
  - Deployment phases

#### **CHANGELOG.md**
- **Purpose:** Project changelog
- **Contents:**
  - Version history
  - Changes and updates

---

## 🗂️ File Organization

```
Snapceit-main/
├── README.md (main project readme)
├── MD FILES/
│   ├── INDEX.md (this file)
│   ├── PRODUCTION_DEPLOYMENT_GUIDE.md ⭐
│   ├── QUEUE_PATTERN_IMPLEMENTATION.md
│   ├── CODEBASE_CLEANUP_SUMMARY.md
│   ├── PHASE2_WEEK1_CHECKLIST.md
│   ├── PHASE2_WEEK2_CHECKLIST.md
│   ├── PHASE2_WEEK3_CHECKLIST.md
│   ├── WEBHOOK_TROUBLESHOOTING.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── DEPLOY_EDGE_FUNCTION.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   ├── TEST_FLOW.md
│   ├── AWS_SETUP.md
│   ├── AWS_MANUAL_SETUP.md
│   ├── deployment-strategy.md
│   └── CHANGELOG.md
├── supabase/
│   └── migrations/
│       ├── 20251111230000_add_receipt_queue.sql
│       ├── 20251112000000_production_queue_with_dlq.sql ⭐
│       └── _archive/ (old migrations)
└── lambda/
    ├── receipt-textract-worker-prod.js ⭐
    ├── index.js
    └── _archive/ (old workers)
```

---

## 🎯 By Use Case

### I want to deploy to production
→ Read: [`PRODUCTION_DEPLOYMENT_GUIDE.md`](#production-deployment-guide)

### I want to understand the architecture
→ Read: [`QUEUE_PATTERN_IMPLEMENTATION.md`](#queue-pattern-implementation)

### I'm debugging webhook issues
→ Read: [`WEBHOOK_TROUBLESHOOTING.md`](#webhook-troubleshooting)

### I want to see what changed
→ Read: [`CODEBASE_CLEANUP_SUMMARY.md`](#codebase-cleanup-summary)

### I'm implementing Phase 2
→ Read: [`PHASE2_WEEK1_CHECKLIST.md`](#phase2-week1-checklist), [`PHASE2_WEEK2_CHECKLIST.md`](#phase2-week2-checklist), [`PHASE2_WEEK3_CHECKLIST.md`](#phase2-week3-checklist)

### I need AWS setup instructions
→ Read: [`AWS_SETUP.md`](#aws-setupmd--aws-manual-setupmd) or [`AWS_MANUAL_SETUP.md`](#aws-setupmd--aws-manual-setupmd)

### I want to test the end-to-end flow
→ Read: [`TEST_FLOW.md`](#test-flowmd)

---

## 📊 Status Overview

| Component | Status | Reference |
|-----------|--------|-----------|
| **Production Queue** | ✅ Ready | `PRODUCTION_DEPLOYMENT_GUIDE.md` |
| **Production Lambda** | ✅ Ready | `PRODUCTION_DEPLOYMENT_GUIDE.md` |
| **Phase 2 Week 1** | ✅ Complete | `PHASE2_WEEK1_CHECKLIST.md` |
| **Phase 2 Week 2** | 🎯 In Progress | `PHASE2_WEEK2_CHECKLIST.md` |
| **Phase 2 Week 3** | 📋 Planned | `PHASE2_WEEK3_CHECKLIST.md` |
| **Webhook Troubleshooting** | ✅ Complete | `WEBHOOK_TROUBLESHOOTING.md` |

---

## 🔗 Quick Links

- **Production Deployment:** [`PRODUCTION_DEPLOYMENT_GUIDE.md`](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- **Architecture:** [`QUEUE_PATTERN_IMPLEMENTATION.md`](./QUEUE_PATTERN_IMPLEMENTATION.md)
- **Cleanup Summary:** [`CODEBASE_CLEANUP_SUMMARY.md`](./CODEBASE_CLEANUP_SUMMARY.md)
- **Troubleshooting:** [`WEBHOOK_TROUBLESHOOTING.md`](./WEBHOOK_TROUBLESHOOTING.md)
- **Phase 2 Week 1:** [`PHASE2_WEEK1_CHECKLIST.md`](./PHASE2_WEEK1_CHECKLIST.md)
- **Phase 2 Week 2:** [`PHASE2_WEEK2_CHECKLIST.md`](./PHASE2_WEEK2_CHECKLIST.md)
- **Phase 2 Week 3:** [`PHASE2_WEEK3_CHECKLIST.md`](./PHASE2_WEEK3_CHECKLIST.md)

---

## 📝 Notes

- All production files are marked with ⭐
- Old/archived files are in `_archive/` folders
- For deployment, start with `PRODUCTION_DEPLOYMENT_GUIDE.md`
- For architecture understanding, read `QUEUE_PATTERN_IMPLEMENTATION.md`
