import { useState } from 'react';
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
import { UserProfileModal } from './user/UserProfileModal';
import { TaxDetailsCard } from './tax/TaxDetailsCard';
import { PriceMatchModal } from './pricematch/PriceMatchModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { Sidebar } from './Sidebar';
import { DashboardNavbar } from './DashboardNavbar';
import logo from '/logo.svg';
import { TaxCalculator } from './tax/TaxCalculator';
import { PriceMatchPage } from '../../pages/dashboard/PriceMatchPage';
import { TemplatePreview } from '../../pages/dashboard/TemplatePreview';
import { SettingsPage } from '../../pages/dashboard/SettingsPage';
import { Profile } from '../../pages/dashboard/Profile';

export function DashboardLayout() {
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handlePriceMatchClick = () => navigate('/dashboard/price-match');
  const handleTaxPageClick = () => navigate('/dashboard/tax-calculator');

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
  };

  const DashboardContent = () => (
    <>
      <div className="mt-8">
        <DashboardHeader 
          userName="Thomas"
          onProfileClick={handleProfileClick}
          onSettingsClick={() => navigate('/dashboard/settings')}
          onLogout={handleLogout}
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
        {/* Top navigation */}
        <div className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-6">
            <div className="flex items-center justify-between py-3">
              <div className="lg:hidden -ml-2">
                <img src={logo} alt="Logo" className="h-16 w-auto" />
              </div>
              <DashboardNavbar 
                onProfileClick={handleProfileClick}
                onSettingsClick={() => navigate('/dashboard/settings')}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-6">
            <div className="flex-1 overflow-auto">
              <div className="container mx-auto p-2 sm:px-6">
                <Routes>
                  <Route
                    path="/"
                    element={<DashboardContent />}
                  />
                  <Route
                    path="template-preview"
                    element={<TemplatePreview />}
                  />
                  <Route
                    path="price-match"
                    element={<PriceMatchPage />}
                  />
                  <Route path="tax-calculator" element={<TaxCalculator />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="profile" element={<Profile />} />
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