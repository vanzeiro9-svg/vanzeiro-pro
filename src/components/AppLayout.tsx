import { ReactNode } from 'react';
import BottomNav from './BottomNav';

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-lg mx-auto px-4 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
