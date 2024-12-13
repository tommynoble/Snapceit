import React from 'react';
import { useReceipts } from '../receipts/ReceiptContext';

export function MonthlySpendingCard() {
  const { receipts } = useReceipts();

  // Calculate total spending for the current month
  const calculateMonthlySpending = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return receipts
      .filter(receipt => {
        const receiptDate = new Date(receipt.date);
        return (
          receiptDate.getMonth() === currentMonth &&
          receiptDate.getFullYear() === currentYear
        );
      })
      .reduce((total, receipt) => total + (receipt.total || 0), 0);
  };

  // Calculate spending by category for the current month
  const calculateCategorySpending = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const categoryTotals: { [key: string]: number } = {};

    receipts
      .filter(receipt => {
        const receiptDate = new Date(receipt.date);
        return (
          receiptDate.getMonth() === currentMonth &&
          receiptDate.getFullYear() === currentYear
        );
      })
      .forEach(receipt => {
        const category = receipt.category || 'Uncategorized';
        categoryTotals[category] = (categoryTotals[category] || 0) + (receipt.total || 0);
      });

    return categoryTotals;
  };

  const monthlyTotal = calculateMonthlySpending();
  const categorySpending = calculateCategorySpending();

  // Get current month name
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Monthly Spending</h2>
      
      <div className="mb-6">
        <div className="text-3xl font-bold text-purple-600">
          ${monthlyTotal.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500">
          Total spending for {currentMonthName}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Spending by Category</h3>
        
        {Object.entries(categorySpending)
          .sort(([, a], [, b]) => b - a) // Sort by amount in descending order
          .map(([category, amount]) => (
            <div key={category} className="flex justify-between items-center">
              <div className="text-gray-600">{category}</div>
              <div className="font-medium">${amount.toFixed(2)}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
