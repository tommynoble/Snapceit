# Phase 4: Tax & Accounting Integration 📊

## Overview
Transform Snapceit into a complete tax and accounting solution by integrating Schedule C generation, QuickBooks sync, and tax optimization features.

## Vision
Users can:
- ✅ Generate IRS Schedule C forms from receipt data
- ✅ Sync receipts to QuickBooks automatically
- ✅ Get tax optimization recommendations
- ✅ Track quarterly estimated taxes
- ✅ Export tax reports for accountants

---

## 1. Schedule C Generation 📋

### What is Schedule C?
- IRS Form for self-employment income/expenses
- Required for freelancers, contractors, small business owners
- Filed with Form 1040

### Implementation

#### 1.1 Tax Category Mapping
Create mapping between receipt categories and IRS tax codes:

```typescript
// services/taxCategoryMapping.ts
export const TAX_CATEGORY_MAP = {
  // Income
  'services': { code: '1040-SC-1a', label: 'Gross income from business' },
  'consulting': { code: '1040-SC-1a', label: 'Gross income from business' },
  
  // Expenses
  'office_supplies': { code: '1040-SC-27a', label: 'Office supplies' },
  'utilities': { code: '1040-SC-25', label: 'Utilities' },
  'rent': { code: '1040-SC-20', label: 'Rent or lease' },
  'vehicle': { code: '1040-SC-9', label: 'Car and truck expenses' },
  'meals': { code: '1040-SC-24b', label: 'Meals and entertainment (50%)' },
  'travel': { code: '1040-SC-24a', label: 'Travel' },
  'equipment': { code: '1040-SC-13', label: 'Depreciation' },
  'insurance': { code: '1040-SC-15', label: 'Insurance' },
  'professional_services': { code: '1040-SC-17', label: 'Legal and professional services' },
  'advertising': { code: '1040-SC-8', label: 'Advertising' },
  'software': { code: '1040-SC-27a', label: 'Office supplies' },
  'subscriptions': { code: '1040-SC-27a', label: 'Office supplies' },
};
```

#### 1.2 Deduction Calculation Engine
```typescript
// services/deductionCalculator.ts
interface DeductionSummary {
  category: string;
  total: number;
  deductible: number;
  rate: number; // e.g., 0.5 for meals (50% deductible)
  notes: string;
}

export function calculateDeductions(receipts: Receipt[]): DeductionSummary[] {
  // Group by category
  // Apply deduction rates
  // Calculate totals
  // Return summary
}

export function calculateScheduleC(deductions: DeductionSummary[], income: number) {
  // Calculate gross profit
  // Calculate total deductions
  // Calculate net profit/loss
  // Return Schedule C data
}
```

#### 1.3 PDF Generation
```typescript
// services/scheduleCGenerator.ts
import PDFDocument from 'pdfkit';

export async function generateScheduleC(
  userData: UserData,
  year: number,
  deductions: DeductionSummary[]
): Promise<Buffer> {
  const doc = new PDFDocument();
  
  // Add IRS form header
  // Add user info
  // Add income section
  // Add expense breakdown
  // Add totals
  // Add signature line
  
  return doc.getBuffer();
}
```

#### 1.4 Database Schema
```sql
-- Add to Supabase
CREATE TABLE schedule_c_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  year INT NOT NULL,
  gross_income DECIMAL(10, 2),
  total_deductions DECIMAL(10, 2),
  net_profit DECIMAL(10, 2),
  generated_at TIMESTAMP DEFAULT NOW(),
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, year)
);

CREATE TABLE schedule_c_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES schedule_c_reports(id),
  category TEXT NOT NULL,
  tax_code TEXT NOT NULL,
  amount DECIMAL(10, 2),
  deductible_amount DECIMAL(10, 2),
  deduction_rate DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 2. QuickBooks Integration 🔗

### Overview
Sync Snapceit receipts to QuickBooks Online for real-time accounting.

### Implementation

#### 2.1 QuickBooks OAuth Setup
```typescript
// services/quickbooksAuth.ts
import { OAuth2Client } from 'google-auth-library';

export class QuickBooksAuthService {
  private client: OAuth2Client;
  
