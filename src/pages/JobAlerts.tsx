
import React from 'react';
import { JobAlertsManager } from '@/components/job-alerts/JobAlertsManager';
import MobileHeader from '@/components/MobileHeader';

const JobAlerts = () => {
  return (
    <>
      <MobileHeader title="Job Alerts" showLogo={false} />
      <div className="container mx-auto px-4 py-8 max-w-6xl mt-14">
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
