import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { RECEIPT_CATEGORIES } from '../../../constants/categories';

export function ReceiptFilters() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm">
        <Calendar className="h-4 w-4 text-gray-500" />
        <select className="bg-transparent text-sm text-gray-600 focus:outline-none">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
          <option>Custom range</option>
        </select>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm">
        <Filter className="h-4 w-4 text-gray-500" />
        <select className="bg-transparent text-sm text-gray-600 focus:outline-none">
          <option>All Categories</option>
          {RECEIPT_CATEGORIES.map(category => (
            <option key={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}