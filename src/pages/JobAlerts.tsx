
import React from 'react';
import Navbar from "@/components/Navbar";
import { useMobile } from "@/hooks/use-mobile";
import { MobileRouteLayout } from "@/components/mobile/MobileRouteLayout";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { JobAlertsManager } from '@/components/job-alerts/JobAlertsManager';

const JobAlerts = () => {
  const isMobile = useMobile();

  const handleRefresh = async () => {
    console.log('Refreshing job alerts...');
    // Implement refresh logic
  };

  const content = (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {!isMobile && (
        <div className="mb-6">
          <BreadcrumbNav />
        </div>
      )}
      
      {!isMobile && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Alerts</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest job opportunities that match your preferences
          </p>
        </div>
      )}
      
      <JobAlertsManager />
    </div>
  );

  if (isMobile) {
    return (
      <MobileRouteLayout
        title="Job Alerts"
        onRefresh={handleRefresh}
        className="bg-background"
      >
        {content}
      </MobileRouteLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {content}
      </div>
    </div>
  );
};

export default JobAlerts;
