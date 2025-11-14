import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/SupabaseAuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  // If user is logged in and tries to access public routes like login/register,
  // redirect them to dashboard
  if (currentUser && ['/login', '/register', '/auth'].some(path => window.location.pathname.startsWith(path))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
