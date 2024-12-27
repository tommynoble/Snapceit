import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/CognitoAuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  // If user is logged in and tries to access public routes like login/register,
  // redirect them to dashboard
  if (user && window.location.pathname.startsWith('/auth')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
