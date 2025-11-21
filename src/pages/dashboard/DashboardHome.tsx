import React, { useMemo } from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { UploadReceiptCard } from '../../components/dashboard/upload/UploadReceiptCard';
import { RecentReceiptsCard } from '../../components/dashboard/receipts/RecentReceiptsCard';
import { SpendingOverviewCard } from '../../components/dashboard/spending/SpendingOverviewCard';
import { useAuth } from '../../auth/SupabaseAuthContext';

interface DashboardHomeProps {
  onProfileClick?: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onProfileClick }) => {
  const { currentUser } = useAuth();
  
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const userName = currentUser?.user_metadata?.full_name?.split(' ')[0] || 'there';
    
    let timeGreeting = '';
    if (hour < 12) timeGreeting = '🌅 Good morning';
    else if (hour < 18) timeGreeting = '☀️ Good afternoon';
    else timeGreeting = '🌙 Good evening';
    
    const messages = [
      `${timeGreeting}, ${userName}! Ready to track your expenses?`,
      `${timeGreeting}, ${userName}! Let's organize your receipts.`,
      `${timeGreeting}, ${userName}! Time to review your spending?`,
      `${timeGreeting}, ${userName}! Keep your finances in check.`,
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <div className="mt-8">
        <div className="pl-0.75 md:pl-0">
          <h2 className="text-3xl font-extrabold text-white mb-2">{greeting}</h2>
          <p className="text-white/60">Track, categorize, and optimize your spending</p>
        </div>
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
