export interface Category {
  id: string;
  name: string;
  color: string;
}

export const RECEIPT_CATEGORIES: Category[] = [
  { id: 'advertising', name: 'Advertising', color: 'text-blue-500' },
  { id: 'car_and_truck', name: 'Car and Truck Expenses', color: 'text-red-500' },
  { id: 'office', name: 'Office Expenses', color: 'text-gray-500' },
  { id: 'travel', name: 'Travel', color: 'text-cyan-500' },
  { id: 'meals', name: 'Meals', color: 'text-orange-500' },
  { id: 'utilities', name: 'Utilities', color: 'text-amber-500' },
  { id: 'taxes', name: 'Taxes and Licenses', color: 'text-purple-500' },
  { id: 'supplies', name: 'Supplies', color: 'text-zinc-500' },
  { id: 'other', name: 'Other', color: 'text-gray-400' }
];
