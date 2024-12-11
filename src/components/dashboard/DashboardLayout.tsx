import React, { useState } from 'react';
import { Settings, User, Menu, LineChart } from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { TotalReceiptsCard } from './stats/TotalReceiptsCard';
import { MonthlySpendingCard } from './stats/MonthlySpendingCard';
import { CategoriesCard } from './stats/CategoriesCard';
import { UploadReceiptCard } from './upload/UploadReceiptCard';
import { SpendingOverviewCard } from './spending/SpendingOverviewCard';
import { RecentReceiptsCard } from './receipts/RecentReceiptsCard';
import { ReminderCard } from './reminders/ReminderCard';
import { SettingsModal } from './settings/SettingsModal';
import { UserProfileModal } from './user/UserProfileModal';
import { SpendingHabitsPage } from './spending/SpendingHabitsPage';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function DashboardLayout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSpendingHabits, setShowSpendingHabits] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/');
  };

  if (showSpendingHabits) {
    return <SpendingHabitsPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D444EF]/5 via-[#AF3AEB]/5 to-purple-900/5">
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
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-full p-2 text-white/80 hover:bg-white/10 lg:hidden"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-y-0 right-0 w-64 bg-white/10 backdrop-blur-lg shadow-lg z-30 lg:hidden"
          >
            <div className="p-6 space-y-2">
              <button 
                onClick={() => {
                  setShowSpendingHabits(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg"
              >
                <LineChart size={20} />
                Spending Habits
              </button>
              <button 
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg"
              >
                <Settings size={20} />
                Settings
              </button>
              <button 
                onClick={() => {
                  setIsProfileOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg"
              >
                <User size={20} />
                Profile
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader userName="Thomas" />
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TotalReceiptsCard />
            <MonthlySpendingCard />
            <CategoriesCard />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <UploadReceiptCard />
              <RecentReceiptsCard />
            </div>

            <div className="space-y-6">
              <SpendingOverviewCard />
              <ReminderCard />
            </div>
          </div>
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}