import React from 'react';
import { Button } from '../ui/Button';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  actionButton?: React.ReactNode;
}

export const DashboardHeader = ({
  title,
  description,
  actionButton,
}: DashboardHeaderProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-white/70">{description}</p>}
      </div>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};