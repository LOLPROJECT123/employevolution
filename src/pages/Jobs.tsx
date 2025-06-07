import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { Job, JobFilters } from "@/types/job";
import { JobDetailView } from "@/components/JobDetailView";
import { JobFiltersSection } from "@/components/JobFilters";
import { useIsMobile } from "@/hooks/use-mobile";
import SwipeJobsInterface from "@/components/SwipeJobsInterface";
import { SavedAndAppliedJobs } from "@/components/SavedAndAppliedJobs";
import { toast } from "@/hooks/use-toast";
import AutomationSettings from "@/components/AutomationSettings";
import { AuthModal } from "@/components/auth/AuthModal";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { jobApi, JobSearchParams } from "@/services/jobApi";
import { automaticJobScraperService } from "@/services/automaticJobScraperService";
import { supabaseApplicationService } from "@/services/supabaseApplicationService";
import { supabaseSavedJobsService } from "@/services/supabaseSavedJobsService";
import { savedSearchService } from "@/services/savedSearchService";
import { resumeService } from "@/services/resumeService";
import { jobAlertService } from "@/services/jobAlertService";
import { supabaseNotificationService } from "@/services/supabaseNotificationService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Bell, Save, TrendingUp, RefreshCw, Zap } from "lucide-react";
import EnhancedJobCard from "@/components/jobs/EnhancedJobCard";

type SortOption = 'relevance' | 'date-newest' | 'date-oldest' | 'salary-highest' | 'salary-lowest';

