
import React from 'react';
import Navbar from '@/components/Navbar';
import MobileHeader from '@/components/MobileHeader';
import { useMobile } from '@/hooks/use-mobile';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

const Analytics: React.FC = () => {
  const isMobile = useMobile();

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader />}
      
      <main className="flex-1 pt-20">
        <div className="container px-4 py-8">
          <AnalyticsDashboard />
        </div>
      </main>
    </div>
  );
};

export default Analytics;
