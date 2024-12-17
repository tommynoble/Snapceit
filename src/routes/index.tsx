import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PageTransition } from '../components/transitions/PageTransition';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { TopNavbar } from '../components/dashboard/TopNavbar';
import { ReceiptProvider } from '../components/dashboard/receipts/ReceiptContext';
import Home from '../pages/Home';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing page with built-in auth */}
      <Route path="/" element={
        <PageTransition>
          <Home />
        </PageTransition>
      } />

      {/* Top Navigation */}
      <Route path="/nav" element={<TopNavbar onProfileClick={() => {}} />} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <PageTransition>
            <ReceiptProvider>
              <DashboardLayout />
            </ReceiptProvider>
          </PageTransition>
        </ProtectedRoute>
      } />
    </Routes>
  );
};
