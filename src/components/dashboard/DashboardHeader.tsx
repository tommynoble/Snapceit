import React from 'react';

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header>
      <h1 className="text-4xl font-bold text-white">
        Welcome back, {userName}!
      </h1>
    </header>
  );
}