  constructor() {
    this.client = new OAuth2Client(
      process.env.QUICKBOOKS_CLIENT_ID,
      process.env.QUICKBOOKS_CLIENT_SECRET,
      process.env.QUICKBOOKS_REDIRECT_URI
    );
  }
  
  getAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['com.intuit.quickbooks.accounting'],
    });
  }
  
  async getAccessToken(code: string): Promise<string> {
    const { tokens } = await this.client.getToken(code);
    return tokens.access_token;
  }
}
```

#### 2.2 Receipt Sync Service
```typescript
// services/quickbooksSyncService.ts
export class QuickBooksSyncService {
  async syncReceiptToQBO(receipt: Receipt, qboToken: string): Promise<void> {
    // 1. Map receipt to QBO transaction
    const transaction = this.mapReceiptToTransaction(receipt);
    
    // 2. Create or update in QBO
    const response = await this.createQBOTransaction(transaction, qboToken);
    
    // 3. Store sync record
    await this.storeSyncRecord(receipt.id, response.id);
  }
  
  private mapReceiptToTransaction(receipt: Receipt) {
    return {
      docNumber: receipt.id,
      txnDate: receipt.date,
      line: [
        {
          description: receipt.merchant,
          amount: receipt.total,
          detailType: 'ExpenseLineDetail',
          expenseLineDetail: {
            accountRef: this.getCategoryAccount(receipt.category),
            taxCodeRef: this.getTaxCode(receipt.category),
          },
        },
      ],
      accountRef: this.getPaymentAccount(receipt.paymentMethod),
    };
  }
  
  private async createQBOTransaction(transaction: any, token: string) {
    const response = await fetch('https://quickbooks.api.intuit.com/v2/company/{realmId}/purchase', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });
    
    return response.json();
  }
}
```

#### 2.3 Database Schema
```sql
CREATE TABLE quickbooks_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  qbo_realm_id TEXT NOT NULL,
  access_token TEXT NOT NULL (encrypted),
  refresh_token TEXT NOT NULL (encrypted),
  expires_at TIMESTAMP,
  connected_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE qbo_sync_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts_v2(id),
  qbo_transaction_id TEXT NOT NULL,
  sync_status TEXT DEFAULT 'synced', -- synced, failed, pending
  last_synced TIMESTAMP DEFAULT NOW(),
  error_message TEXT,
  UNIQUE(receipt_id)
);
```

---

## 3. Tax Optimization Engine 💡

### Features
- Identify tax-saving opportunities
- Suggest deduction strategies
- Track quarterly estimated taxes
- Generate tax planning reports

### Implementation

#### 3.1 Tax Optimization Service
```typescript
// services/taxOptimizationService.ts
export interface TaxOpportunity {
  title: string;
  description: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  action: string;
}

export class TaxOptimizationService {
  async analyzeTaxOpportunities(
    receipts: Receipt[],
    income: number,
    year: number
  ): Promise<TaxOpportunity[]> {
    const opportunities: TaxOpportunity[] = [];
    
    // 1. Check for missed deductions
    opportunities.push(...this.findMissedDeductions(receipts));
    
    // 2. Check for tax-loss harvesting
    opportunities.push(...this.findTaxLossHarvesting(receipts));
    
    // 3. Check for quarterly tax planning
    opportunities.push(...this.findQuarterlyTaxPlanning(income, year));
    
    // 4. Check for entity structure optimization
    opportunities.push(...this.findEntityOptimization(income));
    
    return opportunities;
  }
  
  private findMissedDeductions(receipts: Receipt[]): TaxOpportunity[] {
    // Analyze receipts for commonly missed deductions
    // e.g., home office, vehicle, meals, education
    return [];
  }
  
  private findTaxLossHarvesting(receipts: Receipt[]): TaxOpportunity[] {
    // Identify expenses that could offset income
    return [];
  }
  
  private findQuarterlyTaxPlanning(income: number, year: number): TaxOpportunity[] {
    // Calculate quarterly estimated tax payments
    return [];
  }
  
