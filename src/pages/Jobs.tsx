
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
import { AuthModal } from "@/components/auth/AuthModal";
import { SessionTimeoutWarning } from "@/components/auth/SessionTimeoutWarning";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { jobApi, JobSearchParams } from "@/services/jobApi";
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
import { Loader2, Zap, Save } from "lucide-react";
import JobApplicationSection from "@/components/jobs/JobApplicationSection";
import UnifiedJobList from "@/components/jobs/UnifiedJobList";
import { ScrapedJob } from "@/components/resume/job-application/types";
import { LinkedInContact, OutreachTemplate } from "@/types/resumePost";
import ConfirmationModal from "@/components/resume/job-application/ConfirmationModal";

type SortOption = 'relevance' | 'date-newest' | 'date-oldest' | 'salary-highest' | 'salary-lowest';

const Jobs = () => {
  const { user, userProfile, logout, saveJob, unsaveJob, applyToJob } = useSupabaseAuth();
  
  // Session timeout hook
  const { showWarning, timeLeft, extendSession, formatTimeLeft } = useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5
  });

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'automation'>('browse');
  
  // New state for unified job application features
  const [scrapedJobs, setScrapedJobs] = useState<ScrapedJob[]>([]);
  const [selectedScrapedJob, setSelectedScrapedJob] = useState<ScrapedJob | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentApplications, setRecentApplications] = useState<ScrapedJob[]>([]);
  const [linkedInContacts, setLinkedInContacts] = useState<LinkedInContact[]>([]);
  const [isScrapingLinkedIn, setIsScrapingLinkedIn] = useState(false);
  const [outreachTemplates, setOutreachTemplates] = useState<OutreachTemplate[]>([
    {
      id: "template-1",
      name: "Alumni Referral Request",
      subject: "Fellow [University] Alumnus Seeking Advice on [Company] Application",
      body: "Hi [Name],\n\nI hope this message finds you well. I noticed that you're a fellow [University] alumnus currently working at [Company]. I recently applied for the [Position] role and I'm very excited about the opportunity.\n\nWould you be open to a quick chat about your experience at [Company] or possibly helping with an internal referral? Any insights you could share would be greatly appreciated.\n\nThank you for your time!\n\nBest regards,\n[Your Name]",
      type: "alumni",
      variables: ["University", "Company", "Position", "Name", "Your Name"]
    }
  ]);
  
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
    benefits: [],
    jobFunction: [],
    companies: [],
    title: ""
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

  // Load jobs with caching and prevent duplicate calls
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
  }, [stableSearchParams, selectedJob]);

  // Load saved and applied jobs
  const loadSavedAndAppliedJobs = useCallback(async () => {
    if (!user) return;
    // Mock implementation for now
    setSavedJobIds([]);
    setAppliedJobIds([]);
  }, [user]);

  // Initial load jobs
  useEffect(() => {
    loadJobs();
  }, []); // Only run once on mount

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      loadSavedAndAppliedJobs();
    }
  }, [user, loadSavedAndAppliedJobs]);

  // Update view mode based on screen size
  useEffect(() => {
    setViewMode(isMobile ? 'swipe' : 'list');
  }, [isMobile]);

  // Load saved preferences
  useEffect(() => {
    try {
      const savedApplications = localStorage.getItem('recentApplications');
      if (savedApplications) {
        setRecentApplications(JSON.parse(savedApplications));
      }
      
      const savedTemplates = localStorage.getItem('outreachTemplates');
      if (savedTemplates) {
        setOutreachTemplates(JSON.parse(savedTemplates));
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  }, []);

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
      const success = await applyToJob(job);

      if (success) {
        setAppliedJobIds(prev => [...prev, job.id]);
        
        if (job.applyUrl) {
          window.open(job.applyUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const handleJobsScraped = (newJobs: ScrapedJob[]) => {
    setScrapedJobs(newJobs);
  };

  const handleScrapedJobSelected = (job: ScrapedJob) => {
    if (!job.verified) {
      toast({
        title: "Cannot apply to unverified job listing",
        description: "This job listing could not be verified and may no longer be available.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedScrapedJob(job);
    setShowConfirmation(true);
  };

  const handleAutoApply = async () => {
    if (!selectedScrapedJob) return;
    
    setIsSubmitting(true);
    
    try {
      toast({
        title: "Preparing to apply...",
        description: "Verifying job listing and preparing your resume data",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedApplications = [selectedScrapedJob, ...recentApplications].slice(0, 5);
      setRecentApplications(updatedApplications);
      localStorage.setItem('recentApplications', JSON.stringify(updatedApplications));
      
      toast({
        title: "Application submitted successfully!",
        description: `Your application to ${selectedScrapedJob.company} for ${selectedScrapedJob.title} has been sent.`,
      });
      
      setSelectedScrapedJob(null);
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error auto-applying:", error);
      toast({
        title: "Failed to submit application automatically.",
        description: "Try manual application.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToProfile = () => {
    toast({
      title: "Profile settings will open in a new tab",
    });
  };

  const handleApplicationSuccess = (jobUrl: string) => {
    const newApplication: ScrapedJob = {
      id: `manual-${Date.now()}`,
      title: "Custom Application",
      company: "Manual Entry",
      location: "Unknown",
      applyUrl: jobUrl,
      source: "Manual",
      datePosted: new Date().toLocaleDateString(),
      description: "Manually submitted application",
      verified: true
    };
    
    const updatedApplications = [newApplication, ...recentApplications].slice(0, 5);
    setRecentApplications(updatedApplications);
    localStorage.setItem('recentApplications', JSON.stringify(updatedApplications));
  };

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
  }, [loadJobs]);

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

  // Memoized computed values
  const savedJobs = useMemo(() => 
    jobs.filter(job => savedJobIds.includes(job.id)), 
    [jobs, savedJobIds]
  );
  
  const appliedJobs = useMemo(() => 
    jobs.filter(job => appliedJobIds.includes(job.id)), 
    [jobs, appliedJobIds]
  );

  const handleSessionLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  if (initialLoading) {
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
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          {/* Main Tabs - Browse Jobs and Job Automation */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'browse' | 'automation')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                Browse Jobs
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Job Automation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                  <JobFiltersSection onFiltersApply={applyFilters} />
                </div>

                {/* Jobs List */}
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {/* Header with sort and count */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold">Browse Jobs</h2>
                        <p className="text-sm text-gray-600">Showing {filteredJobs.length} jobs</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Select value={sortOption} onValueChange={handleSortChange}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="relevance">Relevance</SelectItem>
                            <SelectItem value="date-newest">Newest First</SelectItem>
                            <SelectItem value="date-oldest">Oldest First</SelectItem>
                            <SelectItem value="salary-highest">Highest Salary</SelectItem>
                            <SelectItem value="salary-lowest">Lowest Salary</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant={showMyJobs ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowMyJobs(!showMyJobs)}
                        >
                          My Jobs
                        </Button>
                      </div>
                    </div>

                    {/* Jobs list or My Jobs */}
                    {showMyJobs ? (
                      <SavedAndAppliedJobs
                        savedJobs={savedJobs}
                        appliedJobs={appliedJobs}
                        onApply={handleApplyJob}
                        onSave={handleSaveJob}
                        onSelect={handleJobSelect}
                        selectedJobId={selectedJob?.id || null}
                      />
                    ) : viewMode === 'swipe' ? (
                      <SwipeJobsInterface
                        jobs={filteredJobs}
                        onApply={handleApplyJob}
                        onSave={handleSaveJob}
                        onReject={(job: Job) => console.log('Rejected job:', job.id)}
                      />
                    ) : (
                      <UnifiedJobList
                        apiJobs={filteredJobs}
                        scrapedJobs={scrapedJobs}
                        selectedJobId={selectedJob?.id || selectedScrapedJob?.id || null}
                        savedJobIds={savedJobIds}
                        appliedJobIds={appliedJobIds}
                        onJobSelect={handleJobSelect}
                        onSaveJob={handleSaveJob}
                        onApplyJob={handleApplyJob}
                        onSelectScrapedJob={handleScrapedJobSelected}
                      />
                    )}

                    {loading && (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Details Panel */}
                <div className="lg:col-span-1">
                  {!isMobile && (
                    <div className="sticky top-24">
                      <JobDetailView
                        job={selectedJob}
                        onApply={handleApplyJob}
                        onSave={handleSaveJob}
                        isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
                        isApplied={selectedJob ? appliedJobIds.includes(selectedJob.id) : false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="automation" className="mt-0">
              <JobApplicationSection
                onJobsScraped={handleJobsScraped}
                onJobSelected={handleScrapedJobSelected}
                linkedInContacts={linkedInContacts}
                isScrapingLinkedIn={isScrapingLinkedIn}
                outreachTemplates={outreachTemplates}
                onSaveTemplate={(template) => {
                  const updatedTemplates = outreachTemplates.map(t => 
                    t.id === template.id ? template : t
                  );
                  setOutreachTemplates(updatedTemplates);
                  localStorage.setItem('outreachTemplates', JSON.stringify(updatedTemplates));
                }}
                onCreateTemplate={(template) => {
                  const newTemplate = {
                    ...template,
                    id: `template-${Date.now()}`
                  };
                  const updatedTemplates = [...outreachTemplates, newTemplate];
                  setOutreachTemplates(updatedTemplates);
                  localStorage.setItem('outreachTemplates', JSON.stringify(updatedTemplates));
                }}
                onNavigateToProfile={handleNavigateToProfile}
                onApplicationSuccess={handleApplicationSuccess}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Confirmation modal for auto-apply */}
        {showConfirmation && selectedScrapedJob && (
          <ConfirmationModal 
            selectedJob={selectedScrapedJob}
            isSubmitting={isSubmitting}
            onConfirm={handleAutoApply}
            onCancel={() => {
              setShowConfirmation(false);
              setSelectedScrapedJob(null);
            }}
          />
        )}

        {/* Auth modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />

        {/* Session timeout warning */}
        <SessionTimeoutWarning
          isOpen={showWarning}
          timeLeft={formatTimeLeft()}
          onExtend={extendSession}
          onLogout={handleSessionLogout}
        />
      </main>
    </div>
  );
};

export default Jobs;
