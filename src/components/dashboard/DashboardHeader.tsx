import React from 'react';
import { Button } from '../ui/Button';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  actionButton?: React.ReactNode;
  addDesktopTopPadding?: boolean;
}

export const DashboardHeader = ({
  title,
  description,
  actionButton,
  addDesktopTopPadding = false,
}: DashboardHeaderProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={`flex flex-col mb-6 mt-6 md:mt-0 pl-0.75 md:pl-0 ${addDesktopTopPadding ? 'md:pt-12' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{title}</h1>
        </div>
        {actionButton && <div>{actionButton}</div>}
      </div>
      {description && <p className="text-white/70 border-b border-white/20 pb-2 mb-4">{description}</p>}
    </div>
  );
};