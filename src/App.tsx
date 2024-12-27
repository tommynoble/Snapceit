import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { OnboardingSlide } from './components/onboarding/OnboardingSlide';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { VerifyEmail } from './components/auth/VerifyEmail';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { ReceiptProvider } from './components/dashboard/receipts/ReceiptContext';
import { AuthProvider, useAuth } from './auth/CognitoAuthContext';
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

function AppContent() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
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
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <OnboardingWrapper />
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-fuchsia-500 via-purple-600 to-purple-800">
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#4A5568',
                color: '#fff',
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;