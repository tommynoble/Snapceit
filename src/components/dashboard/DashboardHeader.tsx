import React from 'react';
import { TopNavbar } from './TopNavbar';

interface DashboardHeaderProps {
  title?: string;
  userName?: string;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title,
  userName,
  onProfileClick,
  onSettingsClick,
  onLogout
}) => {
  const displayTitle = userName ? `Welcome back ${userName}` : title;

  return (
    <div>
      <TopNavbar 
        onProfileClick={onProfileClick}
        onSettingsClick={onSettingsClick}
        onLogout={onLogout}
      />
      <div className="px-6 mt-4">
        <h1 className="text-2xl font-bold text-white">{displayTitle}</h1>
      </div>
    </div>
  );
};