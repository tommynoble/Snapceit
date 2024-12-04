import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { OnboardingSlide } from './components/onboarding/OnboardingSlide';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { ReceiptProvider } from './components/dashboard/receipts/ReceiptContext';
import { AuthProvider, useAuth } from './firebase/AuthContext';
import { Onboarding } from './components/onboarding/OnboardingQuestionnaire';

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
      onLoginClick={() => navigate('/login')} 
      onBackClick={() => navigate('/')} 
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
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <OnboardingSlide />
          </PublicRoute>
        } />
        
        <Route path="/onboarding" element={
          <PublicRoute>
            <OnboardingWrapper />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <RegisterFormWrapper />
          </PublicRoute>
        } />
        
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <ReceiptProvider>
              <DashboardLayout />
            </ReceiptProvider>
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;