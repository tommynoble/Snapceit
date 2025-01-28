import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { OnboardingSlide } from './components/onboarding/OnboardingSlide';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { VerifyEmail } from './components/auth/VerifyEmail';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { ReceiptProvider } from './components/dashboard/receipts/ReceiptContext';
import { useAuth, AuthProvider } from './auth/CognitoAuthContext';
import { Onboarding } from './components/onboarding/OnboardingQuestionnaire';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/transitions/PageTransition';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import AuthLayout from './components/auth/AuthLayout';
import SpendingHabits from './components/dashboard/spending/SpendingHabits';
import Features from './components/Features';
import Features2 from './components/Features2';
import StyleGuide from './components/StyleGuide';
import { api } from './utils/api';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { CurrencyProvider } from './contexts/CurrencyContext';

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
      heading="Get started with Snapceit"
    />
  );
};

// Onboarding Wrapper with Navigation
const OnboardingWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Onboarding onComplete={() => navigate('/dashboard')} />
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#4A5568',
              color: '#fff',
            },
          }}
        />
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/features2" element={<Features2 />} />
          <Route path="/style-guide" element={<StyleGuide />} />
          
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
          <Route path="/verify-email" element={
            <PublicRoute>
              <AuthLayout>
                <VerifyEmail />
              </AuthLayout>
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <ReceiptProvider>
                <DashboardLayout />
              </ReceiptProvider>
            </ProtectedRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-500 via-purple-600 to-purple-800">
        <CurrencyProvider>
          <AppContent />
        </CurrencyProvider>
      </div>
    </Router>
  );
};

export default App;