import React from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';

export const TaxCalculator = () => {
  return (
    <div className="space-y-6">
      <DashboardHeader userName="Thomas" onProfileClick={() => {}} />
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Tax Calculator</h2>
        {/* Add your tax calculator components here */}
      </div>
    </div>
  );
};
