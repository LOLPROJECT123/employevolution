
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { MobileRouteLayout } from "@/components/mobile/MobileRouteLayout";
import { AdvancedGestureHandler } from "@/components/mobile/AdvancedGestureHandler";
import { JobCard } from "@/components/JobCard";
import { JobFilters } from "@/components/JobFilters";
import { SavedSearches } from "@/components/SavedSearches";
import { EnhancedJobScraper } from "@/components/jobs/EnhancedJobScraper";
import { realJobApiService } from "@/services/realJobApiService";
import { Job } from "@/types/job";

const Jobs = () => {
  const isMobile = useMobile();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const results = await realJobApiService.searchJobs({
        query: "software engineer",
        location: "remote",
        limit: 20
      });
      
      const allJobs = results.flatMap(result => result.jobs);
      setJobs(allJobs);
    } catch (error) {
      console.error('Failed to refresh jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = () => {
    if (currentJobIndex < jobs.length - 1) {
      setCurrentJobIndex(prev => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentJobIndex > 0) {
      setCurrentJobIndex(prev => prev - 1);
    }
  };

  const content = (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      
      <div className={`${!isMobile ? 'container mx-auto px-4 py-8' : 'p-0'} max-w-6xl`}>
        {!isMobile && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Job Search</h1>
            <p className="text-muted-foreground">
              Find your next opportunity with our enhanced job search
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`${isMobile ? 'hidden' : 'lg:col-span-1'}`}>
            <div className="space-y-6">
              <JobFilters />
              <SavedSearches />
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {isMobile ? (
              <AdvancedGestureHandler
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                className="h-full"
              >
                <div className="p-4">
                  {jobs[currentJobIndex] && (
                    <JobCard job={jobs[currentJobIndex]} />
                  )}
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    {currentJobIndex + 1} of {jobs.length} jobs
                  </div>
                </div>
              </AdvancedGestureHandler>
            ) : (
              <div className="space-y-6">
                <EnhancedJobScraper />
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileRouteLayout
        title="Jobs"
        onRefresh={handleRefresh}
        className="bg-background"
      >
        {content}
      </MobileRouteLayout>
    );
  }

  return content;
};

export default Jobs;
