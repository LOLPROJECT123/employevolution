
import React from 'react';
import { JobAlertsManager } from '@/components/job-alerts/JobAlertsManager';
import MobileHeader from '@/components/MobileHeader';
import Navbar from '@/components/Navbar';
import { useIsMobile } from '@/hooks/use-mobile';

const JobAlerts = () => {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? <MobileHeader /> : <Navbar />}
      <div className={`container mx-auto px-4 py-8 max-w-6xl ${isMobile ? 'mt-14' : ''}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Alerts</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest job opportunities that match your preferences
          </p>
        </div>
        
        <JobAlertsManager />
      </div>
    </>
  );
};

export default JobAlerts;
