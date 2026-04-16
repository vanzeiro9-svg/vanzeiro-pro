import { ReactNode } from 'react';
import BottomNav from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionLock from './SubscriptionLock';
import { useLocation } from 'react-router-dom';
import { isMasterAccount } from '@/lib/masterAccount';

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { profile, user } = useAuth();
  const location = useLocation();
  const isMasterLogin = isMasterAccount(user);
  const isInactive = !isMasterLogin && !!profile && profile.subscription_status !== 'active';
  const shouldShowLock = isInactive && location.pathname === '/dashboard';

  return (
    <div className={`min-h-screen bg-background pb-20 ${shouldShowLock ? 'h-screen overflow-hidden' : ''}`}>
      <main className="max-w-lg mx-auto px-4 pt-4">
        {children}
      </main>
      <BottomNav />
      {shouldShowLock && <SubscriptionLock />}
    </div>
  );
};

export default AppLayout;
