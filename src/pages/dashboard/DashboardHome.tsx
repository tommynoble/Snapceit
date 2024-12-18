import React from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { UploadReceiptCard } from '../../components/dashboard/upload/UploadReceiptCard';
import { RecentReceiptsCard } from '../../components/dashboard/receipts/RecentReceiptsCard';
import { SpendingOverviewCard } from '../../components/dashboard/spending/SpendingOverviewCard';

interface DashboardHomeProps {
  onProfileClick?: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onProfileClick }) => {
  return (
    <div className="space-y-6">
      <div className="mt-8">
        <DashboardHeader 
          userName="Thomas"
          onProfileClick={onProfileClick}
        />
      </div>
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UploadReceiptCard />
          <SpendingOverviewCard />
        </div>
        <RecentReceiptsCard />
      </div>
    </div>
  );
};
