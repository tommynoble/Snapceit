import React from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { ExpenseCard } from '../../components/dashboard/ExpenseCard';
import { UploadReceiptCard } from '../../components/dashboard/UploadReceiptCard';

export const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <DashboardHeader userName="Thomas" onProfileClick={() => {}} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ExpenseCard />
        <UploadReceiptCard />
        {/* Add more dashboard cards here */}
      </div>
    </div>
  );
};
