// Tax Categories with their display names and IDs
export const TAX_CATEGORIES = [
  { id: 'advertising', name: 'Advertising' },
  { id: 'car_and_truck', name: 'Car and Truck Expenses' },
  { id: 'office', name: 'Office Expenses' },
  { id: 'taxes_and_licenses', name: 'Taxes and Licenses' },
  { id: 'supplies', name: 'Supplies' },
  { id: 'travel_and_meals', name: 'Travel and Meals' }
] as const;

// Tax Types with their display names and IDs
export const TAX_TYPES = [
  { id: 'sales', name: 'Sales Tax' },
  { id: 'vat', name: 'VAT' },
  { id: 'gst', name: 'GST' },
  { id: 'other', name: 'Other' }
] as const;

// Standard tax rates by region/type (example rates)
export const TAX_RATES = {
  standard: 0.25, // 25% standard rate
  // Add more rates as needed, e.g.:
  // reduced: 0.15,
  // zero: 0
} as const;

// Types for TypeScript
export type TaxCategoryId = typeof TAX_CATEGORIES[number]['id'];
export type TaxTypeId = typeof TAX_TYPES[number]['id'];

// Interfaces
export interface TaxCategory {
  id: TaxCategoryId;
  name: string;
}

export interface TaxType {
  id: TaxTypeId;
  name: string;
}

export interface TaxDetails {
  businessPurpose?: string;
  deductiblePercentage?: number;
  notes?: string;
  category?: TaxCategoryId;
  type?: TaxTypeId;
  rate?: number;
}
