import React from 'react';
import { UploadReceiptCard } from '../../components/dashboard/upload/UploadReceiptCard';
import { RecentReceiptsCard } from '../../components/dashboard/receipts/RecentReceiptsCard';
import { SpendingOverviewCard } from '../../components/dashboard/spending/SpendingOverviewCard';

interface DashboardHomeProps {
  onProfileClick?: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = () => {
  return (
    <div className="space-y-6">
      <div className="mt-8">
        {/* Greeting handled by DashboardLayout */}
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UploadReceiptCard />
          <SpendingOverviewCard />
        </div>
        <RecentReceiptsCard limit={5} />
      </div>
    </div>
  );
};
