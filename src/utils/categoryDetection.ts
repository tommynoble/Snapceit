interface CategoryKeywords {
  [key: string]: {
    keywords: string[];
    weight: number;
    contextRules?: {
      required?: string[];
      excluded?: string[];
    };
  };
}

const categoryKeywords: CategoryKeywords = {
  'Advertising': {
    weight: 1.2,
    keywords: [
      'advertising', 'marketing', 'promotion', 'ad spend', 'campaign', 'media buy',
      'social media', 'facebook ads', 'google ads', 'billboard', 'seo', 'ppc',
      'branding', 'agency', 'creative', 'design'
    ],
    contextRules: {
      required: ['ad', 'campaign', 'marketing'],
      excluded: ['food', 'restaurant']
    }
  },
  'Car and Truck Expenses': {
    weight: 1.1,
    keywords: [
      'fuel', 'gas', 'parking', 'toll', 'maintenance', 'repair', 'tire', 'oil change',
      'car wash', 'vehicle', 'auto parts', 'automotive', 'mechanic', 'smog',
      'transmission', 'brake', 'engine', 'shell', 'chevron', 'exxon', 'mobil',
      'valvoline', 'autozone', 'pep boys', 'jiffy lube'
    ],
    contextRules: {
      required: ['auto', 'car', 'vehicle', 'gas'],
      excluded: ['restaurant', 'food']
    }
  },
  'Office Expenses': {
    weight: 1.0,
    keywords: [
      'office', 'supplies', 'stationery', 'printer', 'ink', 'paper', 'desk',
      'staples', 'office depot', 'filing', 'storage', 'computer', 'software',
      'hardware', 'monitor', 'keyboard', 'mouse', 'office max', 'workspace',
      'ergonomic', 'chair', 'furniture'
    ]
  },
  'Travel': {
    weight: 1.2,
    keywords: [
      'hotel', 'flight', 'airline', 'airfare', 'lodging', 'taxi', 'uber',
      'lyft', 'rental car', 'train', 'transportation', 'booking.com', 'expedia',
      'airbnb', 'marriott', 'hilton', 'delta', 'united', 'american airlines',
      'southwest', 'enterprise', 'hertz', 'avis', 'travelocity'
    ],
    contextRules: {
      excluded: ['food delivery', 'restaurant']
    }
  },
  'Food & Dining': {
    weight: 1.0,
    keywords: [
      'restaurant', 'cafe', 'coffee', 'food', 'lunch', 'dinner', 'breakfast',
      'meal', 'dining', 'takeout', 'delivery', 'grocery', 'pizzeria', 'bistro',
      'bakery', 'deli', 'steakhouse', 'sushi', 'burger', 'sandwich', 'bar',
      'grill', 'kitchen', 'seafood', 'mcdonalds', 'wendys', 'subway', 'chipotle',
      'starbucks', 'dunkin', 'dominos', 'pizza hut'
    ],
    contextRules: {
      required: ['food', 'restaurant', 'cafe', 'bar', 'grill']
    }
  },
  'Utilities': {
    weight: 1.3,
    keywords: [
      'electricity', 'water', 'gas', 'internet', 'phone', 'utility',
      'power', 'energy', 'waste', 'sewage', 'telecom', 'cable', 'broadband',
      'verizon', 'at&t', 'comcast', 'spectrum', 'pg&e', 'water bill',
      'electric bill', 'utility bill'
    ],
    contextRules: {
      required: ['bill', 'utility', 'service'],
      excluded: ['restaurant', 'food']
    }
  },
  'Taxes and Licenses': {
    weight: 1.4,
    keywords: [
      'tax', 'license', 'permit', 'registration', 'certification', 'fee',
      'government', 'state', 'federal', 'municipal', 'dmv', 'treasury',
      'customs', 'duty', 'toll', 'levy', 'excise', 'filing fee'
    ],
    contextRules: {
      required: ['tax', 'license', 'permit', 'registration'],
      excluded: ['sales tax', 'food']
    }
  },
  'Supplies': {
    weight: 0.8,
    keywords: [
      'supplies', 'equipment', 'tools', 'hardware', 'materials', 'parts',
      'inventory', 'stock', 'wholesale', 'retail', 'consumables', 'goods',
      'merchandise', 'items', 'products', 'accessories'
    ]
  }
};

export function detectCategory(text: string, merchantName: string = '', items: Array<{ description: string }> = []): string {
  // Convert all text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  const lowerMerchant = merchantName.toLowerCase();
  const itemsText = items.map(item => item.description.toLowerCase()).join(' ');
  
  // Combine all text for context analysis
  const fullContext = `${lowerText} ${lowerMerchant} ${itemsText}`;

  // Calculate weighted scores for each category
  const scores = Object.entries(categoryKeywords).map(([category, config]) => {
    let score = 0;
    
    // Check keywords in merchant name (higher weight)
    config.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      if (lowerMerchant.includes(keywordLower)) {
        score += 2 * config.weight; // Double weight for merchant name matches
      }
    });

    // Check keywords in items (medium weight)
    config.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      if (itemsText.includes(keywordLower)) {
        score += 1.5 * config.weight;
      }
    });

    // Check keywords in full text (normal weight)
    config.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const matches = (fullContext.match(new RegExp(keywordLower, 'g')) || []).length;
      score += matches * config.weight;
    });

    // Apply context rules if they exist
    if (config.contextRules) {
      // Check required keywords
      if (config.contextRules.required) {
        const hasRequired = config.contextRules.required.some(req => 
          fullContext.includes(req.toLowerCase())
        );
        if (!hasRequired) {
          score *= 0.5; // Reduce score if required context is missing
        }
      }

      // Check excluded keywords
      if (config.contextRules.excluded) {
        const hasExcluded = config.contextRules.excluded.some(excl => 
          fullContext.includes(excl.toLowerCase())
        );
        if (hasExcluded) {
          score *= 0.3; // Significantly reduce score if excluded context is found
        }
      }
    }

    return { category, score };
  });

  // Sort by score and get the highest scoring category
  const sortedScores = scores.sort((a, b) => b.score - a.score);
  
  // Log scoring for debugging
  console.log('Category Scores:', sortedScores.map(s => `${s.category}: ${s.score}`));
  
  // Return the highest scoring category, or 'Supplies' as default if no significant matches
  return sortedScores[0].score > 0.5 ? sortedScores[0].category : 'Supplies';
}
