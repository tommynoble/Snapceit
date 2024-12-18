import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { OnboardingSlide } from './components/onboarding/OnboardingSlide';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { ReceiptProvider } from './components/dashboard/receipts/ReceiptContext';
import { AuthProvider, useAuth } from './firebase/AuthContext';
import { Onboarding } from './components/onboarding/OnboardingQuestionnaire';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/transitions/PageTransition';
import Home from './pages/Home';
import AuthLayout from './components/auth/AuthLayout';
import SpendingHabits from './components/dashboard/spending/SpendingHabits';
import Features from './components/Features';
import Features2 from './components/Features2';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

// Register Form Wrapper with Navigation
const RegisterFormWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <RegisterForm 
      onBack={() => navigate('/')}
      heading="Get started with Snapceit"
    />
  );
};

// Onboarding Wrapper with Navigation
const OnboardingWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Onboarding 
      onComplete={() => navigate('/register')}
      onBack={() => navigate('/')}
    />
  );
};

function AppContent() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PublicRoute>
            <PageTransition>
              <Home />
            </PageTransition>
          </PublicRoute>
        } />
        
        <Route path="/get-started" element={
          <PublicRoute>
            <PageTransition>
              <OnboardingSlide />
            </PageTransition>
          </PublicRoute>
        } />
        
        <Route path="/onboarding" element={
          <PublicRoute>
            <PageTransition>
              <OnboardingWrapper />
            </PageTransition>
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <PageTransition>
              <AuthLayout>
                <LoginForm />
              </AuthLayout>
            </PageTransition>
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <PageTransition>
              <AuthLayout>
                <RegisterFormWrapper />
              </AuthLayout>
            </PageTransition>
          </PublicRoute>
        } />
        
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <PageTransition>
              <ReceiptProvider>
                <DashboardLayout />
              </ReceiptProvider>
            </PageTransition>
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-fuchsia-500 via-purple-600 to-purple-800">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;