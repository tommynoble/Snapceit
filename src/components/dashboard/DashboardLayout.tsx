import React, { useState } from 'react';
import { Settings, User, Menu, Receipt, TrendingUp, PieChart, LineChart } from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { StatCard } from './stats/StatCard';
import { ReceiptsList } from './receipts/ReceiptsList';
import { ReminderCard } from './ReminderCard';
import { ReceiptUploader } from './receipts/ReceiptUploader';
import { ReceiptFilters } from './receipts/ReceiptFilters';
import { SettingsModal } from './settings/SettingsModal';
import { UserProfileModal } from './user/UserProfileModal';
import { useStats } from './stats/useStats';
import { SpendingPieChart } from './stats/SpendingPieChart';
import { SpendingHabitsPage } from './spending/SpendingHabitsPage';

export function DashboardLayout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSpendingHabits, setShowSpendingHabits] = useState(false);
  const stats = useStats();

  if (showSpendingHabits) {
    return <SpendingHabitsPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-500 via-purple-600 to-purple-800">
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold text-white">S</div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSpendingHabits(true)}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            title="Spending Habits"
          >
            <LineChart size={24} />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
          >
            <Settings size={24} />
          </button>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
          >
            <User size={24} />
          </button>
          <button className="rounded-full p-2 text-white/80 hover:bg-white/10 lg:hidden">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      <main className="px-6 py-8">
        <DashboardHeader userName="Thomas" />
        
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Receipts"
            value={stats.totalReceipts.value}
            icon={Receipt}
            trend={stats.totalReceipts.trend}
          />
          <StatCard
            title="Monthly Spending"
            value={new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(stats.monthlySpending.value)}
            icon={TrendingUp}
            trend={stats.monthlySpending.trend}
          />
          <StatCard
            title="Categories"
            value={stats.categories.total}
            icon={PieChart}
            details={stats.categories.breakdown.map(cat => ({
              label: cat.category,
              value: Math.round(cat.percentage)
            }))}
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload Receipt</h2>
              <ReceiptUploader />
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recent Receipts</h2>
                <ReceiptFilters />
              </div>
              <ReceiptsList />
            </div>
          </div>

          <div className="space-y-6">
            <ReminderCard dueDate="July 3 2024" />
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Spending Overview</h2>
              <SpendingPieChart />
            </div>
          </div>
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}