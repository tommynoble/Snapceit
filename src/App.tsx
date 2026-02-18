import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { VerifyEmail } from './components/auth/VerifyEmail';
import { EmailConfirmed } from './pages/EmailConfirmed';
import OnboardingPage from './pages/Onboarding';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { ReceiptProvider } from './components/dashboard/receipts/ReceiptContext';
import { useAuth, AuthProvider } from './auth/SupabaseAuthContext';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Landing } from './pages/Landing';
import AuthLayout from './components/auth/AuthLayout';
import Features from './components/Features';
import Features2 from './components/Features2';
import StyleGuide from './components/StyleGuide';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ResetPassword } from './pages/ResetPassword';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ScrollToTop } from './components/common/ScrollToTop';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Pricing } from './pages/Pricing';
import { StripeProvider } from './providers/StripeProvider';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Only redirect if we're not coming from a loading state
  if (currentUser && !location.state?.loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Register Form Wrapper with Navigation
const RegisterFormWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <RegisterForm
      onBack={() => navigate('/login')}
      heading="Complete your registration"
    />
  );
};

// Onboarding Page Wrapper with Navigation
const OnboardingPageWrapper: React.FC = () => {
  return (
    <OnboardingPage />
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#4A5568',
            color: '#fff',
          },
        }}
      />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/features2" element={<Features2 />} />
          <Route path="/style-guide" element={<StyleGuide />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Auth Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <AuthLayout>
                <LoginForm />
              </AuthLayout>
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <AuthLayout>
                <RegisterFormWrapper />
              </AuthLayout>
            </PublicRoute>
          } />
          <Route path="/onboarding" element={
            <PublicRoute>
              <OnboardingPageWrapper />
            </PublicRoute>
          } />
          <Route path="/verify-email" element={
            <PublicRoute>
              <AuthLayout>
                <VerifyEmail />
              </AuthLayout>
            </PublicRoute>
          } />
          <Route path="/email-confirmed" element={<EmailConfirmed />} />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <AuthLayout>
                <ForgotPassword />
              </AuthLayout>
            </PublicRoute>
          } />
          <Route path="/reset-password" element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <ReceiptProvider>
                <DashboardLayout />
              </ReceiptProvider>
            </ProtectedRoute>
          } />

          {/* Fallback route - force reload to clear any 404 state */}
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

// Component to handle 404s with a hard redirect
const NotFoundRedirect: React.FC = () => {
  React.useEffect(() => {
    window.location.href = '/';
  }, []);
  return null;
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-fuchsia-500 via-purple-600 to-purple-800">
            <CurrencyProvider>
              <StripeProvider>
                <ScrollToTop />
                <AppContent />
              </StripeProvider>
            </CurrencyProvider>
          </div>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;
