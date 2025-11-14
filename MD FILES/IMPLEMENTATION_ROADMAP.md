# 🚀 Snapceit Implementation Roadmap

## 📊 Current Status (Phase 1 - Complete ✅)

### ✅ **Completed Features**
- Supabase Auth integration (migrated from Cognito)
- PostgreSQL database with RLS policies
- Storage bucket for receipt images (public)
- Receipt CRUD operations via Supabase
- Basic Shadcn/ui components (Button, Card)
- Hybrid OCR flow (Storage → Textract → Database)
- Database indexes for performance
- **Multi-file upload** (drag & drop)
- **Receipt viewing modal** (image display)
- **Delete with cleanup** (Storage + DB)
- **Status tracking** (pending/processing/completed)
- **Professional UI** (purple gradient, timestamps, badges)
- **User isolation** (RLS policies)

🟡 **In Progress**
- TypeScript fixes for Supabase User type
- End-to-end testing of upload flow
- Dashboard UI refactoring with Shadcn (preserving purple gradient theme)

## 🎯 Phase 2: Intelligent Categorization Pipeline (Senior Dev Architecture)

### Overview
Three-tier classification system: **Rules → ML → LLM** with confidence scoring, ensemble voting, and human-in-the-loop learning.

### 2A: Database Schema Updates (Week 1)