  private findEntityOptimization(income: number): TaxOpportunity[] {
    // Suggest S-Corp, LLC, etc. based on income
    return [];
  }
}
```

#### 3.2 Quarterly Tax Tracker
```typescript
// services/quarterlyTaxTracker.ts
export interface QuarterlyTaxEstimate {
  quarter: number;
  estimatedIncome: number;
  estimatedTax: number;
  dueDate: string;
  paid: boolean;
  amountPaid: number;
}

export function calculateQuarterlyEstimates(
  yearToDateIncome: number,
  taxRate: number
): QuarterlyTaxEstimate[] {
  // Calculate quarterly estimated tax payments
  // Return array of 4 quarters
}
```

---

## 4. UI Components 🎨

### 4.1 Schedule C Report Page
```
/dashboard/tax-reports/schedule-c
├── Year selector
├── Summary cards
│   ├── Gross Income
│   ├── Total Deductions
│   └── Net Profit
├── Expense breakdown table
├── Generate PDF button
└── Download history
```

### 4.2 QuickBooks Integration Page
```
/dashboard/integrations/quickbooks
├── Connection status
├── Connect button (if not connected)
├── Sync history
├── Last synced timestamp
├── Sync settings
└── Disconnect button
```

### 4.3 Tax Optimization Dashboard
```
/dashboard/tax-optimization
├── Tax opportunities list
├── Quarterly tax estimates
├── Tax planning recommendations
├── Estimated tax savings
└── Action items
```

---

## 5. Implementation Timeline

| Task | Hours | Priority |
|------|-------|----------|
| Tax category mapping | 2 | HIGH |
| Deduction calculator | 3 | HIGH |
| Schedule C PDF generation | 3 | HIGH |
| Database schema | 1 | HIGH |
| QuickBooks OAuth setup | 2 | MEDIUM |
| Receipt sync service | 4 | MEDIUM |
| Tax optimization engine | 3 | MEDIUM |
| UI components | 4 | MEDIUM |
| Testing & refinement | 3 | HIGH |
| **TOTAL** | **~25 hours** | |

---

## 6. Cost Considerations

| Service | Cost | Notes |
|---------|------|-------|
| QuickBooks API | Free | Included with QBO subscription |
| PDF generation | Free | Using pdfkit (open source) |
| IRS data | Free | Public domain |
| **Total** | **Free** | No additional costs |

---

## 7. Success Metrics

- ✅ Users can generate Schedule C in < 2 clicks
- ✅ 95% accuracy on tax categorization
- ✅ QuickBooks sync success rate > 99%
- ✅ Average tax savings identified: $500+
- ✅ User satisfaction: > 4.5/5 stars

---

## 8. Future Enhancements

- [ ] Multi-year tax planning
- [ ] State tax filing integration
- [ ] Accountant collaboration tools
- [ ] AI-powered tax strategy recommendations
- [ ] Real-time tax liability tracking
- [ ] Estimated quarterly payment reminders
- [ ] Tax document storage & organization
- [ ] Audit trail & compliance reporting

---

## 9. Dependencies

```json
{
  "pdfkit": "^0.13.0",
  "intuit-oauth": "^1.2.0",
  "date-fns": "^2.29.0",
  "decimal.js": "^10.4.0"
}
```

---

## 10. Getting Started

1. **Setup QuickBooks Developer Account**
   - Register at https://developer.intuit.com
   - Create app credentials
   - Set redirect URI

2. **Create Database Tables**
   - Run migrations for schedule_c_reports
   - Run migrations for quickbooks_integrations

3. **Implement Tax Category Mapping**
   - Map receipt categories to IRS codes
   - Create deduction rate rules

4. **Build Schedule C Generator**
   - Create PDF template
   - Implement calculation logic
   - Add download functionality

5. **Integrate QuickBooks**
   - Implement OAuth flow
   - Create sync service
   - Add UI for connection

6. **Deploy & Test**
   - Test with sample receipts
   - Verify PDF accuracy
   - Test QBO sync

---

## Notes

- This is a **premium feature** - consider charging for it
- Consult with tax professionals for accuracy
- Add disclaimers that this is not tax advice
- Keep up with IRS form changes annually
- Consider HIPAA/security for sensitive tax data

---

**Status**: Ready for implementation after Phase 3 ✅
**Target Launch**: Q3 2025
**Estimated Revenue Impact**: High (premium feature)
