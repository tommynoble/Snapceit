import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { TotalReceiptsCard } from './stats/TotalReceiptsCard';
import { MonthlySpendingCard } from './stats/MonthlySpendingCard';
import { CategoriesCard } from './stats/CategoriesCard';
import { UploadReceiptCard } from './upload/UploadReceiptCard';
import { SpendingOverviewCard } from './spending/SpendingOverviewCard';
import { RecentReceiptsCard } from './receipts/RecentReceiptsCard';
import { ReminderCard } from './reminders/ReminderCard';
import { UserProfileModal } from './user/UserProfileModal';
import { TaxDetailsCard } from './tax/TaxDetailsCard';
import { PriceMatchModal } from './pricematch/PriceMatchModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { DashboardNavbar } from './DashboardNavbar';
import logo from '../../../images/logo.svg';
import { TaxCalculator } from './tax/TaxCalculator';
import { PriceMatchPage } from '../../pages/dashboard/PriceMatchPage';
import { TemplatePreview } from '../../pages/dashboard/TemplatePreview';
import { SettingsNew } from '../../pages/dashboard/SettingsNew';
import { Pricing } from '../../pages/dashboard/Pricing';
import { Expenses } from '../../pages/dashboard/Expenses';
import { Profile } from '../../pages/dashboard/Profile';
import { Receipts } from '../../pages/dashboard/Receipts';
import { Reports } from '../../pages/dashboard/Reports';

export function DashboardLayout() {
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      // Get the origin dynamically (works for localhost, snapceit.com, etc.)
      const origin = window.location.origin;
      window.location.href = origin;
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handlePriceMatchClick = () => navigate('/dashboard/price-match');
  const handleTaxPageClick = () => navigate('/dashboard/tax-calculator');

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    
    let timeGreeting = '';
    if (hour < 12) timeGreeting = '🌅 Good morning';
    else if (hour < 18) timeGreeting = '☀️ Good afternoon';
    else timeGreeting = '🌙 Good evening';
    
    return `${timeGreeting}, there!`;
  }, []);

  const subheading = useMemo(() => {
    const day = new Date().getDay();
    const hour = new Date().getHours();
    
    const subheadings = [
      'Track every receipt, master your spending',
      'Your financial dashboard awaits',
      'Smart expense tracking starts here',
      'Organize receipts, optimize finances',
      'See where your money goes',
      'Upload receipts, gain insights',
      'Your spending story in one place',
      'Take control of your finances today',
    ];
    
    return subheadings[Math.floor(Math.random() * subheadings.length)];
  }, []);

  const DashboardContent = () => (
    <>
      {/* Summary Cards */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <TaxDetailsCard />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <TotalReceiptsCard />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MonthlySpendingCard />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CategoriesCard />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <UploadReceiptCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <RecentReceiptsCard />
          </motion.div>
        </div>
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <SpendingOverviewCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <ReminderCard />
          </motion.div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D444EF]/5 via-[#AF3AEB]/5 to-purple-900/5">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          onPriceMatchClick={handlePriceMatchClick}
          onTaxPageClick={handleTaxPageClick}
          onSettingsClick={() => navigate('/dashboard/settings')}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50 mt-0.5">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-full p-3 text-white/80 hover:bg-white/10"
        >
          <Menu size={28} />
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
              onPriceMatchClick={() => {
                navigate('/dashboard/price-match');
                setIsMobileMenuOpen(false);
              }}
              onTaxPageClick={() => {
                navigate('/dashboard/tax-calculator');
                setIsMobileMenuOpen(false);
              }}
              onSettingsClick={() => {
                navigate('/dashboard/settings');
                setIsMobileMenuOpen(false);
              }}
              onLogout={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <div className="px-0 sm:px-0 md:px-0">
          <div className="max-w-full mx-0 px-0 sm:px-4 md:px-6">
            <div className="flex-1 overflow-auto">
              <div className="container mx-0 p-2 sm:px-4 md:px-6">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <>
                        <div className="mt-8">
                          <div className="pl-0.75 md:pl-0 mb-6 md:mt-12">
                            <motion.h2
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6 }}
                              className="text-xl sm:text-3xl font-extrabold text-white pb-2 border-b border-white/20"
                            >
                              {greeting}
                            </motion.h2>
                          </div>
                        </div>
                        <DashboardContent />
                      </>
                    }
                  />
                  <Route
                    path="template-preview"
                    element={
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.6 }}
                      >
                        <TemplatePreview />
                      </motion.div>
                    }
                  />
                  <Route
                    path="price-match"
                    element={
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.6 }}
                      >
                        <PriceMatchPage />
                      </motion.div>
                    }
                  />
                  <Route
                    path="tax-calculator"
                    element={
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.6 }}
                      >
                        <TaxCalculator />
                      </motion.div>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.6 }}
                      >
                        <SettingsNew />
                      </motion.div>
                    }
                  />
                  <Route
                    path="pricing"
                    element={
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Pricing />
                      </motion.div>
                    }
                  />
                  <Route
                    path="expenses"
                    element={
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Expenses />
                      </motion.div>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Profile />
                      </motion.div>
                    }
                  />
                  <Route
                    path="receipts"
                    element={
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Receipts />
                      </motion.div>
                    }
                  />
                  <Route
                    path="reports"
                    element={
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Reports />
                      </motion.div>
                    }
                  />
                  {/* Catch-all 404 route - redirect to homepage */}
                  <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                  />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <UserProfileModal 
        isOpen={isUserProfileOpen} 
        onClose={() => setIsUserProfileOpen(false)} 
        onLogout={handleLogout}
      />
      <PriceMatchModal isOpen={false} onClose={() => {}} />

      <footer className="lg:pl-64 mt-6 pb-4 text-center text-sm text-white/50">
        <p>You are using <a href="http://localhost:5184/" className="underline hover:text-white/80 transition-colors">Snapceit</a> v1.0</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Snapceit. All rights reserved.</p>
      </footer>
    </div>
  );
}