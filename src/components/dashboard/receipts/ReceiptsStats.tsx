import React, { useMemo } from 'react';
import { TrendingUp, Receipt as ReceiptIcon, Tag } from 'lucide-react';
import { useCurrency } from '../../../hooks/useCurrency';
import { Receipt } from './ReceiptContext';

interface ReceiptsStatsProps {
    receipts: Receipt[];
}

export const ReceiptsStats: React.FC<ReceiptsStatsProps> = ({ receipts }) => {
    const { formatCurrency } = useCurrency();

    const stats = useMemo(() => {
        const totalSpend = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
        const count = receipts.length;

        // Calculate top category
        const categoryCounts: Record<string, number> = {};
        receipts.forEach(r => {
            const cat = r.category || 'Uncategorized';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        let topCategory = 'N/A';
        let maxCount = 0;

        Object.entries(categoryCounts).forEach(([cat, c]) => {
            if (c > maxCount) {
                maxCount = c;
                topCategory = cat;
            }
        });

        return { totalSpend, count, topCategory };
    }, [receipts]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Spend</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpend)}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <ReceiptIcon size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Receipts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                    <Tag size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Top Category</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.topCategory}</p>
                </div>
            </div>
        </div>
    );
};
