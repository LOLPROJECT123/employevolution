
import { useState, useEffect, useRef } from 'react';
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { Job, JobFilters } from "@/types/job";
import { JobDetailView } from "@/components/JobDetailView";
import { JobFiltersSection } from "@/components/JobFilters";
import { EnhancedJobCard } from "@/components/jobs/EnhancedJobCard";
import { useIsMobile } from "@/hooks/use-mobile";
import SwipeJobsInterface from "@/components/SwipeJobsInterface";
import { SavedAndAppliedJobs } from "@/components/SavedAndAppliedJobs";
import { toast } from "@/hooks/use-toast";
import AutomationSettings from "@/components/AutomationSettings";
import { AuthModal } from "@/components/auth/AuthModal";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { jobApi, JobSearchParams } from "@/services/jobApi";
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
import { Loader2, User, LogOut, Bell, Save, TrendingUp, Zap } from "lucide-react";
import JobApplicationAutomation from "@/components/resume/JobApplicationAutomation";

type SortOption = 'relevance' | 'date-newest' | 'date-oldest' | 'salary-highest' | 'salary-lowest';

const Jobs = () => {
  const { user, userProfile, logout, saveJob, unsaveJob, applyToJob } = useSupabaseAuth();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [applicationMetrics, setApplicationMetrics] = useState<any>(null);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
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

  // Load initial jobs and user data
  useEffect(() => {
    loadJobs();
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Update view mode based on screen size
  useEffect(() => {
    setViewMode(isMobile ? 'swipe' : 'list');
  }, [isMobile]);

  // Load user's saved and applied jobs from Supabase
  useEffect(() => {
    if (user) {
      loadSavedAndAppliedJobs();
      loadNotificationCount();
    }
  }, [user]);

  const loadSavedAndAppliedJobs = async () => {
    if (!user) return;
    
    try {
      // Load saved job IDs
      const savedIds = await supabaseSavedJobsService.getSavedJobIds(user.id);
      setSavedJobIds(savedIds);
      
      // Load applied job IDs
      const applications = await supabaseApplicationService.getUserApplications(user.id);
      setAppliedJobIds(applications.map(app => app.job_id));
    } catch (error) {
      console.error('Error loading saved and applied jobs:', error);
    }
  };

  const loadNotificationCount = async () => {
    if (!user) return;
    
    try {
      const count = await supabaseNotificationService.getUnreadCount(user.id);
      setUnreadNotifications(count);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Load application metrics
      const metrics = await supabaseApplicationService.getApplicationMetrics(user.id);
      setApplicationMetrics(metrics);
      
      // Load active alerts count
      const alerts = jobAlertService.getAlerts(user.id);
      setActiveAlerts(alerts.filter(alert => alert.is_active).length);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadJobs = async (params: Partial<JobSearchParams> = {}) => {
    setLoading(true);
    try {
      const searchQuery = { ...searchParams, ...params };
      const response = await jobApi.searchJobs(searchQuery);
      setJobs(response.jobs);
      setFilteredJobs(response.jobs);
      
      if (response.jobs.length > 0 && !selectedJob) {
        setSelectedJob(response.jobs[0]);
      }

      // Check for job alerts if user is logged in
      if (user) {
        const alertMatches = await jobAlertService.checkAlertsForNewJobs(user.id, response.jobs);
        alertMatches.forEach(({ alert, matchingJobs }) => {
          jobAlertService.triggerNotification(user.id, alert, matchingJobs);
        });
      }
    } catch (error) {
      toast({
        title: "Failed to load jobs",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      // Check if job is still available
      const isAvailable = await jobApi.checkJobAvailability(job.applyUrl || '');
      
      if (!isAvailable) {
        toast({
          title: "Job no longer available",
          description: "This position has been filled or removed.",
          variant: "destructive",
        });
        return;
      }

      // Get user's default resume and cover letter
      const defaultResume = resumeService.getDefaultResume(user.id);
      const defaultCoverLetter = resumeService.getDefaultCoverLetter(user.id);

      // Submit application
      const success = await applyToJob(
        job,
        defaultResume?.name,
        defaultCoverLetter?.name,
        `Applied via job search platform to ${job.company}`
      );

      if (success) {
        setAppliedJobIds(prev => [...prev, job.id]);
        
        // Refresh user data
        loadUserData();
        loadNotificationCount();
        
        // Open application URL if available
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

  const handleSearch = (query: string) => {
    const newParams = { ...searchParams, query, page: 1 };
    setSearchParams(newParams);
    loadJobs(newParams);
  };

  const applyFilters = (filters: JobFilters) => {
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
  };

  const sortJobs = (option: SortOption) => {
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
  };

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
    sortJobs(value as SortOption);
  };

  // Get saved and applied jobs for display
  const savedJobs = jobs.filter(job => savedJobIds.includes(job.id));
  const appliedJobs = jobs.filter(job => appliedJobIds.includes(job.id));

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900/30">
        {!isMobile && <Navbar />}
        {isMobile && <MobileHeader />}
        <main className={`flex-1 ${isMobile ? 'pt-16' : 'pt-20'} flex items-center justify-center`}>
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900/30">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader />}
      
      <main className={`flex-1 ${isMobile ? 'pt-16' : 'pt-20'}`}>
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Find Your Next Opportunity
            </h1>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Welcome, {userProfile?.full_name || user.email}</span>
                    {activeAlerts > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-600">
                        <Bell className="w-3 h-3 mr-1" />
                        {activeAlerts} alerts
                      </Badge>
                    )}
                    {unreadNotifications > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-600">
                        {unreadNotifications} new
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setAuthModalOpen(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
              
              <div className="hidden md:block">
                <AutomationSettings />
              </div>
            </div>
          </div>

          {/* Application Metrics Dashboard */}
          {user && applicationMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Applied</p>
                      <p className="text-2xl font-bold">{applicationMetrics.totalApplications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-gray-600">Response Rate</p>
                    <p className="text-2xl font-bold text-green-600">{applicationMetrics.responseRate.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-gray-600">Interview Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{applicationMetrics.interviewRate.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-gray-600">Offer Rate</p>
                    <p className="text-2xl font-bold text-orange-600">{applicationMetrics.offerRate.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList>
              <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
              <TabsTrigger value="automation">
                <Zap className="w-4 h-4 mr-2" />
                Job Automation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse">
              {/* Enhanced Job Filtering */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold text-lg">Filter Jobs</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Find jobs that match your preferences</p>
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
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-semibold text-lg">My Jobs</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Saved and Applied Positions</p>
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
              
              {/* Job Browser */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Card className="overflow-hidden h-full max-h-[calc(100vh-250px)]">
                    <CardHeader className="py-3 px-4 border-b flex flex-row justify-between items-center">
                      <div>
                        <CardTitle className="text-base font-medium">Browse Jobs</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Showing {filteredJobs.length} jobs
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select defaultValue={sortOption} onValueChange={handleSortChange}>
                          <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 h-8 text-sm">
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
                    
                    <CardContent className="p-0 divide-y overflow-y-auto max-h-[calc(100vh-300px)]">
                      {filteredJobs.map(job => (
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
                      ))}
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
            </TabsContent>

            <TabsContent value="automation">
              <JobApplicationAutomation />
            </TabsContent>
          </Tabs>
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
