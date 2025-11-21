import { useState, useMemo } from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { 
  FunnelIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useReceipts } from '../../components/dashboard/receipts/ReceiptContext';

export function Expenses() {
  const { receipts } = useReceipts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year', 'all'

  // Filter receipts by date range
  const filteredReceipts = useMemo(() => {
    if (!receipts) return [];
    
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    return receipts.filter(r => {
      if (!r.created_at) return false;
      const receiptDate = new Date(r.created_at);
      return receiptDate >= startDate && receiptDate <= now;
    }).filter(r => !selectedCategory || r.category_id === selectedCategory);
  }, [receipts, dateRange, selectedCategory]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredReceipts.reduce((sum, r) => sum + (r.total || 0), 0);
    const average = filteredReceipts.length > 0 ? total / filteredReceipts.length : 0;
    const highest = Math.max(...filteredReceipts.map(r => r.total || 0), 0);

    return { total, average, highest, count: filteredReceipts.length };
  }, [filteredReceipts]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: { [key: string]: number } = {};
    filteredReceipts.forEach(r => {
      const cat = r.category_id || 'Uncategorized';
      breakdown[cat] = (breakdown[cat] || 0) + (r.total || 0);
    });
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  }, [filteredReceipts]);

  // Top merchants
  const topMerchants = useMemo(() => {
    const merchants: { [key: string]: number } = {};
    filteredReceipts.forEach(r => {
      const merchant = r.merchant || 'Unknown';
      merchants[merchant] = (merchants[merchant] || 0) + (r.total || 0);
    });
    return Object.entries(merchants)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredReceipts]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Expenses"
        description="Track and analyze your spending"
        addDesktopTopPadding={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Total Spending Card */}
        <div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Total Spending</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-white/60 mb-2">Total Amount</p>
                <p className="text-4xl font-bold text-green-400">${stats.total.toFixed(2)}</p>
                <p className="text-xs text-white/60 mt-2">{stats.count} transactions</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/60 mb-1">Average</p>
                  <p className="text-lg font-semibold text-white">${stats.average.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/60 mb-1">Highest</p>
                  <p className="text-lg font-semibold text-white">${stats.highest.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="mt-6 md:mt-0">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FunnelIcon className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Filters</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {Array.from(new Set(receipts?.map(r => r.category_id) || [])).map(cat => (
                    <option key={cat} value={cat || ''}>
                      {cat || 'Uncategorized'}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setDateRange('month');
                  setSelectedCategory(null);
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-white/20"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">By Category</h2>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {categoryBreakdown.length > 0 ? (
                categoryBreakdown.map(([category, amount]) => {
                  const percentage = (amount / stats.total) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-white/80">{category || 'Uncategorized'}</p>
                        <p className="text-sm font-semibold text-white">${amount.toFixed(2)}</p>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-white/60 text-sm">No expenses in this period</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Merchants */}
        <div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-orange-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Top Merchants</h2>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {topMerchants.length > 0 ? (
                topMerchants.map(([merchant, amount], idx) => (
                  <div key={merchant} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-xs font-semibold text-white">
                        {idx + 1}
                      </div>
                      <p className="text-white/80 text-sm">{merchant}</p>
                    </div>
                    <p className="font-semibold text-white">${amount.toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p className="text-white/60 text-sm">No expenses in this period</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-indigo-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Recent Expenses</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredReceipts.length > 0 ? (
                  filteredReceipts
                    .sort((a, b) => {
                      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                      return dateB - dateA;
                    })
                    .slice(0, 10)
                    .map(receipt => (
                      <div key={receipt.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                        <div className="flex-1">
                          <p className="text-white font-medium">{receipt.merchant || 'Unknown'}</p>
                          <p className="text-xs text-white/60">
                            {receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : 'N/A'} • {receipt.category_id || 'Uncategorized'}
                          </p>
                        </div>
                        <p className="text-white font-semibold">${receipt.total?.toFixed(2) || '0.00'}</p>
                      </div>
                    ))
                ) : (
                  <p className="text-white/60 text-sm text-center py-8">No expenses in this period</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
