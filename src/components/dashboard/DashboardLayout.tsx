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
import { ReceiptChatCard } from './receipts/ReceiptChatCard';
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
import { TaxReports } from '../../pages/dashboard/TaxReports';
import { MobileBottomNav } from './MobileBottomNav';

// Internal component for hard redirect
const NotFoundRedirect = () => {
  useEffect(() => {
    window.location.href = '/';
  }, []);
  return null;
};

export function DashboardLayout() {
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      // Always redirect to landing page, even if logout API fails
      window.location.href = '/';
    }
  };

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <ReceiptChatCard />
          </motion.div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D444EF]/5 via-[#AF3AEB]/5 to-purple-900/5 pb-20 lg:pb-0">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          onSettingsClick={() => navigate('/dashboard/settings')}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Menu Button - Hidden when using bottom nav, or kept as secondary option? User asked for bottom nav to avoid clicking. 
          Let's keep it but maybe it's less needed. The bottom nav has a "Menu" item that triggers the full sidebar. 
      */}

      {/* Mobile Sidebar (Full Menu) */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="x"
              dragConstraints={{ left: 0 }}
              dragElastic={{ left: 0, right: 0.5 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.x > 50 || velocity.x > 500) {
                  setIsMobileMenuOpen(false);
                }
              }}
              className="lg:hidden fixed inset-y-0 right-0 w-64 bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-[#9d4edd] shadow-2xl z-50"
            >
              <Sidebar
                onSettingsClick={() => {
                  navigate('/dashboard/settings');
                  setIsMobileMenuOpen(false);
                }}
                onLogout={handleLogout}
                className="h-full w-full bg-transparent overflow-y-auto"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <div className="px-5 sm:px-0 md:px-0">
          <div className="max-w-full mx-0 px-0 sm:px-4 md:px-6">
            <div className="flex-1 overflow-auto">
              <div className="container mx-auto p-0 sm:px-4 md:px-6">
                <Routes>
                  {/* ... routes ... */}
                  <Route
                    path="/"
                    element={
                      <>
                        <div className="mt-8">
                          <div className="pl-0 md:pl-0 mb-6 md:mt-12">
                            <motion.h2
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6 }}
                              className="text-2xl sm:text-3xl font-extrabold text-white pb-2 border-b border-white/20"
                            >
                              {greeting}
                            </motion.h2>
                          </div>
                        </div>
                        <DashboardContent />
                      </>
                    }
                  />
                  {/* ... other routes ... */}
                  <Route path="template-preview" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><TemplatePreview /></motion.div>} />
                  <Route path="price-match" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><PriceMatchPage /></motion.div>} />
                  <Route path="tax-calculator" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><TaxCalculator /></motion.div>} />
                  <Route path="settings" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><SettingsNew /></motion.div>} />
                  <Route path="pricing" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Pricing /></motion.div>} />
                  <Route path="expenses" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Expenses /></motion.div>} />
                  <Route path="profile" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Profile /></motion.div>} />
                  <Route path="receipts" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Receipts /></motion.div>} />
                  <Route path="reports" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Reports /></motion.div>} />
                  <Route path="tax-reports" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><TaxReports /></motion.div>} />

                  {/* Catch-all 404 route - force reload to clear state */}
                  <Route
                    path="*"
                    element={<NotFoundRedirect />}
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
      <PriceMatchModal isOpen={false} onClose={() => { }} />

      <footer className="lg:pl-64 mt-6 pb-4 text-center text-sm text-white/50">
        <p>You are using <a href="http://localhost:5184/" className="underline hover:text-white/80 transition-colors">Snapceit</a> v1.0</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Snapceit. All rights reserved.</p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isOpen={isMobileMenuOpen}
      />
    </div>
  );
}