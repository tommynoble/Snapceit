# 🚀 Phase 2 - Week 2 Implementation Checklist

## Goal
Add UI for confidence scoring and wire categorization to upload flow.

**Deliverable:** Users see predictions with confidence, can correct them

---

## ✅ Step 1: Add Confidence Pill to Receipt Cards (2 hours)

### 1.1 Update `RecentReceiptsCard.tsx`

Add confidence pill component that shows:
- **Green pill** (>0.75): High confidence ✅
- **Yellow pill** (0.65-0.75): Medium confidence ⚠️
- **Red pill** (<0.65): Low confidence ❌

```typescript
// Add this helper function
const getConfidenceBadge = (confidence?: number) => {
  if (!confidence) return null;
  
  let bgColor = 'bg-red-100';
  let textColor = 'text-red-800';
  let label = 'Low';
  
  if (confidence >= 0.75) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    label = 'High';
  } else if (confidence >= 0.65) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    label = 'Medium';
  }
  
  return (
    <span className={`inline-flex items-center rounded-full ${bgColor} px-2 py-1 text-xs font-medium ${textColor}`}>
      {label} ({(confidence * 100).toFixed(0)}%)
    </span>
  );
};
```

### 1.2 Display Confidence in Receipt Card

Update the receipt card rendering to show:
```typescript
<div className="flex items-center gap-2">
  <span className="text-sm font-medium text-gray-900">
    {receipt.category || 'Uncategorized'}
  </span>
  {getConfidenceBadge(receipt.category_confidence)}
</div>
```

### 1.3 Show "Review" Chip for Low Confidence

```typescript
{receipt.category_confidence && receipt.category_confidence < 0.75 && (
  <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
    ⚠️ Review
  </span>
)}
```

**Files to update:**
- `src/components/dashboard/receipts/RecentReceiptsCard.tsx`

---

## ✅ Step 2: Wire Categorization to Upload Flow (2 hours)

### 2.1 Update `ReceiptContext.tsx`

Add function to call categorization Edge Function:

```typescript
async function categorizeReceipt(receipt_id: string) {
  try {
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/categorize`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ receipt_id }),
      }
    );
    
    if (!response.ok) throw new Error('Categorization failed');
    
    const result = await response.json();
    console.log('Categorization result:', result);
    
    // Update receipt with category
    if (result.ok) {
      await updateReceipt(receipt_id, {
        category_id: result.category_id,
        category_confidence: result.confidence,
        status: 'categorized'
      });
    }
  } catch (error) {
    console.error('Error categorizing receipt:', error);
  }
}
```

### 2.2 Call Categorization After Upload

In `ReceiptUploader.tsx`, after receipt is uploaded:

```typescript
// After receipt is saved to database
await categorizeReceipt(receipt.id);
```

**Files to update:**
- `src/components/dashboard/receipts/ReceiptContext.tsx` (add categorizeReceipt function)
- `src/components/dashboard/receipts/ReceiptUploader.tsx` (call categorizeReceipt after upload)

---

## ✅ Step 3: Create Corrections Endpoint (2 hours)

### 3.1 Add Correction Function to `ReceiptContext.tsx`

```typescript
async function correctReceipt(receipt_id: string, category_id: number, reason?: string) {
  try {
    if (!currentUser?.id) throw new Error('No user ID');
    
    // Store correction in corrections table
    const { error } = await supabase
      .from('corrections')
      .insert({
        user_id: currentUser.id,
        subject_type: 'receipt',
        subject_id: receipt_id,
        category_id,
        reason: reason || 'User correction',
      });
    
    if (error) throw error;
    
    // Update receipt with corrected category
    await updateReceipt(receipt_id, {
      category_id,
      category_confidence: 1.0, // User correction = high confidence
    });
    
    console.log('Receipt corrected successfully');
    return true;
  } catch (error) {
    console.error('Error correcting receipt:', error);
    throw error;
  }
}
```

### 3.2 Add Correction UI to `EditReceiptModal.tsx`

Add category selector with correction flow:

```typescript
const handleCategoryChange = async (newCategoryId: number) => {
  try {
    await correctReceipt(receipt.id, newCategoryId, 'User override');
    setFormData({ ...formData, category_id: newCategoryId });
    showToast('Receipt corrected successfully', 'success');
  } catch (error) {
    showToast('Failed to correct receipt', 'error');
  }
};
```

**Files to update:**
- `src/components/dashboard/receipts/ReceiptContext.tsx` (add correctReceipt function)
- `src/components/dashboard/receipts/EditReceiptModal.tsx` (add category selector)

---

## ✅ Step 4: Add Toast Notifications (1 hour)

### 4.1 Create Toast Component

```typescript
// src/components/ui/Toast.tsx
export const showToast = (message: string, type: 'success' | 'error' | 'info') => {
  // Use your preferred toast library (react-hot-toast, sonner, etc.)
  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  } else {
    toast.info(message);
  }
};
```

### 4.2 Use in Components

```typescript
// After categorization
showToast('Receipt categorized successfully', 'success');

