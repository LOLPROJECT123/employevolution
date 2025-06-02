import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { MobileRouteLayout } from "@/components/mobile/MobileRouteLayout";
import { AdvancedGestureHandler } from "@/components/mobile/AdvancedGestureHandler";
import { VoiceSearchButton } from "@/components/mobile/VoiceSearchButton";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { JobCard } from "@/components/JobCard";
import { SavedSearches } from "@/components/SavedSearches";
import { EnhancedJobScraper } from "@/components/jobs/EnhancedJobScraper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { realJobApiService } from "@/services/realJobApiService";
import { Job } from "@/types/job";

const Jobs = () => {
  const isMobile = useMobile();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const results = await realJobApiService.searchJobs({
        query: searchQuery || "software engineer",
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

  const handleJobsFound = (newJobs: Job[]) => {
    setJobs(newJobs);
  };

  const handleApplySearch = (search: any) => {
    setSearchQuery(search.query || '');
    // Apply other search filters
  };

  const handleDeleteSearch = (searchId: string) => {
    setSavedSearches(prev => prev.filter((s: any) => s.id !== searchId));
  };

  const handleVoiceSearch = (query: string) => {
    setSearchQuery(query);
    handleRefresh();
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

  const handleLongPress = () => {
    // Show job actions menu on long press
    console.log('Job long press - show actions menu');
  };

  const content = (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      
      <div className={`${!isMobile ? 'container mx-auto px-4 py-8' : 'p-0'} max-w-6xl`}>
        {!isMobile && (
          <div className="mb-6">
            <BreadcrumbNav />
          </div>
        )}
        
        {!isMobile && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Job Search</h1>
            <p className="text-muted-foreground">
              Find your next opportunity with our enhanced job search
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className={`${isMobile ? 'p-4' : 'mb-6'} space-y-4`}>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              />
            </div>
            <VoiceSearchButton onSearch={handleVoiceSearch} />
            <Button onClick={() => handleSearch(searchQuery)} size="icon">
              <Search className="h-4 w-4" />
            </Button>
            {isMobile && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`${isMobile ? (showFilters ? 'block' : 'hidden') : 'lg:col-span-1'}`}>
            <div className="space-y-6">
              {/* Simple filters placeholder */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Filters</h3>
                <p className="text-sm text-muted-foreground">Job filters coming soon</p>
              </div>
              <SavedSearches 
                searches={savedSearches}
                onApplySearch={handleApplySearch}
                onDeleteSearch={handleDeleteSearch}
              />
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {isMobile ? (
              <AdvancedGestureHandler
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onLongPress={handleLongPress}
                className="h-full"
              >
                <div className="p-4">
                  {jobs[currentJobIndex] && (
                    <JobCard job={jobs[currentJobIndex]} />
                  )}
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    {currentJobIndex + 1} of {jobs.length} jobs
                    <div className="text-xs mt-1">
                      Swipe left/right to navigate • Long press for options
                    </div>
                  </div>
                </div>
              </AdvancedGestureHandler>
            ) : (
              <div className="space-y-6">
                <EnhancedJobScraper onJobsFound={handleJobsFound} />
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