#### New Tables Required:
```sql
-- Vendor canonicalization & aliases
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  name_norm TEXT UNIQUE,
  aliases TEXT[],
  website TEXT,
  country TEXT,
  last_seen_at TIMESTAMP
);

-- Categorization predictions with confidence
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type ENUM('receipt', 'line_item'),
  subject_id UUID NOT NULL,
  category_id INTEGER NOT NULL,
  confidence NUMERIC(3,2),
  method ENUM('rule', 'ml', 'llm', 'ensemble'),
  version TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User corrections for retraining
CREATE TABLE corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type ENUM('receipt', 'line_item'),
  subject_id UUID NOT NULL,
  category_id INTEGER NOT NULL,
  reason TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual line items from receipts
CREATE TABLE line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  description TEXT,
  qty NUMERIC,
  unit_price NUMERIC,
  total NUMERIC,
  ocr_span_ref TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ML feature cache (optional)
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type ENUM('receipt', 'line_item'),
  subject_id UUID NOT NULL,
  feature_json JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Update receipts table:
```sql
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS category_confidence NUMERIC(3,2);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS vendor_text TEXT;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS vendor_normalized TEXT;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS ocr_confidence NUMERIC(3,2);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US';
```

#### Update categories table:
```sql
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS tax_code TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_deductible BOOLEAN DEFAULT FALSE;
```

**Files to create:**
- `supabase-schema-phase2.sql` (new tables + updates)

**Files to update:**
- `supabase-schema.sql` (add new tables)

---

### 2B: Rules Engine (Week 1-2)

#### Create Rules Configuration:
```json
// rules.json (stored in Supabase Storage or env)
{
  "version": "2025-11-08",
  "categoryMap": {
    "Groceries": 1,
    "Fuel": 2,
    "Transport": 3,
    "Software": 4,
    "Lodging": 5,
    "Meals": 6,
    "Phone & Internet": 7,
    "Office Supplies": 8,
    "Repairs & Maintenance": 9,
    "Utilities": 10,
    "Subscriptions": 11
  },
  "vendors": [
    { "pattern": "(tesco|sainsbury|asda|aldi|lidl)", "category": "Groceries", "confidence": 0.78 },
    { "pattern": "(shell|bp|esso|texaco|total)", "category": "Fuel", "confidence": 0.8 },
    { "pattern": "(uber|bolt|lyft)", "category": "Transport", "confidence": 0.75 },
    { "pattern": "(aws|digitalocean|namecheap|godaddy|cloudflare)", "category": "Software", "confidence": 0.8 }
  ],
  "keywords": [
    { "pattern": "diesel|petrol|gasoline|fuel", "category": "Fuel", "confidence": 0.7 },
    { "pattern": "ride|trip fare|airport transfer|taxi", "category": "Transport", "confidence": 0.67 },
    { "pattern": "domain|hosting|ssl|server|compute|cdn|saas", "category": "Software", "confidence": 0.72 },
    { "pattern": "meal|food|restaurant|cafe|dine|takeaway", "category": "Meals", "confidence": 0.65 }
  ]
}
```

#### Deploy Edge Function:
```typescript
// supabase/functions/categorize/index.ts
// POST /functions/v1/categorize
// Body: { receipt_id: string, min_confidence?: number }
// Returns: { ok: true, category_id, confidence, method }
```

**Files to create:**
- `supabase/functions/categorize/index.ts` (Edge Function)
- `rules.json` (configuration)

**Files to update:**
- `src/utils/rules.ts` (rules engine logic)

---

### 2C: Confidence Scoring & UI (Week 2)

#### Update Receipt Display:
- Show confidence pill (color-coded: red < 0.65, yellow 0.65-0.75, green > 0.75)
- Display method used (rule/ml/llm/ensemble)
- Show "Review" chip for low confidence (< 0.75)

#### Add Corrections UI:
- Allow users to override category
- POST to `/corrections` endpoint
- Immediate re-score similar receipts

**Files to update:**
- `src/components/dashboard/receipts/RecentReceiptsCard.tsx` (add confidence pill)
- `src/components/dashboard/receipts/EditReceiptModal.tsx` (add category override)
- `src/components/dashboard/receipts/ReceiptContext.tsx` (add corrections endpoint)

---

### 2D: OCR Enhancement (Week 2-3)

#### Pre-processing:
```
1. Deskew + dewarp (OpenCV)
2. Binarize & contrast (adaptive threshold)
3. Upscale to 300-400 DPI
4. Remove shadows & margins
5. Split long receipts into panels
```

#### Post-parse Normalization:
```
1. Totals reconciliation (regex + rightmost alignment)
2. Date disambiguation (numerals near "Date", fallback to context)
3. Currency normalization (symbol near total, else country prior)
```

#### Fallback OCR:
```
1. If Textract confidence < threshold
2. Try PaddleOCR or Tesseract
3. Pick field with higher confidence
```

**Files to create:**
- `supabase/functions/preprocess-receipt/index.ts` (image preprocessing)
- `src/utils/ocr-postprocess.ts` (normalization logic)

**Files to update:**
- AWS Lambda Textract handler (add pre/post-processing)

---

### 2E: Human-in-the-Loop Learning (Week 3)

#### Corrections Flow:
```
1. User sees low-confidence prediction
2. User corrects category
3. Correction stored in `corrections` table
4. Nightly job: retrain ML model
5. Model improves, fewer reviews needed
```

#### Retraining Job:
```
1. Read corrections + initial labels
2. Extract features
3. Train XGBoost/LightGBM
4. Export as ONNX
5. Deploy to Edge Function
6. Update model version
```

**Files to create:**
- `scripts/retrain-model.py` (nightly retraining)
- `src/utils/ml-features.ts` (feature extraction)

---

### 2F: Tax-Ready Features (Week 3-4)

#### Tax Categorization:
```
1. Map categories to tax codes (Schedule C, HMRC, etc.)
2. Track deductible vs non-deductible
3. Generate tax reports by quarter/year
4. Export for accountant
```

**Files to create:**
- `src/components/dashboard/tax/TaxDetailsCard.tsx`
- `src/utils/tax-calculator.ts`

**Files to update:**
- `src/components/dashboard/receipts/ReceiptContext.tsx` (add tax calculations)

### 2. Enhanced Security with Signed URLs
**Goal**: Protect user receipt images with temporary access

#### Implementation Steps:
```
1. Switch Storage bucket to private
   - Remove public access
   - Enable RLS on storage.objects
   - Add policy: users can only access paths matching 'userId/*'

2. Generate signed URLs
   - Create helper function
   - 1-hour expiry for viewing
   - Refresh on demand

3. Update image display
   - Replace public URLs with signed
   - Handle URL expiry/refresh
   - Cache URLs client-side
```

**Files to modify:**
- Create: `src/utils/storage.ts`
- Update: `src/components/dashboard/receipts/ReceiptCard.tsx`
- Update: `src/components/dashboard/receipts/ReceiptContext.tsx`

### 3. Image Optimization Pipeline
**Goal**: Reduce bandwidth with thumbnails

#### Implementation Steps:
```
1. Add image processing function
   - Trigger on upload
   - Generate 3 sizes: thumb (150px), medium (500px), original
   - Store in separate folders

2. Smart loading strategy
   - List view: thumbnails
   - Detail view: medium
   - Download: original
