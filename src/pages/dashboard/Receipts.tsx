import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useReceipts } from '../../components/dashboard/receipts/ReceiptContext';
import { ReceiptsList } from '../../components/dashboard/receipts/ReceiptsList';
import { ReceiptFilters } from '../../components/dashboard/receipts/ReceiptFilters';
import { ReceiptsStats } from '../../components/dashboard/receipts/ReceiptsStats';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';

export function Receipts() {
  const { receipts, loading } = useReceipts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      // Search Filter
      const merchant = (receipt.merchant || '').toLowerCase();
      const matchesSearch = merchant.includes(searchQuery.toLowerCase());

      // Category Filter
      const matchesCategory = selectedCategory === 'all' || receipt.category === selectedCategory;

      // Date Range Filter
      let matchesDate = true;
      if (dateRange !== 'all') {
        // Use 'date' or 'created_at' as per Receipt interface
        const dateStr = receipt.date || receipt.created_at || new Date().toISOString();
        const receiptDate = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - receiptDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateRange === '7days') matchesDate = diffDays <= 7;
        else if (dateRange === '30days') matchesDate = diffDays <= 30;
        else if (dateRange === '3months') matchesDate = diffDays <= 90;
        else if (dateRange === 'thisYear') matchesDate = receiptDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [receipts, searchQuery, selectedCategory, dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <DashboardHeader
        title="Receipts"
        description="Manage and view all your uploaded receipts"
        addDesktopTopPadding={true}
      />

      <ReceiptsStats receipts={filteredReceipts} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[60vh]">
        <ReceiptFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <ReceiptsList receipts={filteredReceipts} />
      </div>
    </motion.div>
  );
}
