import React from 'react';
import { useReceipts } from '../receipts/ReceiptContext';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { DashboardHeader } from '../DashboardHeader';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SpendingHabitsProps {
  onProfileClick: () => void;
}

function SpendingHabits({ onProfileClick }: SpendingHabitsProps) {
  const { receipts } = useReceipts();

  // Calculate top merchants and their total spending
  const merchantSpending = receipts.reduce((acc: { [key: string]: number }, receipt) => {
    const merchant = receipt.merchant || 'Unknown';
    acc[merchant] = (acc[merchant] || 0) + receipt.total;
    return acc;
  }, {});

  // Sort merchants by spending and get top 5
  const topMerchants = Object.entries(merchantSpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const chartData = {
    labels: topMerchants.map(([merchant]) => merchant),
    datasets: [
      {
        label: 'Spending by Merchant',
        data: topMerchants.map(([, amount]) => amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)', // Light text for dark background
        },
      },
      title: {
        display: true,
        text: 'Top 5 Merchants by Spending',
        color: 'rgba(255, 255, 255, 0.8)', // Light text for dark background
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `$${value.toFixed(2)}`,
          color: 'rgba(255, 255, 255, 0.8)', // Light text for dark background
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)', // Subtle grid lines
        },
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)', // Light text for dark background
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)', // Subtle grid lines
        },
      },
    },
  };

  // Calculate total spending
  const totalSpending = receipts.reduce((sum, receipt) => sum + receipt.total, 0);
  
  // Calculate average transaction amount
  const averageTransaction = totalSpending / (receipts.length || 1);

  return (
    <div className="space-y-6">
      <div className="mt-8">
        <DashboardHeader 
          title="Spending Habits"
          onProfileClick={onProfileClick}
        />
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/20 backdrop-blur-xl rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Top Merchants</h2>
            <div className="h-[300px] relative">
              <Bar data={chartData} options={options} />
            </div>
            <div className="mt-4 space-y-2">
              {topMerchants.map(([merchant, amount], index) => (
                <div key={merchant} className="flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                    <span>{index + 1}.</span>
                    <span>{merchant}</span>
                  </div>
                  <span className="font-semibold">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Spending Overview</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/80">Total Spending</p>
                <p className="text-2xl font-bold text-white">${totalSpending.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-white/80">Average Transaction</p>
                <p className="text-2xl font-bold text-white">${averageTransaction.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-white/80">Number of Transactions</p>
                <p className="text-2xl font-bold text-white">{receipts.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpendingHabits;
