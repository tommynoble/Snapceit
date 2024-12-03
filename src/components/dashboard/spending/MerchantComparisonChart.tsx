import React from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useReceipts } from '../receipts/ReceiptContext';

export function MerchantComparisonChart() {
  const { receipts } = useReceipts();

  // Process data for the chart
  const merchantData = receipts.reduce((acc, receipt) => {
    if (!acc[receipt.merchant]) {
      acc[receipt.merchant] = 0;
    }
    acc[receipt.merchant] += receipt.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(merchantData)
    .map(([merchant, amount]) => ({
      merchant,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="merchant" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Spent']}
          />
          <Bar 
            dataKey="amount" 
            fill="#8B5CF6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}