// After correction
showToast('Receipt corrected', 'success');

// On error
showToast('Failed to categorize receipt', 'error');
```

**Files to create:**
- `src/components/ui/Toast.tsx`

**Files to update:**
- `src/components/dashboard/receipts/ReceiptContext.tsx` (add toast calls)
- `src/components/dashboard/receipts/ReceiptUploader.tsx` (add toast calls)

---

## 📋 Verification Checklist

- [ ] Confidence pill shows on receipt cards
- [ ] Color-coding works (green/yellow/red)
- [ ] "Review" chip shows for low confidence (<0.75)
- [ ] Categorization called after upload
- [ ] Receipt status changes to "categorized"
- [ ] Category and confidence saved to database
- [ ] User can correct category
- [ ] Correction stored in corrections table
- [ ] Toast notifications show on success/error
- [ ] Predictions table has entries for each receipt

---

## 🧪 Testing Steps

### Test 1: Upload Receipt
1. Upload a receipt (e.g., Tesco receipt)
2. Wait for Textract to extract text
3. Edge Function should categorize it
4. Confidence pill should appear (green if >0.75)
5. Status should change to "categorized"

### Test 2: Low Confidence
1. Upload receipt with ambiguous text
2. If confidence <0.75, "Review" chip appears
3. Click to edit
4. Select correct category
5. Correction stored in corrections table

### Test 3: Verify Database
```sql
-- Check predictions table
SELECT * FROM predictions WHERE subject_type = 'receipt' ORDER BY created_at DESC LIMIT 5;

-- Check corrections table
SELECT * FROM corrections WHERE user_id = 'your-user-id' ORDER BY created_at DESC;

-- Check receipts table
SELECT id, category_id, category_confidence, status FROM receipts ORDER BY created_at DESC LIMIT 5;
```

---

## 🎯 Success Criteria

- ✅ Users see confidence scores on receipts
- ✅ Categorization happens automatically after upload
- ✅ Users can correct predictions
- ✅ Corrections feed into predictions table
- ✅ Toast notifications confirm actions
- ✅ All data persists in database

---

## ⏱️ Time Estimate

- Confidence pill: 2 hours
- Wire to upload: 2 hours
- Corrections endpoint: 2 hours
- Toast notifications: 1 hour
- **Total: ~7 hours**

---

## 📚 Files to Create/Update

**Create:**
- `src/components/ui/Toast.tsx`

**Update:**
- `src/components/dashboard/receipts/RecentReceiptsCard.tsx`
- `src/components/dashboard/receipts/ReceiptContext.tsx`
- `src/components/dashboard/receipts/ReceiptUploader.tsx`
- `src/components/dashboard/receipts/EditReceiptModal.tsx`

---

**Ready to start Week 2? 🚀**
