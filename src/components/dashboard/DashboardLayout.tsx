import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
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
import { TaxDetailsCard } from './tax/TaxDetailsCard';
import { PriceMatchModal } from './pricematch/PriceMatchModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../firebase/AuthContext';
import { Sidebar } from './Sidebar';
import logo from '../../../images/logo.svg';
import { DashboardHome } from '../../pages/dashboard/DashboardHome';
import { SpendingHabits } from '../../pages/dashboard/SpendingHabits';
import { PriceMatch } from '../../pages/dashboard/PriceMatch';
import { TaxCalculator } from '../../pages/dashboard/TaxCalculator';

export function DashboardLayout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSpendingHabits, setShowSpendingHabits] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTaxPage, setShowTaxPage] = useState(false);
  const [showPriceMatch, setShowPriceMatch] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = 'http://localhost:5184/';  // Redirect to main site
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSpendingHabitsClick = () => navigate('/dashboard/spending-habits');
  const handlePriceMatchClick = () => navigate('/dashboard/price-match');
  const handleTaxPageClick = () => navigate('/dashboard/tax-calculator');
  const handleSettingsClick = () => setIsSettingsOpen(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D444EF]/5 via-[#AF3AEB]/5 to-purple-900/5">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          onSpendingHabitsClick={handleSpendingHabitsClick}
          onPriceMatchClick={handlePriceMatchClick}
          onTaxPageClick={handleTaxPageClick}
          onSettingsClick={handleSettingsClick}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-full p-2 text-white/80 hover:bg-white/10"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden fixed inset-y-0 right-0 w-64 bg-black/40 backdrop-blur-xl shadow-lg z-40"
          >
            <Sidebar
              onSpendingHabitsClick={() => {
                navigate('/dashboard/spending-habits');
                setIsMobileMenuOpen(false);
              }}
              onPriceMatchClick={() => {
                navigate('/dashboard/price-match');
                setIsMobileMenuOpen(false);
              }}
              onTaxPageClick={() => {
                navigate('/dashboard/tax-calculator');
                setIsMobileMenuOpen(false);
              }}
              onSettingsClick={() => setIsSettingsOpen(true)}
              onLogout={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="lg:pl-64">
        <nav className="flex items-center justify-between px-4 py-3 lg:hidden">
          <img src={logo} alt="Snapceit" className="h-14 md:h-14 h-10 w-auto" />
        </nav>
        <div className="px-4 py-2 sm:py-6">
          <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6">
            <div className="flex-1 overflow-auto">
              <div className="container mx-auto p-2 sm:p-6">
                <Routes>
                  <Route index element={
                    <>
                      <div className="mt-8">
                        <DashboardHeader 
                          userName="Thomas"
                          onProfileClick={() => setIsProfileOpen(true)}
                        />
                      </div>
                      
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
                    </>
                  } />
                  <Route path="spending-habits" element={<SpendingHabits />} />
                  <Route path="price-match" element={<PriceMatch />} />
                  <Route path="tax-calculator" element={<TaxCalculator />} />
                </Routes>
              </div>
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
      <PriceMatchModal isOpen={showPriceMatch} onClose={() => setShowPriceMatch(false)} />

      <footer className="lg:pl-64 mt-6 pb-4 text-center text-sm text-white/50">
        <p>You are using <a href="http://localhost:5184/" className="underline hover:text-white/80 transition-colors">Snapceit</a> v1.0</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Snapceit. All rights reserved.</p>
      </footer>
    </div>
  );
}