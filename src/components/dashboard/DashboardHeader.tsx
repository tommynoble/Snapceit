import React from 'react';
import { TopNavbar } from './TopNavbar';

interface DashboardHeaderProps {
  userName: string;
  onProfileClick: () => void;
}

export const DashboardHeader = ({ userName, onProfileClick }: DashboardHeaderProps) => {
  return (
    <div className="mt-2">
      <TopNavbar onProfileClick={onProfileClick} />
      <div className="h-px bg-white/5 mt-1"></div>
      <h1 className="text-3xl font-bold text-white py-2">
        Welcome back, {userName}!
      </h1>
    </div>
  );
};