```

**Files to create:**
- `supabase/functions/generate-thumbnails/index.ts`

---

## 🚦 **PRIORITY CLARIFICATION - Week 2 vs Phase 3**

### **Week 2 is CRITICAL (Do First) ⭐⭐⭐**
Week 2 features are **user-facing and essential**:
- ✅ Confidence pill (users see predictions work)
- ✅ Wire categorization to upload (end-to-end flow)
- ✅ Review chip (flag uncertain predictions)
- ✅ Corrections endpoint (users improve model)

**Why Week 2 first:**
- Users need to SEE the system working
- Feedback loop trains the model
- Builds trust and engagement
- Foundation for Phase 3

### **Phase 3 Claude Reasoning (Do Later) ⭐**
Phase 3 is **optimization, not essential**:
- Claude reasoning layer (improves accuracy from 78% → 95%)
- ML model training (learns from corrections)
- LLM fallback (handles edge cases)

**Why Phase 3 can wait:**
- Rules engine already works (78-80% accuracy)
- Not blocking user-facing features
- Can add anytime without breaking Week 2
- Requires Phase 2 data to train properly

### **Timeline**
```
Week 1 ✅ DONE
├─ Database schema
├─ Rules engine
└─ Edge Function deployed

Week 2 🎯 NEXT (CRITICAL - USER FACING)
├─ Confidence pill UI
├─ Wire to upload flow
├─ Review chip
└─ Corrections endpoint

Week 3
├─ OCR enhancement
└─ Learning pipeline

