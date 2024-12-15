import { useState } from 'react';
import { Settings, User, Menu, LineChart, Calculator, CircleDollarSign, LogOut } from 'lucide-react';
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
import { TaxDetailsCard } from './tax/TaxDetailsCard';
import { TaxPage } from './tax/TaxPage';
import { PriceMatchModal } from './pricematch/PriceMatchModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../firebase/AuthContext';
import logo from '../../../images/logo.svg';

export function DashboardLayout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSpendingHabits, setShowSpendingHabits] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTaxPage, setShowTaxPage] = useState(false);
  const [showPriceMatch, setShowPriceMatch] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = 'http://localhost:5184/';  // Redirect to main site
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (showSpendingHabits) {
    return <SpendingHabitsPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D444EF]/5 via-[#AF3AEB]/5 to-purple-900/5">
      <nav className="flex items-center justify-between px-4 py-3">
        <img src={logo} alt="Snapceit" className="h-14 md:h-14 h-10 w-auto" />
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSpendingHabits(true)}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            title="Spending Habits"
          >
            <LineChart size={24} />
          </button>
          <button 
            onClick={() => setShowPriceMatch(true)}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            title="Price Match"
          >
            <CircleDollarSign size={24} />
          </button>
          <button 
            onClick={() => setShowTaxPage(true)}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            title="Tax Calculator"
          >
            <Calculator size={24} />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            title="Settings"
          >
            <Settings size={24} />
          </button>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            title="Profile"
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
                  setShowPriceMatch(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg"
              >
                <CircleDollarSign size={20} />
                Price Match
              </button>
              <button 
                onClick={() => {
                  setShowTaxPage(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg"
              >
                <Calculator size={20} />
                Tax Page
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
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg text-red-400"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="px-4 py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <DashboardHeader userName="Thomas" />
          
          {/* Summary Cards */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <TaxDetailsCard />
            <TotalReceiptsCard />
            <MonthlySpendingCard />
            <CategoriesCard />
          </div>

          {/* Main Content */}
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              <UploadReceiptCard />
              <RecentReceiptsCard />
            </div>
            <div className="space-y-3">
              <SpendingOverviewCard />
              <ReminderCard />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onLogout={handleLogout}
      />
      <TaxPage isOpen={showTaxPage} onClose={() => setShowTaxPage(false)} />
      <PriceMatchModal isOpen={showPriceMatch} onClose={() => setShowPriceMatch(false)} />

      <footer className="mt-6 pb-4 text-center text-sm text-white/50">
        <p>You are using <a href="http://localhost:5184/" className="underline hover:text-white/80 transition-colors">Snapceit</a> v1.0</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Snapceit. All rights reserved.</p>
      </footer>
    </div>
  );
}