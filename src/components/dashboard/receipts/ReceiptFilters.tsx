import React from 'react';
import { Calendar, Filter, Search } from 'lucide-react';

interface ReceiptFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
}

export function ReceiptFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  dateRange,
  onDateRangeChange
}: ReceiptFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative w-full sm:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search merchant..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
        />
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 border border-gray-300 shadow-sm w-full sm:w-auto">
        <Calendar className="h-4 w-4 text-gray-500" />
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="bg-transparent text-sm text-gray-700 focus:outline-none w-full sm:w-auto"
        >
          <option value="all">All Time</option>
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="3months">Last 3 months</option>
          <option value="thisYear">This Year</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 border border-gray-300 shadow-sm w-full sm:w-auto">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-transparent text-sm text-gray-700 focus:outline-none w-full sm:w-auto"
        >
          <option value="all">All Categories</option>
          <option value="Advertising">Advertising</option>
          <option value="Car and Truck Expenses">Car and Truck Expenses</option>
          <option value="Meals">Meals</option>
          <option value="Office Expenses">Office Expenses</option>
          <option value="Supplies">Supplies</option>
          <option value="Taxes and Licenses">Taxes and Licenses</option>
          <option value="Travel">Travel</option>
          <option value="Utilities">Utilities</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
}