Phase 3 (LATER - OPTIMIZATION)
├─ Claude reasoning layer
├─ ML model training
└─ LLM fallback
```

---

## 🔧 Phase 3: Developer Experience

### 1. Data Layer Enhancement
**Goal**: Better caching and form handling

#### TanStack Query Integration
```typescript
// src/hooks/useReceipts.ts
export const useReceipts = () => {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: fetchReceipts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

#### React Hook Form + Zod
```typescript
// src/schemas/receipt.ts
export const receiptSchema = z.object({
  merchant: z.string().min(1),
  total: z.number().positive(),
  date: z.date(),
  category: z.enum(['Food', 'Transport', ...]),
});
```

**Files to create:**
- `src/hooks/useReceipts.ts`
- `src/hooks/useMutateReceipt.ts`
- `src/schemas/receipt.ts`
- `src/components/forms/ReceiptForm.tsx`

### 2. Testing Infrastructure
**Goal**: Confidence in deployments

#### Unit Tests (Vitest)
```typescript
// src/utils/receipt-processor.test.ts
describe('Receipt Processor', () => {
  it('should extract merchant name', () => {
    // Test OCR data parsing
  });
});
```

#### E2E Tests (Playwright)
```typescript
// tests/receipt-upload.spec.ts
test('user can upload receipt', async ({ page }) => {
  await page.goto('/dashboard');
  await page.setInputFiles('input[type="file"]', 'receipt.jpg');
  await expect(page.locator('.receipt-card')).toBeVisible();
});
```

**Files to create:**
- `vitest.config.ts`
- `playwright.config.ts`
- `tests/auth.spec.ts`
- `tests/receipt-upload.spec.ts`

### 3. CI/CD Pipeline
**Goal**: Automated quality checks

#### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npx playwright test
```

**Files to create:**
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml` (for Netlify/Vercel deployment)

## 📈 Phase 4: Advanced Features

### 1. Analytics Dashboard
- Spending trends charts (Chart.js/Recharts)
- Budget tracking with alerts
- Category breakdowns
- Monthly/yearly comparisons

### 2. Export & Sharing
- CSV export for receipts (move to Phase 3 for quick win)
- PDF export for taxes
- Share receipts via link
- Bulk operations
- Receipt templates

### 3. Multi-tenancy
- Team workspaces
- Role-based access
- Shared categories/tags
- Approval workflows

## 🛠️ Technical Debt to Address

### Immediate (Before Phase 2)
- [ ] Fix TypeScript errors (User type)
- [ ] Add error boundaries
- [ ] Implement proper loading states
- [ ] Add toast notifications for actions
- [ ] Test RLS policies with second user account
- [ ] Add user.created webhook to seed default categories

### Medium Priority
- [ ] Migrate from public to signed URLs
- [ ] Add request rate limiting
- [ ] Implement retry logic for OCR
- [ ] Add database migrations strategy

### Long Term
- [ ] Consider moving to monorepo
- [ ] Add OpenAPI documentation
- [ ] Implement caching strategy
- [ ] Add performance monitoring

## 📝 Environment Variables Needed

```env
# Current
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Phase 2
SUPABASE_SERVICE_ROLE_KEY= # For Edge Functions
AWS_ACCESS_KEY_ID=         # For Textract
AWS_SECRET_ACCESS_KEY=     # For Textract
AWS_REGION=                # For Textract

# Phase 3
SENTRY_DSN=                # For error tracking
GITHUB_TOKEN=              # For CI/CD
NETLIFY_AUTH_TOKEN=        # For deployment
VERCEL_TOKEN=              # Alternative deployment
```

## 🎯 Success Metrics

### Phase 2
- [ ] OCR processing < 5 seconds
- [ ] 100% of images using signed URLs
- [ ] Zero unauthorized image access

### Phase 3
- [ ] 90% test coverage
- [ ] < 2 second page load
- [ ] Zero runtime errors in production

### Phase 4
- [ ] 1000+ active users
- [ ] < 100ms API response time
- [ ] 99.9% uptime

## 🚦 Next Immediate Steps (Phase 2 - Week by Week)

### Week 1: Foundation
**Priority: Database + Rules Engine**

1. **Add new tables** (2 hours)
   - Run `supabase-schema-phase2.sql`
   - Create: vendors, predictions, corrections, line_items, features
   - Update: receipts, categories with new columns
   - Add RLS policies

2. **Create rules.json** (1 hour)
   - Define vendor patterns (Tesco, Shell, Uber, AWS, etc.)
   - Define keyword patterns (fuel, ride, domain, meal, etc.)
   - Map categories to IDs
   - Version control

3. **Deploy Edge Function** (3 hours)
   - Create `supabase/functions/categorize/index.ts`
   - Implement rules engine (normalizeText, applyRules)
   - Wire predictions table writes
   - Test locally with Supabase CLI

**Deliverable:** POST /functions/v1/categorize works with rules

---

### Week 2: UI + Confidence Scoring
**Priority: User Feedback Loop**

4. **Add confidence UI** (2 hours)
   - Update `RecentReceiptsCard.tsx`: show confidence pill
   - Color-code: red (<0.65), yellow (0.65-0.75), green (>0.75)
   - Show method used (rule/ml/llm)
   - Show "Review" chip for low confidence

5. **Add corrections endpoint** (2 hours)
   - Update `ReceiptContext.tsx`: POST /corrections
   - Store user overrides in corrections table
   - Trigger re-score of similar receipts
   - Show success toast

6. **Wire categorization to upload** (2 hours)
   - After Textract completes, call /categorize
   - Update receipt status: pending → categorized
   - Show confidence in UI

**Deliverable:** Users see predictions with confidence, can correct them

---

### Week 3: OCR Enhancement + Learning
**Priority: Accuracy Improvement**

7. **OCR pre-processing** (3 hours)
   - Add deskew/dewarp to Lambda
   - Implement binarization for thermal receipts
   - Upscale to 300 DPI
   - Test with skewed/low-light receipts

8. **OCR post-processing** (2 hours)
   - Implement totals reconciliation
   - Date disambiguation logic
   - Currency normalization
   - Create `src/utils/ocr-postprocess.ts`

9. **Retraining pipeline** (3 hours)
   - Create `scripts/retrain-model.py` (stub)
   - Read corrections table
   - Extract features
   - Train XGBoost (local for now)
   - Document process

**Deliverable:** Better OCR accuracy, corrections feed into model

---

### Week 4: Tax Features + Polish
**Priority: Business Value**

10. **Tax categorization** (2 hours)
    - Update categories table with tax_code, is_deductible
    - Create `src/utils/tax-calculator.ts`
    - Calculate deductible totals by category

11. **Tax dashboard** (3 hours)
    - Create `src/components/dashboard/tax/TaxDetailsCard.tsx`
    - Show deductible vs non-deductible by month/quarter
    - Export tax summary

12. **Polish & testing** (2 hours)
    - End-to-end testing
    - Error handling
    - Performance optimization

**Deliverable:** Tax-ready receipts, users can see deductible totals

---

## 📊 Phase 2 Summary

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | DB + Rules | POST /categorize works |
| 2 | UI + Feedback | Users see predictions, can correct |
| 3 | OCR + Learning | Better accuracy, retraining pipeline |
| 4 | Tax + Polish | Tax dashboard, production-ready |

**Total: 4 weeks (20-25 hours of work)**

---

## 🎯 Phase 3: ML Model + Advanced Features (After Phase 2)

- Train XGBoost on corrections
- Deploy ML model to Edge Function
- Wire LLM fallback (Claude/Bedrock)
- Ensemble voting
- Advanced analytics dashboard

---

**Estimated Timeline**:
- Phase 2: 4 weeks (intelligent categorization)
- Phase 3: 3-4 weeks (ML + LLM)
- Phase 4: 4-6 weeks (advanced features)

**Total to Production**: ~12-14 weeks for full intelligent system
