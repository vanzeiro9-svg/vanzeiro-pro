import { ReactNode } from 'react';
import BottomNav from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionLock from './SubscriptionLock';

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth();
  const isInactive = profile && profile.subscription_active === false;

  return (
    <div className={`min-h-screen bg-background pb-20 ${isInactive ? 'h-screen overflow-hidden' : ''}`}>
      <main className="max-w-lg mx-auto px-4 pt-4">
        {children}
      </main>
      <BottomNav />
      {isInactive && <SubscriptionLock />}
    </div>
  );
};

export default AppLayout;
