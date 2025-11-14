/**
 * Rules-based receipt categorization engine
 * Fast baseline classification before ML/Claude
 */

export interface CategoryPrediction {
  category: string;
  confidence: number;
  reasoning: string;
}

// Vendor-to-category mappings
const VENDOR_RULES: Record<string, { category: string; confidence: number }> = {
  // Meals & Entertainment
  'mcdonalds': { category: 'Meals', confidence: 0.95 },
  'starbucks': { category: 'Meals', confidence: 0.95 },
  'chipotle': { category: 'Meals', confidence: 0.95 },
  'subway': { category: 'Meals', confidence: 0.95 },
  'pizza': { category: 'Meals', confidence: 0.90 },
  'restaurant': { category: 'Meals', confidence: 0.85 },
  'cafe': { category: 'Meals', confidence: 0.85 },
  'diner': { category: 'Meals', confidence: 0.85 },
  'bar': { category: 'Meals', confidence: 0.80 },

  // Office Expenses
  'staples': { category: 'Office Expenses', confidence: 0.95 },
  'office depot': { category: 'Office Expenses', confidence: 0.95 },
  'fedex': { category: 'Office Expenses', confidence: 0.85 },
  'ups': { category: 'Office Expenses', confidence: 0.85 },

  // Car & Truck
  'shell': { category: 'Car and Truck Expenses', confidence: 0.95 },
  'chevron': { category: 'Car and Truck Expenses', confidence: 0.95 },
  'exxon': { category: 'Car and Truck Expenses', confidence: 0.95 },
  'bp': { category: 'Car and Truck Expenses', confidence: 0.95 },
  'mobil': { category: 'Car and Truck Expenses', confidence: 0.95 },
  'texaco': { category: 'Car and Truck Expenses', confidence: 0.95 },
  'gas station': { category: 'Car and Truck Expenses', confidence: 0.90 },
  'auto': { category: 'Car and Truck Expenses', confidence: 0.80 },
  'mechanic': { category: 'Car and Truck Expenses', confidence: 0.85 },

  // Travel
  'hotel': { category: 'Travel', confidence: 0.95 },
  'marriott': { category: 'Travel', confidence: 0.95 },
  'hilton': { category: 'Travel', confidence: 0.95 },
  'airbnb': { category: 'Travel', confidence: 0.95 },
  'airline': { category: 'Travel', confidence: 0.95 },
  'united': { category: 'Travel', confidence: 0.90 },
  'delta': { category: 'Travel', confidence: 0.90 },
  'southwest': { category: 'Travel', confidence: 0.90 },

  // Supplies
  'amazon': { category: 'Supplies', confidence: 0.70 },
  'walmart': { category: 'Supplies', confidence: 0.65 },
  'target': { category: 'Supplies', confidence: 0.65 },
  'costco': { category: 'Supplies', confidence: 0.65 },
  'home depot': { category: 'Supplies', confidence: 0.75 },
  'lowes': { category: 'Supplies', confidence: 0.75 },

  // Utilities
  'electric': { category: 'Utilities', confidence: 0.95 },
  'water': { category: 'Utilities', confidence: 0.95 },
  'gas': { category: 'Utilities', confidence: 0.90 },
  'internet': { category: 'Utilities', confidence: 0.95 },
  'phone': { category: 'Utilities', confidence: 0.90 },

  // Advertising
  'facebook': { category: 'Advertising', confidence: 0.90 },
  'google': { category: 'Advertising', confidence: 0.80 },
  'instagram': { category: 'Advertising', confidence: 0.90 },
};

// Keyword patterns
const KEYWORD_RULES: Array<{
  pattern: RegExp;
  category: string;
  confidence: number;
}> = [
  { pattern: /fuel|gas|petrol|diesel/i, category: 'Car and Truck Expenses', confidence: 0.90 },
  { pattern: /hotel|motel|inn|lodge/i, category: 'Travel', confidence: 0.90 },
  { pattern: /flight|airline|airport/i, category: 'Travel', confidence: 0.95 },
  { pattern: /office|desk|chair|supplies/i, category: 'Office Expenses', confidence: 0.85 },
  { pattern: /food|restaurant|cafe|coffee|lunch|dinner/i, category: 'Meals', confidence: 0.85 },
  { pattern: /electricity|power|utility|water|sewer/i, category: 'Utilities', confidence: 0.90 },
  { pattern: /repair|maintenance|service|mechanic/i, category: 'Car and Truck Expenses', confidence: 0.80 },
];

/**
 * Categorize a receipt based on vendor and keywords
 */
export function categorizeReceipt(
  vendor: string,
  total?: number,
  items?: Array<{ description: string; price: number }>
): CategoryPrediction {
  let bestMatch: CategoryPrediction = {
    category: 'Supplies',
    confidence: 0.50,
    reasoning: 'Default category (low confidence)',
  };

  // 1. Check vendor rules (highest priority)
  const vendorLower = vendor.toLowerCase();
  for (const [vendorKey, rule] of Object.entries(VENDOR_RULES)) {
    if (vendorLower.includes(vendorKey)) {
      return {
        category: rule.category,
        confidence: rule.confidence,
        reasoning: `Matched vendor: ${vendor}`,
      };
    }
  }

  // 2. Check keyword patterns in vendor name
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(vendor)) {
      if (rule.confidence > bestMatch.confidence) {
        bestMatch = {
          category: rule.category,
          confidence: rule.confidence,
          reasoning: `Matched keyword in vendor name`,
        };
      }
    }
  }

  // 3. Check line items if available
  if (items && items.length > 0) {
    for (const item of items) {
      for (const rule of KEYWORD_RULES) {
        if (rule.pattern.test(item.description)) {
          if (rule.confidence > bestMatch.confidence) {
            bestMatch = {
              category: rule.category,
              confidence: Math.min(rule.confidence, 0.85), // Slightly lower for item-based matches
              reasoning: `Matched keyword in items: ${item.description}`,
            };
          }
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Get confidence badge color
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.85) return 'green';
  if (confidence >= 0.70) return 'yellow';
  return 'red';
}

/**
 * Get confidence label
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return 'High';
  if (confidence >= 0.70) return 'Medium';
  return 'Low';
}