const Jobs = () => {
  const { user, userProfile, logout, saveJob, unsaveJob, applyToJob } = useSupabaseAuth();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [autoScrapingActive, setAutoScrapingActive] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [applicationMetrics, setApplicationMetrics] = useState<any>(null);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [scrapedJobsCount, setScrapedJobsCount] = useState(0);
  
  // Stable search parameters with proper memoization
  const [searchParams, setSearchParams] = useState<JobSearchParams>({
    query: '',
    location: '',
    page: 1,
    limit: 20
  });
  
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'list' | 'swipe'>(isMobile ? 'swipe' : 'list');
  const [showMyJobs, setShowMyJobs] = useState(false);
  const [activeFilters, setActiveFilters] = useState<JobFilters>({
    search: "",
    location: "",
    jobType: [],
    remote: false,
    experienceLevels: [],
    education: [],
    salaryRange: [0, 300000],
    skills: [],
    companyTypes: [],
    companySize: [],
    benefits: []
  });

  // Prevent multiple simultaneous API calls
  const loadingRef = useRef(false);

  // Memoized search parameters to prevent unnecessary re-renders
  const stableSearchParams = useMemo(() => searchParams, [
    searchParams.query,
    searchParams.location,
    searchParams.page,
    searchParams.limit,
    searchParams.remote
  ]);

  // Automatic job scraping on page load
  const startAutoScraping = useCallback(async (query?: string, location?: string) => {
    if (autoScrapingActive) return;
    
    setAutoScrapingActive(true);
    setLoading(true);
    
    try {
      console.log('Starting automatic job scraping...');
      toast({
        title: "🚀 Finding Amazing Jobs",
        description: "Searching across LinkedIn, Indeed, ATS systems, and more platforms...",
      });

      const scrapedJobs = await automaticJobScraperService.startAutoScraping(
        query || activeFilters.search || 'Software Engineer',
        location || activeFilters.location || 'Austin, TX'
      );

      if (scrapedJobs.length > 0) {
        setJobs(prev => {
          const newJobs = [...prev, ...scrapedJobs];
          const uniqueJobs = newJobs.filter((job, index, self) => 
            index === self.findIndex(j => j.id === job.id)
          );
          return uniqueJobs;
        });
        
        setFilteredJobs(prev => {
          const newJobs = [...prev, ...scrapedJobs];
          const uniqueJobs = newJobs.filter((job, index, self) => 
            index === self.findIndex(j => j.id === job.id)
          );
          return uniqueJobs;
        });

        setScrapedJobsCount(scrapedJobs.length);

        if (!selectedJob && scrapedJobs.length > 0) {
          setSelectedJob(scrapedJobs[0]);
        }

        toast({
          title: "✅ Jobs Found!",
          description: `Found ${scrapedJobs.length} new opportunities from multiple platforms. Check them out!`,
        });
      } else {
        toast({
          title: "🔍 No new jobs found",
          description: "Try adjusting your search criteria for better results.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Auto scraping error:', error);
      toast({
        title: "⚠️ Scraping paused",
        description: "Unable to find new jobs right now. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setAutoScrapingActive(false);
      setLoading(false);
    }
  }, [autoScrapingActive, activeFilters.search, activeFilters.location, selectedJob]);
  
  const loadJobs = useCallback(async (params: Partial<JobSearchParams> = {}) => {
    if (loadingRef.current) {
      console.log('Skipping duplicate job load request');
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    
    try {
      const searchQuery = { ...stableSearchParams, ...params };
      console.log('Loading jobs with params:', searchQuery);
      
      const response = await jobApi.searchJobs(searchQuery);
      setJobs(response.jobs);
      setFilteredJobs(response.jobs);
      
      if (response.jobs.length > 0 && !selectedJob) {
        setSelectedJob(response.jobs[0]);
      }

      // Check for job alerts if user is logged in
      if (user) {
        try {
          const alertMatches = await jobAlertService.checkAlertsForNewJobs(user.id, response.jobs);
          alertMatches.forEach(({ alert, matchingJobs }) => {
            jobAlertService.triggerNotification(user.id, alert, matchingJobs);
          });
        } catch (error) {
          console.error('Error checking job alerts:', error);
        }
      }

      // Start automatic scraping after initial load
      if (!autoScrapingActive) {
        setTimeout(() => {
          startAutoScraping(searchQuery.query, searchQuery.location);
        }, 1000);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Failed to load jobs",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
      loadingRef.current = false;
    }
  }, [stableSearchParams, selectedJob, user, autoScrapingActive, startAutoScraping]);

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      const metrics = await supabaseApplicationService.getApplicationMetrics(user.id);
      setApplicationMetrics(metrics);
      
      const alerts = jobAlertService.getAlerts(user.id);
      setActiveAlerts(alerts.filter(alert => alert.is_active).length);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [user]);

  // Load saved and applied jobs
  const loadSavedAndAppliedJobs = useCallback(async () => {
    if (!user) return;
    
    try {
      const savedIds = await supabaseSavedJobsService.getSavedJobIds(user.id);
      setSavedJobIds(savedIds);
      
      const applications = await supabaseApplicationService.getUserApplications(user.id);
      setAppliedJobIds(applications.map(app => app.job_id));
    } catch (error) {
      console.error('Error loading saved and applied jobs:', error);
    }
  }, [user]);

  // Load notification count
  const loadNotificationCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const count = await supabaseNotificationService.getUnreadCount(user.id);
      setUnreadNotifications(count);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  }, [user]);

  // Initial load jobs
  useEffect(() => {
    loadJobs();
  }, []); // Only run once on mount

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
      loadSavedAndAppliedJobs();
      loadNotificationCount();
    }
  }, [user, loadUserData, loadSavedAndAppliedJobs, loadNotificationCount]);

  // Update view mode based on screen size
  useEffect(() => {
    setViewMode(isMobile ? 'swipe' : 'list');
  }, [isMobile]);

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  const handleSaveJob = async (job: Job) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const isCurrentlySaved = savedJobIds.includes(job.id);
    
    if (isCurrentlySaved) {
      const success = await unsaveJob(job.id);
      if (success) {
        setSavedJobIds(prev => prev.filter(id => id !== job.id));
      }
    } else {
      const success = await saveJob(job);
      if (success) {
        setSavedJobIds(prev => [...prev, job.id]);
      }
    }
  };

  const handleApplyJob = async (job: Job) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (appliedJobIds.includes(job.id)) {
      toast({
        title: "Already applied",
        description: "You have already applied to this job.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isAvailable = await jobApi.checkJobAvailability(job.applyUrl || '');
      
      if (!isAvailable) {
        toast({
          title: "Job no longer available",
          description: "This position has been filled or removed.",
          variant: "destructive",
        });
        return;
      }

      const defaultResume = resumeService.getDefaultResume(user.id);
      const defaultCoverLetter = resumeService.getDefaultCoverLetter(user.id);

      const success = await applyToJob(
        job,
        defaultResume?.name,
        defaultCoverLetter?.name,
        `Applied via job search platform to ${job.company}`
      );

      if (success) {
        setAppliedJobIds(prev => [...prev, job.id]);
        loadUserData();
        loadNotificationCount();
        
        if (job.applyUrl) {
          window.open(job.applyUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const handleSaveSearch = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const searchName = `Search: ${activeFilters.search || 'All jobs'} in ${activeFilters.location || 'All locations'}`;
    
    try {
      await savedSearchService.saveSearch(searchName, activeFilters, user.id);
      toast({
        title: "Search saved",
        description: "You can access this search from your saved searches.",
      });
    } catch (error) {
      toast({
        title: "Failed to save search",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = useCallback((query: string) => {
    const newParams = { ...searchParams, query, page: 1 };
    setSearchParams(newParams);
    loadJobs(newParams);
  }, [searchParams, loadJobs]);

  const applyFilters = useCallback((filters: JobFilters) => {
    setActiveFilters(filters);
    
    const searchQuery: JobSearchParams = {
      query: filters.search,
      location: filters.location,
      remote: filters.remote,
      salary_min: filters.salaryRange[0] > 0 ? filters.salaryRange[0] : undefined,
      salary_max: filters.salaryRange[1] < 300000 ? filters.salaryRange[1] : undefined,
      job_type: filters.jobType.length > 0 ? filters.jobType[0] : undefined,
      experience_level: filters.experienceLevels.length > 0 ? filters.experienceLevels[0] : undefined,
      page: 1
    };
    
    setSearchParams(searchQuery);
    loadJobs(searchQuery);
    
    // Trigger auto scraping with new filters
    if (!autoScrapingActive) {
      startAutoScraping(filters.search, filters.location);
    }
  }, [loadJobs, autoScrapingActive, startAutoScraping]);

  const sortJobs = useCallback((option: SortOption) => {
    let sortedJobs = [...filteredJobs];
    
    switch (option) {
      case 'relevance':
        sortedJobs.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
        break;
      case 'date-newest':
        sortedJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
        break;
      case 'date-oldest':
        sortedJobs.sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime());
        break;
      case 'salary-highest':
        sortedJobs.sort((a, b) => b.salary.max - a.salary.max);
        break;
      case 'salary-lowest':
        sortedJobs.sort((a, b) => a.salary.min - b.salary.min);
        break;
    }
    
    setFilteredJobs(sortedJobs);
    if (sortedJobs.length > 0) {
      setSelectedJob(sortedJobs[0]);
    }
  }, [filteredJobs]);

  const handleSortChange = useCallback((value: string) => {
    setSortOption(value as SortOption);
    sortJobs(value as SortOption);
  }, [sortJobs]);

  const handleRefreshJobs = () => {
    if (!autoScrapingActive) {
      startAutoScraping(activeFilters.search, activeFilters.location);
    }
  };

  // Memoized computed values
  const savedJobs = useMemo(() => 
    jobs.filter(job => savedJobIds.includes(job.id)), 
    [jobs, savedJobIds]
  );
  
  const appliedJobs = useMemo(() => 
    jobs.filter(job => appliedJobIds.includes(job.id)), 
    [jobs, appliedJobIds]
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isMobile && <Navbar />}
        {isMobile && <MobileHeader />}
        <main className={`flex-1 ${isMobile ? 'pt-16' : 'pt-20'} flex items-center justify-center`}>
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading jobs and starting automatic job discovery...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader />}
      
      <main className={`flex-1 ${isMobile ? 'pt-16' : 'pt-20'}`}>
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          {/* Header section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Find Your Next Opportunity
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <AutomationSettings />
              </div>
            </div>
          </div>

          {/* Auto-scraping status */}
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {autoScrapingActive ? (
                      <Loader2 className="h-5 w-5 animate-spin text-green-600 dark:text-green-400" />
                    ) : (
                      <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200">
                        {autoScrapingActive ? '🚀 Discovering Fresh Jobs...' : '✅ Automatic Job Discovery Complete'}
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        {autoScrapingActive 
                          ? 'Searching LinkedIn, Indeed, ATS systems (Greenhouse, Lever, iCims), and more...'
                          : `Found ${jobs.length} total jobs${scrapedJobsCount > 0 ? ` (${scrapedJobsCount} newly discovered)` : ''} from multiple platforms`
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefreshJobs}
                    disabled={autoScrapingActive}
                    className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {autoScrapingActive ? 'Searching...' : 'Find More Jobs'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics dashboard */}
          {user && applicationMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Applied</p>
                      <p className="text-2xl font-bold text-foreground">{applicationMetrics.totalApplications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{applicationMetrics.responseRate.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Interview Rate</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{applicationMetrics.interviewRate.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Offer Rate</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{applicationMetrics.offerRate.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-lg text-card-foreground">Filter Jobs</h2>
                    <p className="text-sm text-muted-foreground">Find jobs that match your preferences</p>
                  </div>
                  {user && (
                    <Button variant="outline" size="sm" onClick={handleSaveSearch}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Search
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-4">
                <JobFiltersSection onApplyFilters={applyFilters} />
              </div>
            </div>

            {user && (
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-lg text-card-foreground">My Jobs</h2>
                  <p className="text-sm text-muted-foreground">Saved and Applied Positions</p>
                </div>
                <div className="p-4">
                  <SavedAndAppliedJobs
                    savedJobs={savedJobs}
                    appliedJobs={appliedJobs}
                    onApply={handleApplyJob}
                    onSave={handleSaveJob}
                    onSelect={handleJobSelect}
                    selectedJobId={selectedJob?.id || null}
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Card className="overflow-hidden h-full max-h-[calc(100vh-250px)]">
                  <CardHeader className="py-3 px-4 border-b flex flex-row justify-between items-center">
                    <div>
                      <CardTitle className="text-base font-medium">
                        🎯 Browse Jobs 
                        {scrapedJobsCount > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                            {scrapedJobsCount} New
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Showing {filteredJobs.length} jobs from multiple platforms
                        {(loading || autoScrapingActive) && <span className="ml-2 text-blue-600 dark:text-blue-400 animate-pulse">• Finding more...</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue={sortOption} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[180px] bg-background h-8 text-sm">
                          <SelectValue placeholder="Sort By: Relevance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Sort By: Relevance</SelectItem>
                          <SelectItem value="date-newest">Date: Newest First</SelectItem>
                          <SelectItem value="date-oldest">Date: Oldest First</SelectItem>
                          <SelectItem value="salary-highest">Salary: Highest First</SelectItem>
                          <SelectItem value="salary-lowest">Salary: Lowest First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0 divide-y divide-border overflow-y-auto max-h-[calc(100vh-300px)]">
                    {filteredJobs.length === 0 && !loading && !autoScrapingActive ? (
                      <div className="p-6 text-center">
                        <p className="text-muted-foreground mb-4">No jobs found. Let's discover some opportunities!</p>
                        <Button onClick={handleRefreshJobs} className="bg-green-600 hover:bg-green-700">
                          <Zap className="w-4 h-4 mr-2" />
                          Start Job Discovery
                        </Button>
                      </div>
                    ) : (
                      filteredJobs.map(job => (
                        <div key={job.id} className="p-4">
                          <EnhancedJobCard 
                            job={job}
                            onApply={handleApplyJob}
                            onSave={handleSaveJob}
                            onSelect={handleJobSelect}
                            isSelected={selectedJob?.id === job.id}
                            isSaved={savedJobIds.includes(job.id)}
                            isApplied={appliedJobIds.includes(job.id)}
                            variant="list"
                          />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="h-full max-h-[calc(100vh-250px)] overflow-hidden">
                  <CardContent className="p-0">
                    <JobDetailView 
                      job={selectedJob} 
                      onApply={handleApplyJob}
                      onSave={handleSaveJob}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
};

export default Jobs;
