import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!user) {
    // Redirect to home page where auth is handled
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
