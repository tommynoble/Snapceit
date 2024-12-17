import React from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';

export const SpendingHabits = () => {
  return (
    <div className="space-y-6">
      <DashboardHeader userName="Thomas" onProfileClick={() => {}} />
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Spending Habits</h2>
        {/* Add your spending habits analytics components here */}
      </div>
    </div>
  );
};
